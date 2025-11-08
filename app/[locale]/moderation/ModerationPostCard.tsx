'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { DetailedPost } from '@/lib/types';
import { useToast } from '@/lib/context/ToastContext';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import ConfirmModal from '@/app/components/ConfirmModal';

interface ModerationPostCardProps {
  post: DetailedPost;
  onAction: (postId: number) => void;
}

export default function ModerationPostCard({ post, onAction }: ModerationPostCardProps) {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject' | 'delete' | null>(null);
  const { addToast } = useToast();

  const handleApprove = async () => {
    setLoading(true);
    try {
      // Use approve_post RPC function to set requires_review=false
      const { error } = await supabase.rpc('approve_post', { post_id: post.id });

      if (error) throw error;

      addToast({
        type: 'success',
        title: 'Post Approved',
        message: `Post #${post.id} has been approved and is now visible to users.`,
        duration: 5000,
      });

      onAction(post.id);
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to approve post',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      // Use reject_post RPC function to keep requires_review=true (hidden)
      const { error } = await supabase.rpc('reject_post', { post_id: post.id });

      if (error) throw error;

      addToast({
        type: 'success',
        title: 'Post Rejected',
        message: `Post #${post.id} will remain hidden from public view.`,
        duration: 5000,
      });

      onAction(post.id);
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to reject post',
        duration: 5000,
      });
    } finally {
      setLoading(false);
      setIsModalOpen(false);
      setAction(null);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id);

      if (error) throw error;

      addToast({
        type: 'success',
        title: 'Post Deleted',
        message: `Post #${post.id} has been permanently deleted.`,
        duration: 5000,
      });

      onAction(post.id);
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to delete post',
        duration: 5000,
      });
    } finally {
      setLoading(false);
      setIsModalOpen(false);
      setAction(null);
    }
  };

  const handleConfirmAction = () => {
    if (action === 'approve') {
      handleApprove();
    } else if (action === 'reject') {
      handleReject();
    } else if (action === 'delete') {
      handleDelete();
    }
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="border border-border rounded-lg p-4 shadow-sm bg-background hover:shadow-md transition-shadow">
        <div className="space-y-2 mb-4">
          <p className="font-semibold text-foreground">
            Post #{post.id}{' '}
            <span className="text-xs text-muted-foreground font-normal">
              ({post.post_type})
            </span>
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>User:</strong> {post.username}
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>Lighter:</strong> {post.lighter_id}
          </p>
          {post.title && (
            <p className="text-sm text-foreground">
              <strong>Title:</strong> {post.title}
            </p>
          )}
          {(post.content_text || post.content_url || post.location_name) && (
            <p className="text-sm text-muted-foreground">
              <strong>Content:</strong>{' '}
              {post.content_text?.substring(0, 100) ||
                post.content_url?.substring(0, 50) ||
                post.location_name}
              {(post.content_text?.length || 0) > 100 ? '...' : ''}
            </p>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => {
              setAction('approve');
              setIsModalOpen(true);
            }}
            disabled={loading}
            className="btn-primary flex items-center gap-2 text-sm py-2 px-3 hover:shadow-md transition-shadow"
          >
            {loading && action === 'approve' ? (
              <LoadingSpinner size="sm" color="foreground" />
            ) : (
              <>
                <span>✓</span>
                <span>Approve</span>
              </>
            )}
          </button>
          <button
            onClick={() => {
              setAction('reject');
              setIsModalOpen(true);
            }}
            disabled={loading}
            className="btn-secondary flex items-center gap-2 text-sm py-2 px-3 hover:shadow-md transition-shadow text-orange-600 border-orange-200 hover:bg-orange-50"
          >
            {loading && action === 'reject' ? (
              <LoadingSpinner size="sm" color="foreground" />
            ) : (
              <>
                <span>⊘</span>
                <span>Reject</span>
              </>
            )}
          </button>
          <button
            onClick={() => {
              setAction('delete');
              setIsModalOpen(true);
            }}
            disabled={loading}
            className="btn-secondary flex items-center gap-2 text-sm py-2 px-3 hover:shadow-md transition-shadow text-red-600 border-red-200 hover:bg-red-50"
          >
            {loading && action === 'delete' ? (
              <LoadingSpinner size="sm" color="foreground" />
            ) : (
              <>
                <span>✕</span>
                <span>Delete</span>
              </>
            )}
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setAction(null);
        }}
        onConfirm={handleConfirmAction}
        title={
          action === 'approve'
            ? 'Approve Post?'
            : action === 'reject'
            ? 'Reject Post?'
            : 'Delete Post?'
        }
        message={
          action === 'approve'
            ? 'This post will become visible to all users.'
            : action === 'reject'
            ? 'This post will remain hidden from public view. The poster will NOT be notified.'
            : 'This action cannot be undone. The post will be permanently deleted from the database.'
        }
      />
    </>
  );
}
