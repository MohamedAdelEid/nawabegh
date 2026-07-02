/** Canonical reaction emojis — must match API storage exactly (Unicode NFC). */
export const CHAT_REACTION_EMOJIS = [
  "\u{1F62E}", // 😮
  "\u{1F389}", // 🎉
  "\u{1F602}", // 😂
  "\u{2764}\u{FE0F}", // ❤️
  "\u{1F44D}\u{FE0F}", // 👍
] as const;

export type ChatReactionEmoji = (typeof CHAT_REACTION_EMOJIS)[number];
