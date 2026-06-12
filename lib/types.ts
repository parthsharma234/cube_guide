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

// The center sticker (index 4) of each face is locked — it defines the face color
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
    state[face] = Array(9).fill("none") as CubeColor[];
    state[face][4] = center; // lock center
  }
  return state;
}
