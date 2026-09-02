"use client";
import Image from 'next/image';
import { useState } from 'react';

interface ProductImageProps {
  src?: string | null;
  /** Empty for decorative images whose subject is already written out nearby. */
  alt: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
}

/**
 * A `fill` image that degrades to a neutral tile instead of an empty box.
 *
 * Product and category images come from third-party hosts, and when one of
 * them fails next/image answers 500 and the browser renders nothing — the
 * catalogue turns into a grid of blank squares with no indication why. The
 * placeholder is drawn locally, so it holds up even when every remote host is
 * unreachable.
 */
export default function ProductImage({
  src,
  alt,
  sizes,
  className = '',
  priority = false,
}: ProductImageProps) {
  const [hasFailed, setHasFailed] = useState(false);

  if (!src || hasFailed) {
    return (
      <div
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-1/3 w-1/3 max-h-16 max-w-16 text-zinc-300 dark:text-zinc-600"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={className}
      onError={() => setHasFailed(true)}
    />
  );
}
