"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useSyncExternalStore } from "react";

const LINKS = [
  { href: "/give", label: "Give" },
  { href: "/partner", label: "Nonprofits" },
  { href: "/driver", label: "Drivers" },
  { href: "/impact", label: "Impact" },
];

function NavLinks({ path }: { path: string | null }) {
  const on = (href: string) => path?.startsWith(href) || (href === "/give" && path?.startsWith("/p/"));
  return (
    <ul className="flex flex-wrap items-center gap-1 text-sm font-semibold">
      {LINKS.map((l) => (
        <li key={l.href}>
          <Link
            href={l.href}
            aria-current={on(l.href) ? "page" : undefined}
            className={`inline-flex min-h-11 items-center rounded-full px-3 sm:px-4 ${on(l.href) ? "bg-primary text-white" : "text-primary hover:bg-surface-muted"}`}
          >
            {l.label}
          </Link>
        </li>
      ))}
      {/* Hidden on phones: the split view needs a wide screen, and the home page links to it. */}
      <li className="hidden sm:block">
        <Link
          href="/demo"
          aria-current={on("/demo") ? "page" : undefined}
          className={`inline-flex min-h-11 items-center px-3 text-xs underline hover:text-primary ${on("/demo") ? "font-bold text-primary" : "font-normal text-secondary"}`}
        >
          Presenter
        </Link>
      </li>
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
