'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { CubeState, CubeColor, FaceName } from '@/lib/types';

// ─── Color map ────────────────────────────────────────────────────────────────

const COLOR_HEX: Record<CubeColor, number> = {
  white:  0xFFFFFF,
  yellow: 0xFFE000,
  red:    0xFF1A1A,
  orange: 0xFF7000,
  blue:   0x006FFF,
  green:  0x00C040,
  none:   0x1a1a1a,
};

// All stickers are very glossy — modern speedcube look
const COLOR_ROUGHNESS: Record<CubeColor, number> = {
  white: 0.08, yellow: 0.06, red: 0.05, orange: 0.06, blue: 0.05, green: 0.05, none: 0.7,
};

// ─── Geometry constants ────────────────────────────────────────────────────────

const CUBIE_SIZE  = 0.94;
const CUBIE_R     = 0.06;  // sharper corners — modern cube style
const STICKER_OFF = 0.472;
const STICKER_W   = 0.80;  // larger sticker, thin black border

// ─── Face sticker config ──────────────────────────────────────────────────────

const FACE_CONFIG: Record<FaceName, { n: [number,number,number]; rot: [number,number,number] }> = {
  Right: { n: [ 1, 0, 0], rot: [0,  Math.PI/2, 0] },
  Left:  { n: [-1, 0, 0], rot: [0, -Math.PI/2, 0] },
  Up:    { n: [ 0, 1, 0], rot: [-Math.PI/2, 0, 0] },
  Down:  { n: [ 0,-1, 0], rot: [ Math.PI/2, 0, 0] },
  Front: { n: [ 0, 0, 1], rot: [0, 0, 0]           },
  Back:  { n: [ 0, 0,-1], rot: [0, Math.PI, 0]     },
};

// ─── Sticker → cubie position map ─────────────────────────────────────────────

const FACE_STICKER_TO_CUBIE: Record<FaceName, [number,number,number][]> = {
  Front: [[-1,1,1],[0,1,1],[1,1,1],[-1,0,1],[0,0,1],[1,0,1],[-1,-1,1],[0,-1,1],[1,-1,1]],
  Back:  [[1,1,-1],[0,1,-1],[-1,1,-1],[1,0,-1],[0,0,-1],[-1,0,-1],[1,-1,-1],[0,-1,-1],[-1,-1,-1]],
  Up:    [[-1,1,-1],[0,1,-1],[1,1,-1],[-1,1,0],[0,1,0],[1,1,0],[-1,1,1],[0,1,1],[1,1,1]],
  Down:  [[-1,-1,1],[0,-1,1],[1,-1,1],[-1,-1,0],[0,-1,0],[1,-1,0],[-1,-1,-1],[0,-1,-1],[1,-1,-1]],
  Left:  [[-1,1,1],[-1,1,0],[-1,1,-1],[-1,0,1],[-1,0,0],[-1,0,-1],[-1,-1,1],[-1,-1,0],[-1,-1,-1]],
  Right: [[1,1,-1],[1,1,0],[1,1,1],[1,0,-1],[1,0,0],[1,0,1],[1,-1,-1],[1,-1,0],[1,-1,1]],
};

type CubieKey = string;
const k = (x: number, y: number, z: number): CubieKey => `${x},${y},${z}`;

function buildStickerMap(state: CubeState) {
  const map = new Map<CubieKey, Partial<Record<FaceName, CubeColor>>>();
  for (const [face, stickers] of Object.entries(state) as [FaceName, CubeColor[]][]) {
    for (let i = 0; i < 9; i++) {
      const [x, y, z] = FACE_STICKER_TO_CUBIE[face][i];
      const key = k(x, y, z);
      if (!map.has(key)) map.set(key, {});
      map.get(key)![face] = stickers[i];
    }
  }
  return map;
}

// ─── Shared body material (black plastic) ─────────────────────────────────────

const bodyMat = new THREE.MeshStandardMaterial({
  color: 0x080808,
  roughness: 0.4,
  metalness: 0.0,
});

// ─── Single cubie ─────────────────────────────────────────────────────────────

