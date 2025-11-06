'use client';

import type { Trophy } from '@/lib/types';
import Image from 'next/image';
import { useState } from 'react';

function TrophyIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-5 w-5"
    >
      <path
        fillRule="evenodd"
        d="M15.18 5.313c-.028-.153-.06-.303-.098-.45a.75.75 0 0 0-1.455.33A12.983 12.983 0 0 1 12 11.733V6.75a.75.75 0 0 0-1.5 0v5.074c-1.08.13-2.13.4-3.13.82V6.75a.75.75 0 0 0-1.5 0v5.861c-1.12.518-2.14 1.2-3.05 2.01a.75.75 0 0 0 1.06 1.06c.71-.63 1.5-1.16 2.36-1.57v2.668a.75.75 0 0 0 .75.75h.5c.16 0 .31-.04.45-.11a.75.75 0 0 0 .3-.64v-2.66c1.06-.39 2.18-.59 3.32-.59s2.26.2 3.32.59v2.66c0 .26.15.49.38.64a.75.75 0 0 0 .82-.11h.5a.75.75 0 0 0 .75-.75v-2.668c.86.41 1.65.94 2.36 1.57a.75.75 0 1 0 1.06-1.06c-.91-.81-1.93-1.492-3.05-2.01V6.75a.75.75 0 0 0-.75-.75h-.008c-.038.147-.07.297-.098.45a2.25 2.25 0 0 1-4.226 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

interface UnlockedTrophy extends Trophy {
  unlocked: true;
}

interface LockedTrophyDef {
  id: number;
  name: string;
  description: string;
  icon_name?: string;
  unlocked: false;
}

const ALL_TROPHIES: (UnlockedTrophy | LockedTrophyDef)[] = [
  { id: 1, name: 'Fire Starter', description: 'Save your first lighter', icon_name: 'fire_starter_trophy', unlocked: false },
  { id: 2, name: 'Story Teller', description: 'Add your first post', icon_name: 'story_teller_trophy', unlocked: false },
  { id: 3, name: 'Chronicles', description: 'Add 5 stories to lighters', icon_name: 'chronicles_trophy', unlocked: false },
  { id: 4, name: 'Epic Saga', description: 'Add 10 stories to lighters', icon_name: 'epic_saga_trophy', unlocked: false },
  { id: 5, name: 'Collector', description: 'Save 5 different lighters', icon_name: 'collector_trophy', unlocked: false },
  { id: 6, name: 'Community Builder', description: 'Contribute to 10 different lighters', icon_name: 'community_builder_trophy', unlocked: false },
  { id: 7, name: 'Globe Trotter', description: 'Post from 5 different countries', icon_name: 'globe_trotter_trophy', unlocked: false },
  { id: 8, name: 'Popular Contributor', description: 'Get 50 likes on your posts', icon_name: 'popular_contributor_trophy', unlocked: false },
  { id: 9, name: 'Photographer', description: 'Add 10 photo posts', icon_name: 'photographer_trophy', unlocked: false },
  { id: 10, name: 'Musician', description: 'Add 5 song posts', icon_name: 'musician_trophy', unlocked: false },
];

export default function TrophyList({ trophies }: { trophies: Trophy[] }) {
  const [hoveredTrophy, setHoveredTrophy] = useState<number | null>(null);

  
  const unlockedIds = new Set(trophies.map((t) => t.id));

  
  const allTrophies = ALL_TROPHIES.map((trophy) => {
    if (unlockedIds.has(trophy.id)) {
      
      const unlockedTrophy = trophies.find((t) => t.id === trophy.id);
      return { ...trophy, unlocked: true, ...unlockedTrophy } as UnlockedTrophy;
    }
    return trophy;
  });

  const unlockedTrophies = allTrophies.filter((t) => t.unlocked);
  const lockedTrophies = allTrophies.filter((t) => !t.unlocked);

  return (
    <div className="space-y-8">
      {}
      {unlockedTrophies.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-yellow-600 mb-4 flex items-center gap-2">
            <span className="text-2xl">⭐</span> Unlocked Achievements
          </h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {unlockedTrophies.map((trophy) => (
              <div
                key={trophy.id}
                className="group relative rounded-lg border-2 border-yellow-500 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-4 text-center shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredTrophy(trophy.id)}
                onMouseLeave={() => setHoveredTrophy(null)}
              >
                {}
                <div className="absolute top-1 right-1 text-lg">⭐</div>

                {}
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-yellow-400 text-white shadow-md group-hover:shadow-lg transition-shadow">
                  {trophy.icon_name ? (
                    <Image
                      src={`/newassets/${trophy.icon_name}.png`}
                      alt={trophy.name}
                      width={56}
                      height={56}
                      className="drop-shadow-sm"
                    />
                  ) : (
                    <TrophyIcon />
                  )}
                </div>

                {}
                <p className="mt-3 font-bold text-foreground text-sm">{trophy.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{trophy.description}</p>

                {}
                {hoveredTrophy === trophy.id && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-foreground text-background text-xs rounded whitespace-nowrap z-10">
                    ✓ Unlocked
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {}
      {lockedTrophies.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-500 mb-4 flex items-center gap-2">
            <span className="text-2xl">🔒</span> Locked Achievements
          </h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {lockedTrophies.map((trophy) => (
              <div
                key={trophy.id}
                className="group relative rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 p-4 text-center shadow-sm opacity-60 hover:opacity-80 hover:shadow-md transition-all duration-200 cursor-not-allowed"
                onMouseEnter={() => setHoveredTrophy(trophy.id)}
                onMouseLeave={() => setHoveredTrophy(null)}
              >
                {}
                <div className="absolute top-1 right-1 text-lg">🔐</div>

                {}
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-300 dark:bg-gray-600 text-gray-500 shadow-sm">
                  {trophy.icon_name ? (
                    <Image
                      src={`/newassets/${trophy.icon_name}.png`}
                      alt={trophy.name}
                      width={56}
                      height={56}
                      className="grayscale opacity-60"
                    />
                  ) : (
                    <TrophyIcon />
                  )}
                </div>

                {}
                <p className="mt-3 font-bold text-gray-600 dark:text-gray-300 text-sm">{trophy.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{trophy.description}</p>

                {}
                {hoveredTrophy === trophy.id && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 dark:bg-gray-200 text-gray-100 dark:text-gray-800 text-xs rounded whitespace-nowrap z-10">
                    🔒 Locked
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {}
      {allTrophies.length === 0 && (
        <div className="text-center py-12">
          <p className="text-2xl mb-4">🏆</p>
          <p className="text-muted-foreground">
            No achievements yet. Go save a lighter or add stories to earn your first trophy!
          </p>
        </div>
      )}

      {}
      {unlockedTrophies.length > 0 && (
        <div className="rounded-lg border-2 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4">
          <p className="text-center text-sm font-semibold text-foreground">
            <span className="text-yellow-600 dark:text-yellow-400">
              {unlockedTrophies.length}
            </span>
            {' '}
            of
            {' '}
            <span className="text-foreground">{ALL_TROPHIES.length}</span>
            {' '}
            achievements unlocked
          </p>
          <div className="mt-2 w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-full transition-all duration-500"
              style={{
                width: `${(unlockedTrophies.length / ALL_TROPHIES.length) * 100}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}