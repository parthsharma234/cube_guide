export type FaceName = "Up" | "Down" | "Front" | "Back" | "Left" | "Right";

export type CubeColor =
  | "white"
  | "yellow"
  | "red"
  | "orange"
  | "blue"
  | "green"
  | "none";

// Each face is a flat array of 9 stickers, row-major (top-left to bottom-right)
export type FaceState = CubeColor[];

export type CubeState = Record<FaceName, FaceState>;

export const FACE_NAMES: FaceName[] = [
  "Up",
  "Down",
  "Front",
  "Back",
  "Left",
  "Right",
];

export const COLORS: CubeColor[] = [
  "white",
  "yellow",
  "red",
  "orange",
  "blue",
  "green",
];

// Centers are fixed — they define each face's color and never change
export const FACE_CENTERS: Record<FaceName, CubeColor> = {
  Up: "white",
  Down: "yellow",
  Front: "red",
  Back: "orange",
  Left: "blue",
  Right: "green",
};

export function makeDefaultCubeState(): CubeState {
  const state = {} as CubeState;
  for (const face of FACE_NAMES) {
    const center = FACE_CENTERS[face];
    const stickers = Array(9).fill("none") as CubeColor[];
    stickers[4] = center; // index 4 is always the center
    state[face] = stickers;
  }
  return state;
}