function Cubie({ pos, faces }: { pos: [number,number,number]; faces: Partial<Record<FaceName, CubeColor>> }) {
  // Memoize sticker materials by color combination
  const stickerMats = useMemo(() =>
    (Object.entries(faces) as [FaceName, CubeColor][]).map(([face, color]) => ({
      face,
      mat: new THREE.MeshStandardMaterial({
        color: COLOR_HEX[color],
        roughness: COLOR_ROUGHNESS[color],
        metalness: 0.0,
        envMapIntensity: 0.6,
      }),
      pos: FACE_CONFIG[face].n.map(v => v * STICKER_OFF) as [number,number,number],
      rot: FACE_CONFIG[face].rot,
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [Object.entries(faces).map(([f,c]) => `${f}:${c}`).join(',')]
  );

  return (
    <group position={pos}>
      <RoundedBox args={[CUBIE_SIZE, CUBIE_SIZE, CUBIE_SIZE]} radius={CUBIE_R} smoothness={4} material={bodyMat} />
      {stickerMats.map(({ face, mat, pos: sp, rot }) => (
        <mesh key={face} position={sp} rotation={rot} material={mat}>
          <planeGeometry args={[STICKER_W, STICKER_W]} />
        </mesh>
      ))}
    </group>
  );
}

// ─── The full 3×3×3 cube ──────────────────────────────────────────────────────

const ALL_CUBIES: [number,number,number][] = [];
for (let x = -1; x <= 1; x++)
  for (let y = -1; y <= 1; y++)
    for (let z = -1; z <= 1; z++)
      ALL_CUBIES.push([x, y, z]);

function CubeGroup({ state, paused }: { state: CubeState; paused: boolean }) {
  const ref = useRef<THREE.Group>(null!);
  const stickerMap = useMemo(() => buildStickerMap(state), [state]);

  useFrame((_, dt) => {
    if (!paused && ref.current) ref.current.rotation.y += dt * 0.28;
  });

  return (
    <group ref={ref}>
      {ALL_CUBIES.map(([x, y, z]) => (
        <Cubie key={k(x,y,z)} pos={[x,y,z]} faces={stickerMap.get(k(x,y,z)) ?? {}} />
      ))}
    </group>
  );
}

// ─── Shared scene contents ────────────────────────────────────────────────────

function Scene({ state, paused }: { state: CubeState; paused: boolean }) {
  return (
    <>
      <color attach="background" args={['#f8f8f8']} />
      <ambientLight intensity={0.5} />
      {/* Key light — top right front */}
      <directionalLight position={[5, 8, 5]} intensity={2.0} />
      {/* Fill light — soft left */}
      <directionalLight position={[-4, 2, 2]} intensity={0.5} />
      {/* Rim light — back bottom, makes black plastic edges pop */}
      <directionalLight position={[0, -4, -5]} intensity={0.3} />
      <CubeGroup state={state} paused={paused} />
    </>
  );
}

// ─── Fullscreen modal ─────────────────────────────────────────────────────────

function FullscreenModal({ state, onClose }: { state: CubeState; onClose: () => void }) {
  const [dragging, setDragging] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(10,10,12,0.88)', backdropFilter: 'blur(8px)' }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 text-white/60 hover:text-white transition-colors text-sm flex items-center gap-1.5"
      >
        <span>ESC</span>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </button>

      <div style={{ width: '90vmin', height: '90vmin', maxWidth: 700, maxHeight: 700 }}>
        <Canvas camera={{ position: [4.5, 3.5, 4.5], fov: 36 }} gl={{ antialias: true }} shadows>
          <color attach="background" args={['#111114']} />
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 8, 5]} intensity={2.2} />
          <directionalLight position={[-4, 2, 2]} intensity={0.5} />
          <directionalLight position={[0, -4, -5]} intensity={0.3} />
          <CubeGroup state={state} paused={dragging} />
          <OrbitControls
            enableZoom
            enablePan={false}
            minPolarAngle={Math.PI / 8}
            maxPolarAngle={Math.PI * 0.78}
            onStart={() => setDragging(true)}
            onEnd={() => setDragging(false)}
          />
        </Canvas>
      </div>

      <p className="absolute bottom-5 text-white/30 text-xs">drag to rotate · scroll to zoom · esc to close</p>
    </div>,
    document.body
  );
}

// ─── Main exported component ──────────────────────────────────────────────────

export default function CubeVisualizer({ cubeState }: { cubeState: CubeState }) {
  const [dragging, setDragging] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <>
      <div className="rounded-[24px] bg-white/90 shadow-[0_12px_30px_rgba(15,23,42,0.1)] ring-1 ring-black/10 overflow-hidden" style={{ height: 380 }}>
        <div className="px-5 pt-4 pb-1 flex items-center justify-between">
          <span className="font-display text-lg font-semibold text-slate-950">Preview</span>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">drag to rotate</span>
            <button
              onClick={() => setFullscreen(true)}
              title="Fullscreen"
              className="text-slate-400 hover:text-slate-700 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M1 6V2h4M10 2h4v4M15 10v4h-4M6 15H2v-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
        <Canvas camera={{ position: [4, 3.2, 4], fov: 38 }} style={{ height: 330 }} gl={{ antialias: true }}>
          <Scene state={cubeState} paused={dragging} />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI * 0.72}
            onStart={() => setDragging(true)}
            onEnd={() => setDragging(false)}
          />
        </Canvas>
      </div>

      {fullscreen && <FullscreenModal state={cubeState} onClose={() => setFullscreen(false)} />}
    </>
  );
}
