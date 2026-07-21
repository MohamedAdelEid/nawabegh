const JOURNEY_BASE = "/images/student/journey";

/** Mobile-parity assets from `production-nawabegh/assets/icons/path`. */
export const JOURNEY_ASSETS = {
  background: `${JOURNEY_BASE}/bg/bg_pattern.png`,
  backgroundFull: `${JOURNEY_BASE}/bg/backround_learing_path.svg`,
  capGraduation: `${JOURNEY_BASE}/cap graduation.png`,
  cup: `${JOURNEY_BASE}/cup.png`,
  trophy: `${JOURNEY_BASE}/trophy.svg`,
  coin: `${JOURNEY_BASE}/coin_icon.svg`,
  headerBook: `${JOURNEY_BASE}/header_book_icon.svg`,
  trailLeft: `${JOURNEY_BASE}/trail/trail_vector_44.svg`,
  trailRight: `${JOURNEY_BASE}/trail/trail_vector_47.svg`,
  treasureOpen: `${JOURNEY_BASE}/stone_treasure_open.svg`,
  treasureClosed: `${JOURNEY_BASE}/stone_treasure_closed.svg`,
  stones: {
    book: `${JOURNEY_BASE}/stones/stone_book.svg`,
    quiz: `${JOURNEY_BASE}/stones/stone_quiz.svg`,
    flashcards: `${JOURNEY_BASE}/stones/stone_books_stack.svg`,
    live: `${JOURNEY_BASE}/stones/stone_live.svg`,
    challenge: `${JOURNEY_BASE}/stones/stone_challenge.svg`,
  },
  /** @deprecated Prefer `headerBook` / stone composites — kept for banner fallback. */
  stations: {
    iconPath: `${JOURNEY_BASE}/header_book_icon.svg`,
    iconBook: `${JOURNEY_BASE}/stones/stone_book.svg`,
    iconQuiz: `${JOURNEY_BASE}/stones/stone_quiz.svg`,
    iconLive: `${JOURNEY_BASE}/stones/stone_live.svg`,
    iconChallenge: `${JOURNEY_BASE}/stones/stone_challenge.svg`,
    iconChest: `${JOURNEY_BASE}/stone_treasure_closed.svg`,
  },
} as const;
