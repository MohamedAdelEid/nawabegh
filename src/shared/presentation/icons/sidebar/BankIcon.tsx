import type { SVGProps } from "react";

/** Classical bank / landmark building (account-balance style). */
export function SidebarBankIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...props}
    >
      <path
        d="M12 2L2 7.25V9.5H22V7.25L12 2ZM12 5.35L17.6 8H6.4L12 5.35ZM4 11.5V19.5H7V11.5H4ZM10.25 11.5V19.5H13.75V11.5H10.25ZM17 11.5V19.5H20V11.5H17ZM3 21.5H21V19.5H3V21.5Z"
        fill="currentColor"
      />
    </svg>
  );
}
