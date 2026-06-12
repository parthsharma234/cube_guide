'use client';

import { useCallback, useRef, useState } from 'react';
import type { ElementType, PointerEvent, ReactNode } from 'react';
import {
  BookOpen,
  FileJson,
  Home,
  Lightbulb,
  Paintbrush,
  RotateCcw,
  Shuffle,
  Wand2,
} from 'lucide-react';
import {
  CubeColor,
  CubeState,
  FaceName,
  COLORS,
  makeDefaultCubeState,
} from '@/lib/types';
import ColorPalette from './ColorPalette';
import CubeFace from './CubeFace';
import ValidationPanel from './ValidationPanel';

const CUBE_NET: (FaceName | null)[][] = [
  [null, 'Up', null, null],
  ['Left', 'Front', 'Right', 'Back'],
  [null, 'Down', null, null],
];

export default function CubeEditor() {
  const [cubeState, setCubeState] = useState<CubeState>(makeDefaultCubeState);
  const [selectedColor, setSelectedColor] = useState<CubeColor>('white');
  const [lastPainted, setLastPainted] = useState<{ face: FaceName; index: number; id: number } | null>(null);
  const [lockedCenter, setLockedCenter] = useState<{ face: FaceName; id: number } | null>(null);
  const [boardPulse, setBoardPulse] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const lastDragTargetRef = useRef<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 1900);
  }

  const paintSticker = useCallback(
    (face: FaceName, index: number, toggle = true) => {
      setCubeState((prev) => {
        const updated = { ...prev, [face]: [...prev[face]] };
        updated[face][index] = toggle && prev[face][index] === selectedColor ? 'none' : selectedColor;
        return updated;
      });
      setLastPainted({ face, index, id: Date.now() });
    },
    [selectedColor]
  );

  const paintDragTarget = useCallback(
    (target: EventTarget | null) => {
      if (!(target instanceof Element)) return;

      const sticker = target.closest<HTMLButtonElement>('[data-sticker-face][data-sticker-index]');
      if (!sticker) return;

      const face = sticker.dataset.stickerFace as FaceName | undefined;
      const index = Number(sticker.dataset.stickerIndex);
      if (!face || !Number.isInteger(index)) return;

      const dragTarget = `${face}-${index}`;
      if (dragTarget === lastDragTargetRef.current) return;

      lastDragTargetRef.current = dragTarget;
      paintSticker(face, index, false);
    },
    [paintSticker]
  );

  const handleBoardPointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (event.buttons !== 1) return;
      paintDragTarget(document.elementFromPoint(event.clientX, event.clientY));
    },
    [paintDragTarget]
  );

  function endDragPaint() {
    lastDragTargetRef.current = null;
  }

  const showLockedCenter = useCallback((face: FaceName) => {
    setLockedCenter({ face, id: Date.now() });
    showToast(`${face} center is locked`);
  }, []);

  function handleReset() {
    setCubeState(makeDefaultCubeState());
    setBoardPulse((value) => value + 1);
    showToast('Reset');
  }

  function handleClear() {
    setCubeState(makeDefaultCubeState());
    setBoardPulse((value) => value + 1);
    showToast('Cleared');
  }

  function handleRandom() {
    setCubeState(() => {
      const next = makeDefaultCubeState();
      for (const face of Object.keys(next) as FaceName[]) {
        for (let i = 0; i < next[face].length; i++) {
          if (i !== 4) next[face][i] = COLORS[Math.floor(Math.random() * COLORS.length)];
        }
      }
      return next;
    });
    setBoardPulse((value) => value + 1);
    showToast('Randomized');
  }

  function handleExportJson() {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      cube: cubeState,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cubeguide-state.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast('JSON exported');
  }

  return (
    <div className="min-h-screen px-4 py-4 text-[#111827] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1450px]">
        <header className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Brand />

          <nav className="flex items-center gap-8 self-start rounded-full bg-white/70 px-5 py-2.5 shadow-[0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-black/5 lg:self-auto">
            <NavItem icon={Home} label="Input" active />
            <NavItem icon={Wand2} label="Solve" />
            <NavItem icon={BookOpen} label="Learn" />
          </nav>

          <div className="flex flex-wrap items-center gap-3">
            <HeaderBtn onClick={handleReset} icon={RotateCcw}>
              Reset
            </HeaderBtn>
          </div>
        </header>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_390px]">
          <section className="flex min-w-0 flex-col gap-4">
            <ColorPalette selected={selectedColor} onSelect={setSelectedColor} />

            <div
              key={boardPulse}
              className="relative overflow-hidden rounded-[24px] bg-white/90 p-5 shadow-[0_12px_30px_rgba(15,23,42,0.1)] ring-1 ring-black/10 sm:p-8 animate-board-reset"
            >
              <div className="absolute left-8 top-7 hidden rotate-[-4deg] rounded-md bg-[#fff4a8] px-5 py-5 shadow-[0_12px_24px_rgba(15,23,42,0.16)] md:block">
                <div className="absolute left-1/2 top-[-18px] h-10 w-6 -translate-x-1/2 rotate-[28deg] bg-sky-300/55" />
                <div className="flex items-center gap-2 font-display text-xl font-semibold">
                  <Lightbulb className="size-5 text-amber-500" />
                  Tips
                </div>
                <p className="mt-2 max-w-[140px] text-sm font-semibold leading-6 text-slate-800">
                  Centers are locked. They show each face color.
                </p>
              </div>

              <div
                className="overflow-hidden"
                onPointerMove={handleBoardPointerMove}
                onPointerUp={endDragPaint}
                onPointerCancel={endDragPaint}
                onPointerLeave={endDragPaint}
              >
                <div className="mx-auto flex w-fit flex-col items-center gap-2 py-2 [--face-gap:3px] [--face-pad:3px] [--face-size:calc(var(--sticker-size)*3+var(--face-gap)*2+var(--face-pad)*2)] [--sticker-size:20px] sm:gap-3 sm:[--face-gap:4px] sm:[--face-pad:4px] sm:[--sticker-size:42px] lg:gap-4 lg:[--sticker-size:58px]">
                  {CUBE_NET.map((row, rowIdx) => (
                    <div key={rowIdx} className="flex items-start gap-2 sm:gap-3 lg:gap-4">
                      {row.map((face, colIdx) =>
                        face ? (
                          <CubeFace
                            key={face}
                            faceName={face}
                            faceState={cubeState[face]}
                            selectedColor={selectedColor}
                            lastPainted={lastPainted}
                            lockedCenter={lockedCenter}
                            onStickerClick={(i) => paintSticker(face, i)}
                            onStickerDrag={(i) => paintSticker(face, i, false)}
                            onCenterClick={() => showLockedCenter(face)}
                          />
                        ) : (
                          <div key={colIdx} className="w-[var(--face-size)]" />
                        )
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="hidden items-end gap-3 text-sm font-semibold text-slate-700 md:flex">
                  <div className="rounded-full border-2 border-slate-300 bg-white px-5 py-3 shadow-sm">
                    You got this!
                  </div>
                  <span className="font-display text-5xl leading-none">!</span>
                </div>

                <div className="flex flex-wrap justify-end gap-3">
                  <ToolBtn onClick={handleExportJson} icon={FileJson}>
                    Export JSON
                  </ToolBtn>
                  <ToolBtn onClick={handleRandom} icon={Shuffle}>
                    Random
                  </ToolBtn>
                  <ToolBtn onClick={handleClear} icon={Paintbrush} danger>
                    Clear
                  </ToolBtn>
                </div>
              </div>
            </div>
          </section>

          <aside className="flex min-w-0 flex-col gap-4">
            <ValidationPanel cubeState={cubeState} />
          </aside>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-950 px-5 py-2.5 font-display text-base font-semibold text-white shadow-[0_16px_32px_rgba(15,23,42,0.25)] animate-toast-in">
          {toast}
        </div>
      )}
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid size-16 rotate-[-8deg] grid-cols-3 gap-1 rounded-xl bg-slate-950 p-1.5 shadow-[0_10px_20px_rgba(15,23,42,0.2)]">
        {['#22c55e', '#facc15', '#ef4444', '#facc15', '#3b82f6', '#22c55e', '#f97316', '#ffffff', '#3b82f6'].map(
          (color, index) => (
            <span key={index} className="rounded-[4px]" style={{ background: color }} />
          )
        )}
      </div>
      <div>
        <div className="font-display text-[2.35rem] font-bold leading-none text-slate-950">
          Cube<span className="text-blue-600">Guide</span>
        </div>
        <div className="mt-1 font-display text-lg font-medium text-slate-500">Your cube. Your solve.</div>
      </div>
    </div>
  );
}

function NavItem({ icon: Icon, label, active }: { icon: ElementType; label: string; active?: boolean }) {
  return (
    <button
      className={[
        'relative flex items-center gap-2 pb-2 font-display text-lg font-semibold transition-colors',
        active ? 'text-blue-600' : 'text-slate-900 hover:text-blue-600',
      ].join(' ')}
    >
      <Icon className="size-5" />
      {label}
      {active && <span className="absolute inset-x-0 bottom-[-10px] h-[3px] rounded-full bg-blue-600" />}
    </button>
  );
}

function HeaderBtn({
  onClick,
  icon: Icon,
  children,
}: {
  onClick: () => void;
  icon: ElementType;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="flex h-12 items-center gap-2 rounded-2xl bg-blue-600 px-5 font-display text-lg font-semibold text-white shadow-[0_9px_24px_rgba(37,99,235,0.26)] ring-1 ring-blue-600 transition-transform active:scale-95"
    >
      <Icon className="size-5" />
      {children}
    </button>
  );
}

function ToolBtn({
  onClick,
  icon: Icon,
  children,
  danger,
}: {
  onClick: () => void;
  icon: ElementType;
  children: ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="flex h-12 items-center gap-2 rounded-xl bg-white px-5 font-display text-lg font-semibold text-slate-900 shadow-[0_8px_20px_rgba(15,23,42,0.1)] ring-1 ring-black/10 transition-transform active:scale-95"
    >
      <Icon className={['size-5', danger ? 'text-red-500' : 'text-blue-600'].join(' ')} />
      {children}
    </button>
  );
}
