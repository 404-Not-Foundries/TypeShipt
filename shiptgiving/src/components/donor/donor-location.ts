"use client";
import { useCallback, useState } from "react";
import type { LatLng } from "@/lib/types";

// shortcut: no donor accounts, so estimates start from UAB until the donor shares a location.
const DEFAULT: { point: LatLng; label: string } = { point: { lat: 33.5021, lng: -86.8064 }, label: "UAB campus (demo address)" };

export function useDonorLocation() {
  const [loc, setLoc] = useState(DEFAULT);
  const [locating, setLocating] = useState(false);

  const locate = useCallback(() => {
    if (!("geolocation" in navigator)) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoc({ point: { lat: pos.coords.latitude, lng: pos.coords.longitude }, label: "your location" });
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 8000 },
    );
  }, []);

  return { ...loc, locating, locate };
}
