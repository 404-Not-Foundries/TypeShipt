"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useSyncExternalStore } from "react";

const LINKS = [
  { href: "/", label: "Give" },
  { href: "/partner", label: "Partner" },
  { href: "/driver", label: "Driver" },
  { href: "/impact", label: "Impact" },
  { href: "/demo", label: "Demo" },
];

function NavLinks({ path }: { path: string | null }) {
  return (
    <ul className="flex flex-wrap gap-1 text-sm font-semibold">
      {LINKS.map((l) => {
        const active =
          path !== null && (l.href === "/" ? path === "/" || path.startsWith("/p/") : path.startsWith(l.href));
        return (
          <li key={l.href}>
            <Link
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={`inline-flex min-h-11 items-center rounded-full px-4 ${active ? "bg-primary text-white" : "text-primary hover:bg-surface-muted"}`}
            >
              {l.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function ActiveNavLinks() {
  return <NavLinks path={usePathname()} />;
}

const noSubscription = () => () => {};

export function RoleNav() {
  // Inside the /demo split view each page is an iframe; the presenter's nav is enough.
  const embedded = useSyncExternalStore(noSubscription, () => window.self !== window.top, () => false);
  if (embedded) return null;
  return (
    <header className="z-[1000] border-b border-hairline bg-white sm:sticky sm:top-0">
      <nav
        className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2"
        aria-label="Main"
      >
        <Link href="/" className="inline-flex min-h-11 items-center text-xl font-extrabold tracking-tight text-primary">
          ShiptGiving
        </Link>
        {/* usePathname() needs a Suspense boundary so dynamic routes like /p/[id] can prerender. */}
        <Suspense fallback={<NavLinks path={null} />}>
          <ActiveNavLinks />
        </Suspense>
      </nav>
    </header>
  );
}
