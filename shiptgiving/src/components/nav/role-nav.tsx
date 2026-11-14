"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Give" },
  { href: "/partner", label: "Partner" },
  { href: "/driver", label: "Driver" },
];

export function RoleNav() {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-[1000] border-b border-black/10 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3" aria-label="Main">
        <Link href="/" className="text-lg font-bold tracking-tight text-emerald-700">
          ShiptGiving
        </Link>
        <ul className="flex gap-1 text-sm">
          {LINKS.map((l) => {
            const active = l.href === "/" ? path === "/" || path.startsWith("/p/") : path.startsWith(l.href);
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-full px-3 py-1.5 ${active ? "bg-emerald-700 text-white" : "text-neutral-700 hover:bg-neutral-100"}`}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
