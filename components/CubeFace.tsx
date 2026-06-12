'use client';

import { FaceName, FaceState, CubeColor } from '@/lib/types';
import { COLOR_STYLES } from './ColorPalette';

interface Props {
  faceName: FaceName;
  faceState: FaceState;
  selectedColor: CubeColor;
  onStickerClick: (index: number) => void;
}

export default function CubeFace({
  faceName,
  faceState,
  selectedColor,
  onStickerClick,
}: Props) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
        {faceName}
      </span>
      <div className="grid grid-cols-3 gap-1 p-1.5 bg-zinc-800 rounded-lg">
        {faceState.map((color, i) => {
          const isCenter = i === 4;
          const { bg } = COLOR_STYLES[color];
          return (
            <button
              key={i}
              title={isCenter ? `${faceName} center (locked)` : `Click to paint ${selectedColor}`}
              disabled={isCenter}
              onClick={() => onStickerClick(i)}
              className={`
                w-10 h-10 rounded transition-all
                ${bg}
                ${isCenter
                  ? 'cursor-default opacity-90 ring-1 ring-white/20'
                  : 'hover:scale-105 hover:shadow-md cursor-pointer active:scale-95'}
              `}
            />
          );
        })}
      </div>
    </div>
  );
}
