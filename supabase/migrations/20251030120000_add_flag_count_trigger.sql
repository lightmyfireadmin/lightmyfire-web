create function public.increment_flag_count()
returns trigger
language plpgsql
as $$
begin
  new.flag_count := 0;
  return new;
end;
$$;

create trigger increment_flag_count_trigger
before insert on public.posts
for each row execute function public.increment_flag_count();
