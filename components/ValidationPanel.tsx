'use client';

import { AlertCircle, CheckCircle2, ClipboardList } from 'lucide-react';
import { CubeState, CubeColor, COLORS, FACE_CENTERS, FaceName } from '@/lib/types';
import { COLOR_META } from './ColorPalette';

interface Props {
  cubeState: CubeState;
}

const COLOR_TO_FACE = Object.fromEntries(
  Object.entries(FACE_CENTERS).map(([face, color]) => [color, face])
) as Partial<Record<CubeColor, FaceName>>;

export default function ValidationPanel({ cubeState }: Props) {
  const counts = Object.fromEntries(COLORS.map((color) => [color, 0])) as Record<CubeColor, number>;

  for (const face of Object.values(cubeState)) {
    for (const sticker of face) {
      if (sticker !== 'none') counts[sticker as CubeColor]++;
    }
  }

  const painted = COLORS.reduce((total, color) => total + counts[color], 0);
  const allGood = COLORS.every((color) => counts[color] === 9);

  return (
    <div className="rounded-[20px] bg-white p-6 shadow-[0_10px_26px_rgba(15,23,42,0.1)] ring-1 ring-black/10">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ClipboardList className="size-6 text-blue-600" />
          <h2 className="font-display text-2xl font-semibold text-slate-950">Cube Status</h2>
        </div>
        <span
          key={painted}
          className={[
            'rounded-full px-4 py-1.5 font-display text-lg font-semibold animate-count-pop',
            allGood ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600',
          ].join(' ')}
        >
          {painted} / 54
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {COLORS.map((color) => {
          const count = counts[color];
          const ok = count === 9;
          const { hex, label } = COLOR_META[color];
          const face = COLOR_TO_FACE[color];

          return (
            <div key={color} className="grid grid-cols-[32px_1fr_auto] items-center gap-3">
              <span
                className="size-6 rounded-full border border-black/10 shadow-sm"
                style={{
                  background: hex,
                  boxShadow: 'inset 0 2px 0 rgba(255,255,255,.45), 0 2px 4px rgba(15,23,42,.12)',
                }}
              />
              <div className="font-display text-lg font-semibold text-slate-900">
                {label}
                {face && <span className="ml-1 text-base font-medium text-slate-500">({face})</span>}
              </div>
              <div
                key={`${color}-${count}`}
                className={['font-display text-lg font-semibold tabular-nums animate-count-pop', ok ? 'text-green-600' : 'text-red-600'].join(' ')}
              >
                {count} / 9
              </div>
            </div>
          );
        })}
      </div>

      <div
        className={[
          'mt-5 flex gap-3 rounded-xl p-4 font-display text-base font-semibold leading-6',
          allGood ? 'bg-green-50 text-green-800 ring-1 ring-green-200' : 'bg-red-50 text-red-700 ring-1 ring-red-200',
        ].join(' ')}
      >
        {allGood ? <CheckCircle2 className="mt-0.5 size-5 shrink-0" /> : <AlertCircle className="mt-0.5 size-5 shrink-0" />}
        <span>{allGood ? 'Cube is complete. Ready to solve.' : 'Some colors are incomplete. Keep painting.'}</span>
      </div>
    </div>
  );
}
