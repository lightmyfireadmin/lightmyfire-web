'use client';
import { useState, useEffect } from 'react';

export default function FormattedDate({ dateString }: { dateString: string }) {
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    
    setFormattedDate(new Date(dateString).toLocaleDateString());
  }, [dateString]);

  if (!formattedDate) {
    return null; 
  }

  
  return <span>{formattedDate}</span>;
}
