import type { SVGProps } from "react";

/** Megaphone icon for ads management sidebar nav. */
export function SidebarAdsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path
        d="M18 11V8L14 4H6C4.9 4 4 4.9 4 6V14C4 15.1 4.9 16 6 16H7V20L11 16H14V13H18C19.1 13 20 12.1 20 11V11H18ZM16 11H12L9 14V12H6V6H13L16 9V11Z"
        fill="currentColor"
      />
    </svg>
  );
}
