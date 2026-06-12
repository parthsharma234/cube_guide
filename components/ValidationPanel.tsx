'use client';

import { CubeState, CubeColor, COLORS } from '@/lib/types';
import { COLOR_STYLES } from './ColorPalette';

interface Props {
  cubeState: CubeState;
}

export default function ValidationPanel({ cubeState }: Props) {
  // Count all stickers for each color
  const counts: Record<CubeColor, number> = {} as Record<CubeColor, number>;
  for (const color of COLORS) counts[color] = 0;

  for (const face of Object.values(cubeState)) {
    for (const sticker of face) {
      if (sticker !== 'none') counts[sticker as CubeColor]++;
    }
  }

  const errors = COLORS.filter((c) => counts[c] !== 9);
  const unset = Object.values(cubeState).flat().filter((c) => c === 'none').length;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
        Validation
      </p>

      {unset > 0 && (
        <p className="text-xs text-amber-600">
          {unset} sticker{unset !== 1 ? 's' : ''} still unset.
        </p>
      )}

      <div className="flex flex-col gap-1">
        {COLORS.map((color) => {
          const count = counts[color];
          const ok = count === 9;
          const { bg, label } = COLOR_STYLES[color];
          return (
            <div key={color} className="flex items-center gap-2 text-sm">
              <span className={`w-3 h-3 rounded-sm inline-block flex-shrink-0 ${bg}`} />
              <span className="w-14 text-zinc-600">{label}</span>
              <span className={ok ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>
                {count}/9
              </span>
              {!ok && <span className="text-red-400 text-xs">✕ needs {9 - count > 0 ? `+${9 - count}` : 9 - count}</span>}
            </div>
          );
        })}
      </div>

      {errors.length === 0 && unset === 0 ? (
        <p className="text-xs text-green-600 font-medium">✓ Color counts look good!</p>
      ) : (
        <p className="text-xs text-red-500">
          Each color must appear exactly 9 times.
        </p>
      )}
    </div>
  );
}
