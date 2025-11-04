'use client';

import Image from 'next/image';

interface EmptyStateProps {
  illustration: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({
  illustration,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-6 w-full max-w-xs">
        <Image
          src={illustration}
          alt={title}
          width={300}
          height={300}
          className="w-full h-auto"
          priority={false}
        />
      </div>
      <h2 className="mb-3 text-2xl font-bold text-foreground">{title}</h2>
      <p className="mb-6 text-muted-foreground max-w-md leading-relaxed">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="btn-primary flex items-center gap-2 px-6 py-3 hover:shadow-lg transition-shadow duration-200"
        >
          <span>✨</span>
          <span>{action.label}</span>
        </button>
      )}
    </div>
  );
}
