'use client';

import { AlertCircle, CheckCircle2, ClipboardList } from 'lucide-react';
import { CubeColor, CubeState, COLORS, FACE_CENTERS, FaceName } from '@/lib/types';
import { COLOR_META } from './ColorPalette';

interface Props {
  cubeState: CubeState;
}

const COLOR_TO_FACE = Object.fromEntries(
  Object.entries(FACE_CENTERS).map(([face, color]) => [color, face])
) as Partial<Record<CubeColor, FaceName>>;

const EDITABLE_STICKERS_PER_COLOR = 8;
const TOTAL_EDITABLE_STICKERS = EDITABLE_STICKERS_PER_COLOR * COLORS.length;

export default function ValidationPanel({ cubeState }: Props) {
  const counts = Object.fromEntries(COLORS.map((color) => [color, 0])) as Record<CubeColor, number>;
  let unsetCount = 0;

  for (const [, face] of Object.entries(cubeState) as [FaceName, CubeColor[]][]) {
    for (let index = 0; index < face.length; index++) {
      if (index === 4) continue;

      const sticker = face[index];
      if (sticker === 'none') {
        unsetCount++;
        continue;
      }

      counts[sticker]++;
    }
  }

  const painted = TOTAL_EDITABLE_STICKERS - unsetCount;
  const allColorCountsGood = COLORS.every((color) => counts[color] === EDITABLE_STICKERS_PER_COLOR);
  const allGood = unsetCount === 0 && allColorCountsGood;

  const issues = [
    unsetCount > 0 ? `${unsetCount} editable stickers are still unset.` : null,
    ...COLORS.map((color) => {
      const diff = EDITABLE_STICKERS_PER_COLOR - counts[color];
      if (diff === 0) return null;
      const { label } = COLOR_META[color];
      return diff > 0
        ? `${label} needs ${diff} more non-center sticker${diff === 1 ? '' : 's'}.`
        : `${label} has ${Math.abs(diff)} too many non-center sticker${Math.abs(diff) === 1 ? '' : 's'}.`;
    }),
  ].filter(Boolean) as string[];

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
          {painted} / {TOTAL_EDITABLE_STICKERS}
        </span>
      </div>

      <div className="mb-4 rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600 ring-1 ring-slate-200">
        Centers are fixed. Each color should appear on exactly {EDITABLE_STICKERS_PER_COLOR} other stickers.
      </div>

      <div className="flex flex-col gap-3">
        {COLORS.map((color) => {
          const count = counts[color];
          const ok = count === EDITABLE_STICKERS_PER_COLOR;
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
                className={[
                  'font-display text-lg font-semibold tabular-nums animate-count-pop',
                  ok ? 'text-green-600' : 'text-red-600',
                ].join(' ')}
              >
                {count} / {EDITABLE_STICKERS_PER_COLOR}
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
        <div className="flex min-w-0 flex-col">
          <span>{allGood ? 'Counts look solvable. Each center has 8 matching stickers.' : 'Cube entry is not valid yet.'}</span>
          {!allGood && issues.length > 0 && (
            <span className="mt-1 text-sm font-medium text-red-600">
              {issues[0]}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
