export type HomeNavEntranceDirection =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "topLeft"
  | "topRight"
  | "bottomLeft"
  | "bottomRight";

const ENTRANCE_DIRECTIONS: HomeNavEntranceDirection[] = [
  "top",
  "right",
  "bottom",
  "left",
  "topRight",
  "bottomLeft",
  "topLeft",
  "bottomRight",
];

export type HomeNavEntranceState = {
  opacity: number;
  x?: number | string;
  y?: number | string;
  scale?: number;
  rotate?: number;
};

const OFF_SCREEN_OFFSETS: Record<HomeNavEntranceDirection, HomeNavEntranceState> = {
  top: { opacity: 0, y: "-110vh", scale: 0.86, rotate: -3 },
  bottom: { opacity: 0, y: "110vh", scale: 0.86, rotate: 3 },
  left: { opacity: 0, x: "-110vw", scale: 0.86, rotate: 5 },
  right: { opacity: 0, x: "110vw", scale: 0.86, rotate: -5 },
  topLeft: { opacity: 0, x: "-95vw", y: "-95vh", scale: 0.82, rotate: -7 },
  topRight: { opacity: 0, x: "95vw", y: "-95vh", scale: 0.82, rotate: 7 },
  bottomLeft: { opacity: 0, x: "-95vw", y: "95vh", scale: 0.82, rotate: 6 },
  bottomRight: { opacity: 0, x: "95vw", y: "95vh", scale: 0.82, rotate: -6 },
};

export const HOME_NAV_ENTRANCE_VISIBLE: HomeNavEntranceState = {
  opacity: 1,
  x: 0,
  y: 0,
  scale: 1,
  rotate: 0,
};

export function getHomeNavEntranceDirection(index: number): HomeNavEntranceDirection {
  return ENTRANCE_DIRECTIONS[index % ENTRANCE_DIRECTIONS.length] ?? "top";
}

export function getHomeNavEntranceInitial(
  direction: HomeNavEntranceDirection,
  reduceMotion = false,
): HomeNavEntranceState {
  if (reduceMotion) {
    return { opacity: 0 };
  }

  return OFF_SCREEN_OFFSETS[direction];
}
