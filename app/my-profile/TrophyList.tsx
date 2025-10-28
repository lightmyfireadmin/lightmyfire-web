'use client';

import type { Trophy } from './page';

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

export default function TrophyList({ trophies }: { trophies: Trophy[] }) {
  if (trophies.length === 0) {
    return (
      // --- THIS IS THE FIX ---
      <p className="text-sm text-gray-500">
        You haven&apos;t earned any trophies yet. Go save a lighter or add a
        story!
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {trophies.map((trophy) => (
        <div
          key={trophy.id}
          className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center"
        >
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
            <TrophyIcon />
          </div>
          <p className="mt-2 font-semibold text-gray-800">{trophy.name}</p>
          <p className="text-xs text-gray-500">{trophy.description}</p>
        </div>
      ))}
    </div>
  );
}