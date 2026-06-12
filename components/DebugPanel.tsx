'use client';

import { useState } from 'react';
import { CubeState } from '@/lib/types';

interface Props {
  cubeState: CubeState;
}

export default function DebugPanel({ cubeState }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-zinc-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-2 text-xs font-medium text-zinc-500 hover:bg-zinc-50 transition-colors"
      >
        <span>Debug — cube state JSON</span>
        <span>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <pre className="text-xs text-zinc-600 bg-zinc-50 p-4 overflow-x-auto leading-relaxed border-t border-zinc-200">
          {JSON.stringify(cubeState, null, 2)}
        </pre>
      )}
    </div>
  );
}
