/**
 * Two-character style initials for avatars (e.g. table rows).
 * Uses the first letter of up to two whitespace-separated name parts.
 */
export function getUserDisplayInitials(name: string): string {
  const segments = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (segments.length === 0) return "؟";
  return segments.map((segment) => segment[0]).join("");
}
