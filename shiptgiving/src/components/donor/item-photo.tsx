"use client";
import { useState } from "react";
import { ITEM_IMAGES } from "@/lib/item-images";
import { CategoryArt } from "./category-art";

type Props = { itemId: string; category?: string; alt: string; className?: string };

/** Catalog photo from the static snapshot; falls back to the category line art if it is missing or fails to load. */
export function ItemPhoto({ itemId, category, alt, className = "" }: Props) {
  const [failed, setFailed] = useState(false);
  const image = ITEM_IMAGES[itemId];
  if (!image || failed) return <CategoryArt category={category} className={className} />;
  return (
    <div className={`overflow-hidden bg-surface-muted ${className}`}>
      {/* Plain img: the snapshot spans several hosts, and the fallback needs onError. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.url}
        alt={alt}
        title={`Photo: ${image.credit}`}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

export function PhotoCredits() {
  const rows = Object.entries(ITEM_IMAGES);
  if (rows.length === 0) return null;
  return (
    <details className="text-xs text-secondary">
      <summary className="inline-flex min-h-11 cursor-pointer items-center underline">Photo credits</summary>
      <p className="mb-1">Item photos are freely licensed and shown for illustration; they are not the exact products.</p>
      <ul className="columns-1 gap-6 sm:columns-2">
        {rows.map(([id, image]) => (
          <li key={id}>
            {id}: {image.credit}
          </li>
        ))}
      </ul>
    </details>
  );
}
