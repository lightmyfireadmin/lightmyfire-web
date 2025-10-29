'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { MyPostWithLighter } from '@/lib/types';
import Link from 'next/link';
import { TrashIcon } from '@heroicons/react/24/outline';
// Importer la nouvelle modale
import ConfirmModal from '@/app/components/ConfirmModal';

export default function MyPostsList({
  initialPosts,
}: {
  initialPosts: MyPostWithLighter[];
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [error, setError] = useState('');
  
  // États pour la modale de suppression
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);

  // Ouvre la modale et stocke l'ID du post
  const handleDeleteClick = (postId: number) => {
    setPostToDelete(postId);
    setIsModalOpen(true);
  };

  // Logique de suppression, exécutée après confirmation
  const handleConfirmDelete = async () => {
    if (postToDelete === null) return;

    setError('');
    
    const { error: deleteError } = await supabase
      .from('posts')
      .delete()
      .eq('id', postToDelete);

    if (deleteError) {
      setError(`Error deleting post: ${deleteError.message}`);
    } else {
      setPosts(posts.filter((post) => post.id !== postToDelete));
    }
    
    // Réinitialiser les états
    setPostToDelete(null);
  };

  if (posts.length === 0) {
    return <p className="text-sm text-muted-foreground">Vous n'avez pas encore fait de posts.</p>;
  }

  return (
    <div className="flow-root">
      {error && <p className="mb-4 text-center text-sm text-error">{error}</p>}
      <ul className="-my-4 divide-y divide-border">
        {posts.map((post) => (
          <li
            key={post.id}
            className="flex items-center justify-between space-x-4 py-4"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {post.title || `Un post de type ${post.post_type}`}
              </p>
              <p className="truncate text-sm text-muted-foreground">
                sur{' '}
                <Link
                  href={`/lighter/${post.lighter_id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {post.lighters?.name || 'un briquet'}
                </Link>
                {' le '}
                {/* Nous utilisons suppressHydrationWarning ici, mais la "Meilleure Pratique"
                    serait de créer un autre composant client pour la date
                    comme nous le faisons dans PostCard.
                */}
                <span suppressHydrationWarning={true}>
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
              </p>
            </div>
            <button
              onClick={() => handleDeleteClick(post.id)} // Change ici
              className="inline-flex items-center rounded-md p-2 text-muted-foreground transition hover:bg-red-100 hover:text-red-600"
              aria-label="Supprimer le post"
            >
              <span className="sr-only">Supprimer</span>
              <TrashIcon className="h-5 w-5" />
            </button>
          </li>
        ))}
      </ul>

      {/* Ajouter la modale à la page */}
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Supprimer ce post ?"
        message="Êtes-vous sûr de vouloir supprimer ce post ? Cette action est définitive."
      />
    </div>
  );
}
