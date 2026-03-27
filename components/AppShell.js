"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MoonStar, Share2, SunMedium } from "lucide-react";
import BottomNav from "./BottomNav";

const ROUTES = ["/", "/new-upcoming-releases", "/my-preorders"];

export default function AppShell({
  eyebrow,
  title,
  intro,
  stats,
  sidebar,
  children,
  desktopToolbar,
  mobileToolbar,
  theme,
  onToggleTheme,
  navCounts,
}) {
  const pathname = usePathname();
  const router = useRouter();
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    function handleBeforeInstallPrompt(event) {
      event.preventDefault();
      setDeferredPrompt(event);
    }
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  function handleTouchStart(event) {
    if (typeof window !== "undefined" && window.innerWidth >= 768) return;
    if (event.target.closest("input, button, a, select, textarea, label, summary")) return;
    touchStartX.current = event.changedTouches[0].clientX;
    touchStartY.current = event.changedTouches[0].clientY;
  }

  function handleTouchEnd(event) {
    if (typeof window !== "undefined" && window.innerWidth >= 768) return;
    if (touchStartX.current == null || touchStartY.current == null) return;

    const endX = event.changedTouches[0].clientX;
    const endY = event.changedTouches[0].clientY;
    const deltaX = endX - touchStartX.current;
    const deltaY = endY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;

    if (Math.abs(deltaX) < 58 || Math.abs(deltaY) > 42) return;

    const currentIndex = ROUTES.includes(pathname)
      ? ROUTES.indexOf(pathname)
      : pathname === "/follow-series"
        ? 0
        : -1;

    if (currentIndex === -1) return;
    if (deltaX < 0 && currentIndex < ROUTES.length - 1) router.push(ROUTES[currentIndex + 1]);
    if (deltaX > 0 && currentIndex > 0) router.push(ROUTES[currentIndex - 1]);
  }

  async function handleShare() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      try {
        await deferredPrompt.userChoice;
      } catch {}
      setDeferredPrompt(null);
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          text: "Tankobonbon Release Tracker",
          url: window.location.href,
        });
      } catch {}
    }
  }

  return (
    <main className="followShelf" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <header className="topNavBar">
        <div className="topNavBar__inner">
          <button type="button" className="brandButton" onClick={() => window.location.reload()}>
            Tankobonbon Release Tracker
          </button>
          <BottomNav counts={navCounts} desktopLinksOnly />
          <div className="topNavBar__actions">
            <button type="button" className="themeToggle" onClick={onToggleTheme} aria-label="Toggle dark mode">
              {theme === "dark" ? <SunMedium size={16} strokeWidth={1.9} /> : <MoonStar size={16} strokeWidth={1.9} />}
            </button>
          </div>
        </div>
      </header>

      <div className="followShelf__shell">
        <aside className="followShelf__sidebar">
          <header className="heroCard">
            <p className="eyebrow">{eyebrow}</p>
            <div className="heroCard__titleRow">
              <h1 className="heroTitle">{title}</h1>
              <div className="heroCard__actions heroCard__actions--mobileOnly">
                <button type="button" className="themeToggle" onClick={onToggleTheme} aria-label="Toggle dark mode">
                  {theme === "dark" ? <SunMedium size={16} strokeWidth={1.9} /> : <MoonStar size={16} strokeWidth={1.9} />}
                </button>
                <button type="button" className="themeToggle" onClick={handleShare} aria-label="Share this page">
                  <Share2 size={16} strokeWidth={1.9} />
                </button>
              </div>
            </div>
            <p className="heroIntro">{intro}</p>
            {!!stats?.length && (
              <div className={`statsRow ${stats.length === 2 ? "statsRow--two" : ""}`}>
                {stats.map((stat) => (
                  <div key={stat.label} className="statCard">
                    <span className="statCard__label">{stat.label}</span>
                    <strong className="statCard__value">{stat.value}</strong>
                  </div>
                ))}
              </div>
            )}
          </header>

          {sidebar}
        </aside>

        <div className="followShelf__main">
          {desktopToolbar ? <div className="desktopToolbar">{desktopToolbar}</div> : null}
          <section className="followShelf__content">
            {children}
            <footer className="footerNote">
              <span>Images are subject to copyright.</span>
              <span>
                This site is a <a href="https://tankobonbon.com" target="_blank" rel="noopener noreferrer" className="footerNote__link">Tankobonbon</a> extension 
                  <span style={{ opacity: 0.5 }}>{"\u2002"}•{"\u2002"}</span> 
                <a href="https://github.com/tankobonbon/release-tracker-beta" target="_blank" rel="noopener noreferrer" className="footerNote__linkMuted">GitHub ↗</a>
              </span>
            </footer>
          </section>
        </div>
      </div>

      {mobileToolbar ? <div className="mobileBulkBar">{mobileToolbar}</div> : null}
      <BottomNav mobile counts={navCounts} />
    </main>
  );
}
