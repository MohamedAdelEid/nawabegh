import type { SVGProps } from "react";

export function Mobile2(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="396"
      height="716"
      viewBox="0 0 396 716"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...props}
    >
            <g filter="url(#filter0_dd_977_5068)">
                <rect x="38" y="13" width="320" height="640" rx="48" fill="white" fillOpacity="0.01" shapeRendering="crispEdges" />
            </g>
            <defs>
                <filter id="filter0_dd_977_5068" x="0" y="0" width="396" height="716" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                    <feMorphology radius="12" operator="erode" in="SourceAlpha" result="effect1_dropShadow_977_5068" />
                    <feOffset dy="25" />
                    <feGaussianBlur stdDeviation="25" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_977_5068" />
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                    <feMorphology radius="4" operator="dilate" in="SourceAlpha" result="effect2_dropShadow_977_5068" />
                    <feOffset />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0.945098 0 0 0 0 0.960784 0 0 0 0 0.976471 0 0 0 1 0" />
                    <feBlend mode="normal" in2="effect1_dropShadow_977_5068" result="effect2_dropShadow_977_5068" />
                    <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_977_5068" result="shape" />
                </filter>
            </defs>
        </svg>
    );
}
