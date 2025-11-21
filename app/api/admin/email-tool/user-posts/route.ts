import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerSupabaseClient(cookieStore);

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    // Check admin role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Get user ID from URL params
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    // Fetch user's posts with lighter information
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select(`
        id,
        content,
        post_type,
        created_at,
        lighters (
          id,
          lighter_name
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (postsError) {
      console.error('Error fetching user posts:', postsError);
      return NextResponse.json(
        { error: 'Failed to fetch posts' },
        { status: 500 }
      );
    }

    return NextResponse.json({ posts: posts || [] });
  } catch (error) {
    console.error('Error in user-posts endpoint:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
