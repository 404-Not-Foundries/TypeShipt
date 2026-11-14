"use client";
// "App | How it works" toggle for the header. Owner: rmaytr. "App" returns to the last app page this tab visited.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useSyncExternalStore } from "react";

const EXPLAIN = "/how-it-works";
const KEY = "shiptgiving:last-app-path";
const noSubscription = () => () => {};

/** Last app path from this tab's session; home when storage is blocked or holds anything but a same-site path. */
function readLast(): string {
  try {
    const path = sessionStorage.getItem(KEY);
    return path && path.startsWith("/") && !path.startsWith("//") ? path : "/";
  } catch {
    return "/";
  }
}

function Toggle({ path }: { path: string | null }) {
  const explaining = path?.startsWith(EXPLAIN) ?? false;
  const last = useSyncExternalStore(noSubscription, readLast, () => "/");

  useEffect(() => {
    if (!path || explaining) return;
    try {
      sessionStorage.setItem(KEY, path);
    } catch {
      // storage blocked: "App" falls back to the home page
    }
  }, [path, explaining]);

  const options = [
    { href: explaining ? last : (path ?? "/"), label: "App", on: !explaining },
    { href: EXPLAIN, label: "How it works", on: explaining },
  ];
  return (
    <ul aria-label="Switch view" className="inline-flex rounded-full border border-hairline bg-white p-0.5 text-sm font-semibold">
      {options.map((o) => (
        <li key={o.label}>
          <Link
            href={o.href}
            aria-current={o.on ? "page" : undefined}
            className={`inline-flex min-h-10 items-center rounded-full px-3 ${o.on ? "bg-primary text-white" : "text-primary hover:bg-surface-muted"}`}
          >
            {o.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function ActiveToggle() {
  return <Toggle path={usePathname()} />;
}

/** Mount once in the header. usePathname() sits behind Suspense so dynamic routes still prerender. */
export function ViewSwitcher() {
  return (
    <Suspense fallback={<Toggle path={null} />}>
      <ActiveToggle />
    </Suspense>
  );
}
