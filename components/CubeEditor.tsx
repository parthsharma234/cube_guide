'use client';

import { useState, useCallback } from 'react';
import {
  CubeState,
  CubeColor,
  FaceName,
  FACE_NAMES,
  makeDefaultCubeState,
} from '@/lib/types';
import ColorPalette from './ColorPalette';
import CubeFace from './CubeFace';
import ValidationPanel from './ValidationPanel';
import DebugPanel from './DebugPanel';

const STORAGE_KEY = 'cubeguide_cube_state';

// The six faces laid out in a cross pattern so it mirrors an unfolded cube:
//       [Up]
// [Left][Front][Right][Back]
//       [Down]
const CUBE_NET: (FaceName | null)[][] = [
  [null,    'Up',    null,    null  ],
  ['Left',  'Front', 'Right', 'Back'],
  [null,    'Down',  null,    null  ],
];

export default function CubeEditor() {
  const [cubeState, setCubeState] = useState<CubeState>(makeDefaultCubeState);
  const [selectedColor, setSelectedColor] = useState<CubeColor>('white');
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }

  const paintSticker = useCallback(
    (face: FaceName, index: number) => {
      setCubeState((prev) => {
        const updated = { ...prev, [face]: [...prev[face]] };
        updated[face][index] = selectedColor;
        return updated;
      });
    },
    [selectedColor]
  );

  function resetCube() {
    setCubeState(makeDefaultCubeState());
    showToast('Cube reset.');
  }

  function saveCube() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cubeState));
    showToast('Saved to browser storage.');
  }

  function loadCube() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      showToast('No saved cube found.');
      return;
    }
    try {
      setCubeState(JSON.parse(raw) as CubeState);
      showToast('Cube loaded.');
    } catch {
      showToast('Failed to load — saved data is corrupt.');
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Color picker */}
      <ColorPalette selected={selectedColor} onSelect={setSelectedColor} />

      {/* Cube net */}
      <div className="flex flex-col gap-1 items-center">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide self-start mb-1">
          Cube Faces
        </p>
        {CUBE_NET.map((row, rowIdx) => (
          <div key={rowIdx} className="flex gap-2">
            {row.map((face, colIdx) =>
              face ? (
                <CubeFace
                  key={face}
                  faceName={face}
                  faceState={cubeState[face]}
                  selectedColor={selectedColor}
                  onStickerClick={(i) => paintSticker(face, i)}
                />
              ) : (
                // empty cell to preserve grid spacing
                <div key={colIdx} className="w-[calc(40px*3+8px+12px)]" />
              )
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={resetCube}
          className="px-4 py-2 text-sm rounded-lg border border-zinc-300 text-zinc-700 hover:bg-zinc-100 transition-colors"
        >
          Reset cube
        </button>
        <button
          onClick={saveCube}
          className="px-4 py-2 text-sm rounded-lg border border-zinc-300 text-zinc-700 hover:bg-zinc-100 transition-colors"
        >
          Save locally
        </button>
        <button
          onClick={loadCube}
          className="px-4 py-2 text-sm rounded-lg border border-zinc-300 text-zinc-700 hover:bg-zinc-100 transition-colors"
        >
          Load saved
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-zinc-800 text-white text-sm px-4 py-2 rounded-lg shadow-lg pointer-events-none">
          {toast}
        </div>
      )}

      {/* Validation */}
      <ValidationPanel cubeState={cubeState} />

      {/* Debug */}
      <DebugPanel cubeState={cubeState} />
    </div>
  );
}
