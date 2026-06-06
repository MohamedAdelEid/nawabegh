import type { SVGProps } from "react";

export function Mobile(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="128"
      height="24"
      viewBox="0 0 128 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...props}
    >
      <path
        d="M0 0H128V8C128 16.8366 120.837 24 112 24H16C7.16344 24 0 16.8366 0 8V0Z"
        fill="#1E293B"
      />
    </svg>
  );
}
