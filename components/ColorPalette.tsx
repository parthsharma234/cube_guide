'use client';

import { CubeColor, COLORS } from '@/lib/types';

// Visual properties for each cube color
const COLOR_STYLES: Record<CubeColor, { bg: string; label: string }> = {
  white:  { bg: 'bg-white border border-zinc-300',  label: 'White'  },
  yellow: { bg: 'bg-yellow-400',                    label: 'Yellow' },
  red:    { bg: 'bg-red-500',                       label: 'Red'    },
  orange: { bg: 'bg-orange-500',                    label: 'Orange' },
  blue:   { bg: 'bg-blue-500',                      label: 'Blue'   },
  green:  { bg: 'bg-green-500',                     label: 'Green'  },
  none:   { bg: 'bg-zinc-200',                      label: 'None'   },
};

interface Props {
  selected: CubeColor;
  onSelect: (color: CubeColor) => void;
}

export default function ColorPalette({ selected, onSelect }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
        Color Palette
      </p>
      <div className="flex flex-wrap gap-2">
        {COLORS.map((color) => {
          const { bg, label } = COLOR_STYLES[color];
          const isSelected = color === selected;
          return (
            <button
              key={color}
              title={label}
              onClick={() => onSelect(color)}
              className={`
                w-9 h-9 rounded-md transition-all
                ${bg}
                ${isSelected
                  ? 'ring-2 ring-offset-2 ring-zinc-900 scale-110'
                  : 'hover:scale-105 hover:shadow-sm'}
              `}
            />
          );
        })}
      </div>
      <p className="text-xs text-zinc-400">
        Selected: <span className="font-medium text-zinc-700 capitalize">{selected}</span>
      </p>
    </div>
  );
}

export { COLOR_STYLES };
