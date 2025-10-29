'use client';
import { useState, useEffect } from 'react';

// Ce composant garantit que la date est formatée côté client
// pour éviter les erreurs d'hydratation dues aux fuseaux horaires.
export default function FormattedDate({ dateString }: { dateString: string }) {
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    // Ne s'exécute que dans le navigateur
    setFormattedDate(new Date(dateString).toLocaleDateString());
  }, [dateString]);

  if (!formattedDate) {
    return null; // Affiche null pendant le rendu serveur
  }

  // Affiche la date formatée côté client
  return <span>{formattedDate}</span>;
}
