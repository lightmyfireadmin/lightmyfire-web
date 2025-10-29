'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { FlagIcon } from '@heroicons/react/24/outline';
// Importer la nouvelle modale
import ConfirmModal from './ConfirmModal';

export default function FlagButton({
  postId,
  isLoggedIn,
}: {
  postId: number;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [isFlagged, setIsFlagged] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // État pour contrôler l'ouverture de la modale
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    if (!isLoggedIn) {
      router.push('/login?message=You must be logged in to flag a post');
      return;
    }
    if (isFlagged || isLoading) {
      return;
    }
    // Ouvre la modale au lieu de confirmer
    setIsModalOpen(true);
  };

  // Logique de signalement, exécutée après confirmation
  const handleConfirmFlag = async () => {
    setIsLoading(true);
    const { error } = await supabase.rpc('flag_post', {
      post_to_flag_id: postId,
    });

    if (!error) {
      setIsFlagged(true);
    } else {
      console.error(error);
      // Nous devrions utiliser un meilleur système de notification que 'alert'
      alert('Could not flag post. Please try again.');
      setIsLoading(false); // Réinitialiser le chargement uniquement en cas d'erreur
    }
    // Pas besoin de réinitialiser le chargement en cas de succès, le bouton disparaît
  };

  if (isFlagged) {
    return (
      <span className="flex items-center space-x-1 text-sm text-muted-foreground">
        <FlagIcon className="h-5 w-5" aria-hidden="true" />
        <span>Signalé</span>
      </span>
    );
  }

  return (
    <>
      <button
        onClick={openModal} // Ouvre la modale
        disabled={isLoading}
        className="flex items-center space-x-1 text-sm text-muted-foreground transition hover:text-red-600 disabled:opacity-50"
      >
        <FlagIcon className="h-5 w-5" aria-hidden="true" />
        <span>Signaler</span>
      </button>

      {/* Ajouter la modale à la page */}
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmFlag}
        title="Signaler ce post ?"
        message="Êtes-vous sûr de vouloir signaler ce post pour examen ? Cette action ne peut pas être annulée."
      />
    </>
  );
}
