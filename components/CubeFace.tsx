'use client';

import { FaceName, FaceState, FACE_CENTERS } from '@/lib/types';
import { COLOR_META, COLOR_TAILWIND } from './ColorPalette';
import type { CubeColor } from '@/lib/types';

interface Props {
  faceName: FaceName;
  faceState: FaceState;
  selectedColor: CubeColor;
  lastPainted: { face: FaceName; index: number; id: number } | null;
  lockedCenter: { face: FaceName; id: number } | null;
  onStickerClick: (index: number) => void;
  onStickerDrag?: (index: number) => void;
  onCenterClick: () => void;
}

export default function CubeFace({
  faceName,
  faceState,
  selectedColor,
  lastPainted,
  lockedCenter,
  onStickerClick,
  onStickerDrag,
  onCenterClick,
}: Props) {
  const centerColor = FACE_CENTERS[faceName];
  const { bg: centerBg } = COLOR_TAILWIND[centerColor];
  const previewHex = COLOR_META[selectedColor].hex;

  return (
    <div className="flex w-[var(--face-size)] flex-col items-center gap-1.5 sm:gap-2 lg:gap-3">
      <div className="font-display text-sm font-semibold leading-none text-slate-950 sm:text-base lg:text-xl">{faceName}</div>

      <div className="grid grid-cols-3 gap-[var(--face-gap)] rounded-[10px] bg-slate-950 p-[var(--face-pad)] shadow-[0_10px_18px_rgba(15,23,42,0.18)] sm:rounded-[12px] lg:rounded-[14px]">
        {faceState.map((color, index) => {
          const isCenter = index === 4;

          if (isCenter) {
            const isLockedCenter = lockedCenter?.face === faceName;
            return (
              <button
                key={isLockedCenter ? `${index}-${lockedCenter.id}` : index}
                type="button"
                onClick={onCenterClick}
                title="Center - fixed"
                aria-label={`${faceName} center locked`}
                className={[
                  `grid size-[var(--sticker-size)] place-items-center rounded-[6px] border-2 border-slate-950 ${centerBg} sm:rounded-lg snap-focus`,
                  isLockedCenter ? 'animate-sticker-wiggle' : '',
                ].join(' ')}
                style={{
                  boxShadow: 'inset 0 3px 0 rgba(255,255,255,.42), inset 0 -3px 0 rgba(15,23,42,.08)',
                }}
              >
                <span className="size-1.5 rounded-full bg-black/25 sm:size-2 lg:size-2.5" />
              </button>
            );
          }

          const { bg } = COLOR_TAILWIND[color];
          const isLastPainted = lastPainted?.face === faceName && lastPainted.index === index;

          return (
            <button
              key={isLastPainted ? `${index}-${lastPainted.id}` : index}
              type="button"
              onClick={(event) => {
                if (event.detail === 0) onStickerClick(index);
              }}
              onPointerDown={(event) => {
                event.preventDefault();
                onStickerClick(index);
              }}
              onPointerEnter={(event) => event.buttons === 1 && onStickerDrag?.(index)}
              data-sticker-face={faceName}
              data-sticker-index={index}
              aria-label={`${faceName} sticker ${index + 1}`}
              className={[
                `size-[var(--sticker-size)] rounded-[6px] border-2 border-slate-950 ${bg} transition-transform duration-150 hover:scale-[1.03] active:scale-90 sm:rounded-lg snap-focus`,
                isLastPainted ? 'animate-sticker-pop' : '',
              ].join(' ')}
              style={{
                boxShadow: 'inset 0 3px 0 rgba(255,255,255,.42), inset 0 -3px 0 rgba(15,23,42,.08)',
                outlineColor: previewHex,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
