"use client";
import { useEffect, useState } from "react";

/** Current time, refreshed on an interval, so "2 min ago" labels stay fresh without impure renders. */
export function useNow(intervalMs = 30000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
