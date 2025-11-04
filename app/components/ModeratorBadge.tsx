'use client';

import { useI18n } from '@/locales/client';

interface ModeratorBadgeProps {
  isSmall?: boolean;
  role?: string | null;
}

export default function ModeratorBadge({ isSmall = false, role }: ModeratorBadgeProps) {
  const t = useI18n();

  if (role !== 'moderator') return null;

  return (
    <div className="group relative inline-flex items-center">
      <span
        className={`inline-flex items-center rounded-full font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 ${
          isSmall ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
        }`}
      >
        🛡️ {isSmall ? 'Mod' : 'Moderator'}
      </span>

      {}
      <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 bg-foreground text-background rounded-md px-3 py-2 text-xs font-medium whitespace-nowrap shadow-lg">
        {t('badge.moderator_tooltip') || 'This user is part of moderation'}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground" />
      </div>
    </div>
  );
}
