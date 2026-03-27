"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookHeart, BookOpen, LibraryBig } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Followed", icon: LibraryBig },
  { href: "/new-upcoming-releases", label: "Releases", icon: BookOpen, countKey: "releases" },
  { href: "/my-preorders", label: "Pre-orders", icon: BookHeart },
];

function displayCount(value) {
  if (!value) return "";
  return value > 99 ? "99+" : String(value);
}

export default function BottomNav({ mobile = false, counts = {}, desktopLinksOnly = false }) {
  const pathname = usePathname();
  const navClass = mobile ? "bottomNav bottomNav--mobile" : "bottomNav bottomNav--desktop";

  return (
    <nav className={navClass} aria-label="Primary">
      <div className="bottomNav__inner">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href === "/" && pathname === "/follow-series");
          const Icon = item.icon;
          const countValue = item.countKey ? counts[item.countKey] : null;
          return (
            <Link key={item.href} href={item.href} className={`bottomNav__item ${isActive ? "bottomNav__item--active" : ""}`}>
              <Icon size={14} strokeWidth={1.9} />
              <span className="bottomNav__label">
                {item.label}
                {countValue ? <span className="bottomNav__countInline">{displayCount(countValue)}</span> : null}
              </span>
            </Link>
          );
        })}
        {!mobile && desktopLinksOnly ? (
          <a href="https://tankobonbon.com" target="_blank" rel="noopener noreferrer" className="bottomNav__item bottomNav__item--external">
            Back to Tankobonbon
          </a>
        ) : null}
      </div>
    </nav>
  );
}
