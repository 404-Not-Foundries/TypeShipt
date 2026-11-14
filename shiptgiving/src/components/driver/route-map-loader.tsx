"use client";
import dynamic from "next/dynamic";

// Leaflet touches window on import, so the map only loads in the browser.
export const RouteMap = dynamic(() => import("./route-map"), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center text-sm text-neutral-500">Loading map…</div>,
});
