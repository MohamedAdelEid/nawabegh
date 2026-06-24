"use client";

import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";
import { cn } from "@/shared/application/lib/cn";

type CommunityMediaImageProps = {
  src: string | null | undefined;
  alt: string;
  className?: string;
};

/** Renders uploaded community media using the shared file URL resolver. */
export function CommunityMediaImage({ src, alt, className }: CommunityMediaImageProps) {
  const resolvedSrc = resolveFileUrl(src);
  if (!resolvedSrc) return null;

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      loading="lazy"
      className={cn("w-full object-cover", className)}
    />
  );
}

export function resolveCommunityFileUrl(pathOrUrl: string | null | undefined): string | null {
  return resolveFileUrl(pathOrUrl);
}
