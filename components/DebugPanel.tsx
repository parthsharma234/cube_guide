'use client';

import { ChevronDown, ChevronUp, Bug } from 'lucide-react';
import { useState } from 'react';
import { CubeState } from '@/lib/types';

interface Props {
  cubeState: CubeState;
}

export default function DebugPanel({ cubeState }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-3xl border border-black/10 bg-white/70 shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-xs font-medium text-slate-500 transition-colors hover:bg-white/80"
      >
        <span className="flex items-center gap-2">
          <Bug className="size-3.5" />
          cube state
        </span>
        {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
      </button>
      {open && (
        <pre className="overflow-x-auto border-t border-black/10 bg-slate-950 px-4 py-4 text-xs leading-relaxed text-slate-200">
          {JSON.stringify(cubeState, null, 2)}
        </pre>
      )}
    </div>
  );
}
