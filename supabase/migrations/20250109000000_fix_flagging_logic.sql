-- Fix flagging logic:
-- 1. ONE flag sends post to moderation queue
-- 2. THREE flags hide post from client side (but still visible in moderation)
-- 3. Users are NOT notified of moderation actions

-- Drop existing function if it exists
drop function if exists public.flag_post(bigint);

-- Create or replace the flag_post function
create or replace function public.flag_post(post_to_flag_id bigint)
returns json
language plpgsql
security definer
as $$
declare
  v_user_id uuid;
  v_current_flags integer;
  v_already_flagged boolean;
  v_needs_moderation boolean;
begin
  -- Get the current user
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Check if user has already flagged this post
  select exists(
    select 1 from public.post_flags
    where post_id = post_to_flag_id
    and user_id = v_user_id
  ) into v_already_flagged;

  if v_already_flagged then
    return json_build_object('success', false, 'message', 'Already flagged');
  end if;

  -- Insert the flag
  insert into public.post_flags (post_id, user_id, created_at)
  values (post_to_flag_id, v_user_id, now());

  -- Update flag count and get current count
  update public.posts
  set flag_count = flag_count + 1
  where id = post_to_flag_id
  returning flag_count into v_current_flags;

  -- RULE 1: Even ONE flag sends to moderation queue
  -- Set needs_moderation to true on first flag
  if v_current_flags = 1 then
    update public.posts
    set needs_moderation = true
    where id = post_to_flag_id;
  end if;

  -- RULE 2: THREE flags hide post from client side
  -- Set is_public to false after 3 flags (but keep in moderation queue)
  if v_current_flags >= 3 then
    update public.posts
    set
      is_public = false,
      needs_moderation = true
    where id = post_to_flag_id;
  end if;

  -- RULE 3: No user notifications
  -- (We don't insert any notifications - moderators handle this manually)

  return json_build_object(
    'success', true,
    'flag_count', v_current_flags,
    'in_moderation', true,
    'hidden_from_public', v_current_flags >= 3
  );
end;
$$;

-- Ensure the posts table has the necessary columns
-- (Add them if they don't exist)
do $$
begin
  -- Add needs_moderation column if it doesn't exist
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
    and table_name = 'posts'
    and column_name = 'needs_moderation'
  ) then
    alter table public.posts add column needs_moderation boolean default false;
  end if;

  -- Add is_public column if it doesn't exist
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
    and table_name = 'posts'
    and column_name = 'is_public'
  ) then
    alter table public.posts add column is_public boolean default true;
  end if;

  -- Add flag_count column if it doesn't exist
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
    and table_name = 'flag_count'
    and column_name = 'flag_count'
  ) then
    alter table public.posts add column flag_count integer default 0;
  end if;
end $$;

-- Create post_flags table if it doesn't exist
create table if not exists public.post_flags (
  id bigserial primary key,
  post_id bigint not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(post_id, user_id)
);

-- Create index for faster lookups
create index if not exists idx_post_flags_post_id on public.post_flags(post_id);
create index if not exists idx_post_flags_user_id on public.post_flags(user_id);
create index if not exists idx_posts_needs_moderation on public.posts(needs_moderation) where needs_moderation = true;
create index if not exists idx_posts_is_public on public.posts(is_public);

-- Grant necessary permissions
grant select, insert on public.post_flags to authenticated;
grant usage on sequence public.post_flags_id_seq to authenticated;

-- Add comment
comment on function public.flag_post is 'Flag a post: 1 flag = moderation queue, 3 flags = hidden from public';
