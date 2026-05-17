"use client";

import type { StaticImageData } from "next/image";
import {
  isValidElement,
  type ComponentPropsWithoutRef,
  type ComponentType,
  type ReactElement,
  type SVGProps,
} from "react";

export type IconCompSrc =
  | string
  | StaticImageData
  | ComponentType<SVGProps<SVGSVGElement>>
  | ReactElement;

export type IconCompProps = Omit<ComponentPropsWithoutRef<"img">, "src"> & {
  src: IconCompSrc;
};

function isStaticImageData(value: unknown): value is StaticImageData {
  return (
    typeof value === "object" &&
    value !== null &&
    "src" in value &&
    typeof (value as StaticImageData).src === "string"
  );
}

/**
 * Renders a URL, Next static SVG import, inline SVG component, or ready element.
 *
 * @example
 * import myIcon from "./my-icon.svg";
 * <IconComp src={myIcon} alt="" aria-hidden className="h-5 w-5" />
 */
export function IconComp({
  src,
  width,
  height,
  alt = "",
  decoding = "async",
  ...rest
}: IconCompProps) {
  if (typeof src === "function") {
    const Svg = src;
    return (
      <Svg
        width={width}
        height={height}
        aria-label={alt === "" ? undefined : alt}
        aria-hidden={alt === "" ? true : undefined}
        {...(rest as SVGProps<SVGSVGElement>)}
      />
    );
  }

  if (isValidElement(src)) {
    return src;
  }

  const url = typeof src === "string" ? src : isStaticImageData(src) ? src.src : "";
  const intrinsicW = isStaticImageData(src) ? src.width : undefined;
  const intrinsicH = isStaticImageData(src) ? src.height : undefined;

  return (
    <img
      src={url}
      alt={alt}
      width={width ?? intrinsicW}
      height={height ?? intrinsicH}
      decoding={decoding}
      {...rest}
    />
  );
}
