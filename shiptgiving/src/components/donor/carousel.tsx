"use client";
import { useRef } from "react";

/** Horizontal Shipt-style row with circular prev/next arrows on wider screens. */
export function Carousel({ label, count, children }: { label: string; count: number; children: React.ReactNode }) {
  const ref = useRef<HTMLUListElement>(null);
  const scroll = (dir: number) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: "smooth" });
  const arrow =
    "absolute top-[30%] z-10 hidden h-10 w-10 items-center justify-center rounded-full border border-hairline bg-white text-lg shadow-float hover:border-primary sm:flex";
  return (
    <div className="relative">
      {count > 2 && (
        <button type="button" aria-label={`Scroll ${label} left`} onClick={() => scroll(-1)} className={`${arrow} -left-4`}>
          ‹
        </button>
      )}
      <ul ref={ref} aria-label={label} className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-2 [scrollbar-width:none]">
        {children}
      </ul>
      {count > 2 && (
        <button type="button" aria-label={`Scroll ${label} right`} onClick={() => scroll(1)} className={`${arrow} -right-4`}>
          ›
        </button>
      )}
    </div>
  );
}
