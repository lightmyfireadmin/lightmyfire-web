'use client';

import Link from 'next/link';
import ModeratorBadge from '@/app/components/ModeratorBadge';

interface ProfileHeaderProps {
  username: string;
  level: number;
  points: number;
  role: string | null;
}

/**
 * Profile Header Component
 * Displays user profile information with moderator badge
 */
export default function ProfileHeader({
  username,
  level,
  points,
  role,
}: ProfileHeaderProps) {
  return (
    <div className="mb-8 rounded-lg border border-border bg-background p-6 shadow-sm">
      <div className="flex items-center gap-3 flex-wrap mb-2">
        <h1 className="text-3xl font-bold text-foreground">@{username}</h1>
        <ModeratorBadge role={role} />
      </div>
      <p className="mt-1 text-muted-foreground">
        Level {level ?? 1} | {points ?? 0} Points
      </p>
      {role === 'moderator' && (
        <Link href="/moderation" className="btn-primary mt-4 inline-flex items-center gap-2">
          <span>🛡️</span>
          <span>Go to Moderation</span>
        </Link>
      )}
    </div>
  );
}
