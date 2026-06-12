'use client';

import { Check, CornerDownRight } from 'lucide-react';
import { CubeColor, COLORS, FACE_CENTERS, FaceName } from '@/lib/types';

export const COLOR_META: Record<CubeColor, { hex: string; label: string }> = {
  white: { hex: '#FFFFFF', label: 'White' },
  yellow: { hex: '#FFD60A', label: 'Yellow' },
  red: { hex: '#F7172A', label: 'Red' },
  orange: { hex: '#FF930F', label: 'Orange' },
  blue: { hex: '#168AF2', label: 'Blue' },
  green: { hex: '#2CC84D', label: 'Green' },
  none: { hex: '#CBD5E1', label: 'Unset' },
};

export const COLOR_TAILWIND: Record<CubeColor, { bg: string; border: string }> = {
  white: { bg: 'bg-white', border: 'border-slate-950' },
  yellow: { bg: 'bg-[#FFD60A]', border: 'border-slate-950' },
  red: { bg: 'bg-[#F7172A]', border: 'border-slate-950' },
  orange: { bg: 'bg-[#FF930F]', border: 'border-slate-950' },
  blue: { bg: 'bg-[#168AF2]', border: 'border-slate-950' },
  green: { bg: 'bg-[#2CC84D]', border: 'border-slate-950' },
  none: { bg: 'bg-slate-300', border: 'border-slate-950' },
};

const COLOR_TO_FACE = Object.fromEntries(
  Object.entries(FACE_CENTERS).map(([face, color]) => [color, face])
) as Partial<Record<CubeColor, FaceName>>;

interface Props {
  selected: CubeColor;
  onSelect: (color: CubeColor) => void;
}

export default function ColorPalette({ selected, onSelect }: Props) {
  return (
    <div className="rounded-[24px] bg-white/90 p-6 shadow-[0_12px_30px_rgba(15,23,42,0.1)] ring-1 ring-black/10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="min-w-[230px]">
          <div className="flex items-center gap-4">
            <h1 className="font-display text-3xl font-semibold text-slate-950">1. Pick a color</h1>
            <CornerDownRight className="size-8 rotate-[-30deg] text-slate-400" />
          </div>
          <p className="mt-4 font-display text-xl font-medium text-slate-500">Then click any sticker to paint it.</p>
        </div>

        <div className="flex flex-wrap gap-5">
          {[...COLORS, 'none' as const].map((color) => {
            const active = color === selected;
            const { hex, label } = COLOR_META[color];
            const face = COLOR_TO_FACE[color];

            return (
              <button
                key={color}
                onClick={() => onSelect(color)}
                aria-pressed={active}
                className="group flex w-[74px] flex-col items-center gap-3 snap-focus rounded-2xl"
                title={`${label}${face ? ` - ${face}` : ''}`}
              >
                <span
                  key={active ? `${color}-active` : color}
                  className={[
                    'relative grid size-[70px] place-items-center rounded-2xl border-[3px] transition-transform duration-150 group-active:scale-90',
                    active ? 'animate-chip-select' : 'group-hover:-translate-y-1',
                  ].join(' ')}
                  style={{
                    background: hex,
                    borderColor: active ? '#1478f2' : 'rgba(15,23,42,0.08)',
                    boxShadow: active
                      ? 'inset 0 3px 0 rgba(255,255,255,.45), 0 0 0 4px #dbeafe, 0 10px 18px rgba(20,120,242,.24)'
                      : 'inset 0 3px 0 rgba(255,255,255,.45), 0 10px 18px rgba(15,23,42,.14)',
                    transform: active ? 'translateY(-3px)' : 'translateY(0)',
                  }}
                >
                  {active && (
                    <>
                      <span className="absolute -right-2 -top-4 h-5 w-1.5 rotate-[15deg] rounded-full bg-blue-500" />
                      <span className="absolute right-2 -top-5 h-7 w-1.5 rounded-full bg-blue-500" />
                      <span className="absolute right-7 -top-3 h-4 w-1.5 rotate-[-25deg] rounded-full bg-blue-500" />
                      <span className="grid size-7 place-items-center rounded-full bg-white shadow-sm">
                        <Check className="size-4 text-blue-600" />
                      </span>
                    </>
                  )}
                </span>
                <span className="font-display text-lg font-semibold text-slate-950">{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
