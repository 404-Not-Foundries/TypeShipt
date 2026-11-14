"use client";
import { useCallback, useSyncExternalStore } from "react";

// Pledge ids made in this browser, so a donor can see status and receipts without an account.
const KEY = "shiptgiving.myPledges";
const listeners = new Set<() => void>();
let cache: string | null = null;

function read(): string {
  try {
    cache = localStorage.getItem(KEY) ?? "[]";
  } catch {
    cache ??= "[]";
  }
  return cache;
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useMyPledgeIds(): [string[], (id: string) => void] {
  const raw = useSyncExternalStore(subscribe, read, () => "[]");
  const add = useCallback((id: string) => {
    const next = JSON.stringify([id, ...(JSON.parse(read()) as string[])].slice(0, 50));
    cache = next;
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // private mode: keep it in memory for this tab
    }
    listeners.forEach((l) => l());
  }, []);
  return [JSON.parse(raw) as string[], add];
}
