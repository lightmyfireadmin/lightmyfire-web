'use client';

import { useState } from 'react';
import Link from 'next/link';
import ModeratorBadge from '@/app/components/ModeratorBadge';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { useCurrentLocale } from '@/locales/client';

interface ProfileHeaderProps {
  username: string;
  level: number;
  points: number;
  role: string | null;
}

function getTotalPointsForLevel(level: number): number {
  if (level <= 1) return 0;
  let total = 50; 
  for (let i = 2; i <= level; i++) {
    total += Math.floor(Math.pow(i, 1.3) * 50);
  }
  return total;
}

export default function ProfileHeader({
  username,
  level,
  points,
  role,
}: ProfileHeaderProps) {
  const [showLevelTooltip, setShowLevelTooltip] = useState(false);
  const locale = useCurrentLocale();

  const currentLevelPoints = getTotalPointsForLevel(level);
  const nextLevelPoints = getTotalPointsForLevel(level + 1);
  const pointsInCurrentLevel = points - currentLevelPoints;
  const pointsNeededForNextLevel = nextLevelPoints - currentLevelPoints;
  const progressPercentage = level >= 100 ? 100 : Math.min(100, (pointsInCurrentLevel / pointsNeededForNextLevel) * 100);

  return (
    <div className="mb-8 rounded-lg border border-border bg-background p-6 shadow-sm">
      <div className="flex items-center gap-3 flex-wrap mb-4">
        <h1 className="text-3xl font-bold text-foreground">@{username}</h1>
        <ModeratorBadge role={role} />
      </div>

      {}
      <div className="flex items-center gap-2 mb-4">
        <div>
          <p className="text-sm font-semibold text-foreground">
            Level {level ?? 1}
          </p>
          <p className="text-xs text-muted-foreground">{points ?? 0} Points</p>
        </div>

        {}
        <div className="relative">
          <button
            onMouseEnter={() => setShowLevelTooltip(true)}
            onMouseLeave={() => setShowLevelTooltip(false)}
            onClick={() => setShowLevelTooltip(!showLevelTooltip)}
            className="p-1 rounded hover:bg-muted transition-colors"
            aria-label="Learn how to earn levels"
          >
            <QuestionMarkCircleIcon className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
          </button>

          {showLevelTooltip && (
            <div className="absolute left-8 top-0 z-10 w-56 rounded-lg bg-foreground text-background p-3 text-xs shadow-lg">
              <p className="font-semibold mb-2">How to Earn Points</p>
              <ul className="space-y-1 text-left">
                <li>• Save a lighter (sticker)</li>
                <li>• Post on lighters (text, image, song, location)</li>
                <li>• Contribute to lighter journeys</li>
                <li>• Receive likes on your posts</li>
              </ul>
              <p className="mt-2 text-xs opacity-90">Keep interacting to level up! 🎮</p>
            </div>
          )}
        </div>
      </div>

      {}
      {level < 100 && (
        <div className="mb-2 mt-2">
          <div className="relative w-full h-1.5 bg-muted rounded-full overflow-hidden border border-border/50">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs mt-0.5 text-muted-foreground">
            <span>Lvl {level}</span>
            <span>{pointsInCurrentLevel} / {pointsNeededForNextLevel}</span>
            <span>Lvl {level + 1}</span>
          </div>
        </div>
      )}

      {}
      {level >= 100 && (
        <div className="mb-6 p-3 rounded-lg bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
          <p className="text-sm font-semibold text-yellow-600">🏆 Max Level Achieved!</p>
        </div>
      )}

      {}
      {(role === 'admin' || role === 'moderator') && (
        <div className="flex flex-wrap gap-3 mt-4">
          {role === 'admin' && (
            <Link href={`/${locale}/admin`} className="inline-flex items-center gap-2 px-4 py-3 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors duration-200 font-medium shadow-md hover:shadow-lg">
              <span>👑</span>
              <span>Admin Panel</span>
            </Link>
          )}
          {(role === 'admin' || role === 'moderator') && (
            <Link href={`/${locale}/moderation`} className="inline-flex items-center gap-2 px-4 py-3 rounded-md bg-sky-500 text-white hover:bg-sky-600 transition-colors duration-200 font-medium shadow-md hover:shadow-lg">
              <span>🛡️</span>
              <span>Moderation Panel</span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
