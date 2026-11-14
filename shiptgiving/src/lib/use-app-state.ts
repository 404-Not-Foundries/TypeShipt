"use client";
import { useCallback, useEffect, useState } from "react";
import type { AppState } from "@/lib/types";

const POLL_MS = 2000;

/** Live app state for any view: polls GET /api/state every 2 s. Call refresh() after a mutation. */
export function useAppState() {
  const [state, setState] = useState<AppState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/state", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setState(await res.json());
      setError(null);
    } catch {
      setError("Can't reach the server. Retrying…");
    }
  }, []);

  useEffect(() => {
    const first = setTimeout(refresh, 0);
    const id = setInterval(refresh, POLL_MS);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [refresh]);

  return { state, error, refresh };
}
