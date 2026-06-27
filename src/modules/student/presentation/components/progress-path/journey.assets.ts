const JOURNEY_BASE = "/images/student/journey";

export const JOURNEY_ASSETS = {
  background: `${JOURNEY_BASE}/background.png`,
  capGraduation: `${JOURNEY_BASE}/cap graduation.png`,
  cup: `${JOURNEY_BASE}/cup.png`,
  stations: {
    shadow: `${JOURNEY_BASE}/stations/node-shadow.svg`,
    shadowBlue: `${JOURNEY_BASE}/stations/node-shadow-blue.svg`,
    shadowGold: `${JOURNEY_BASE}/stations/node-shadow-gold.svg`,
    shadowGray: `${JOURNEY_BASE}/stations/node-shadow-gray.svg`,
    shadowRed: `${JOURNEY_BASE}/stations/node-shadow-red.svg`,
    maskGreen: `${JOURNEY_BASE}/stations/node-mask-green.svg`,
    maskBlue: `${JOURNEY_BASE}/stations/node-mask-blue.svg`,
    maskGold: `${JOURNEY_BASE}/stations/node-mask-gold.svg`,
    maskGray: `${JOURNEY_BASE}/stations/node-mask-gray.svg`,
    maskRed: `${JOURNEY_BASE}/stations/node-mask-red.svg`,
    iconBook: `${JOURNEY_BASE}/stations/icon-book.svg`,
    iconQuiz: `${JOURNEY_BASE}/stations/icon-quiz.svg`,
    iconLive: `${JOURNEY_BASE}/stations/icon-live.svg`,
    iconChallenge: `${JOURNEY_BASE}/stations/icon-challenge.svg`,
    iconChest: `${JOURNEY_BASE}/stations/icon-chest.svg`,
    iconPath: `${JOURNEY_BASE}/stations/icon-path.svg`,
  },
} as const;
