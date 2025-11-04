'use client';

import React, { ReactNode } from 'react';

interface IconButtonProps {
  onClick: () => void;
  isActive: boolean;
  icon: ReactNode;
  label: string;
  tooltip?: string;
  disabled?: boolean;
  className?: string;
}

export default function IconButton({
  onClick,
  isActive,
  icon,
  label,
  tooltip,
  disabled = false,
  className = '',
}: IconButtonProps) {
  return (
    <div className="group relative">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`
          flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
          transition-all duration-200 ease-out
          ${
            isActive
              ? 'bg-primary text-primary-foreground shadow-md hover:shadow-lg hover:scale-105'
              : 'bg-muted text-foreground hover:bg-muted/80 active:bg-muted/60'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${className}
        `}
      >
        <span className="text-lg leading-none">{icon}</span>
        <span>{label}</span>
      </button>

      {tooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
          <div className="bg-foreground text-background text-xs font-medium rounded-md px-2 py-1 whitespace-nowrap shadow-lg">
            {tooltip}
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground" />
        </div>
      )}
    </div>
  );
}
