"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Minus, Plus, Search, ListChecks, SquareDashed } from "lucide-react";
import AppShell from "./AppShell";
import useFollowShelfState from "../hooks/useFollowShelfState";

function Accordion({ title, children }) {
  const [open, setOpen] = useState(false);

  return (
    <section className="panel panel--compact accordionPanel">
      <button
        type="button"
        className={`accordionToggle ${open ? "accordionToggle--open" : ""}`}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span>{title}</span>
        <ChevronDown size={15} strokeWidth={2.1} />
      </button>
      {open ? <div className="accordion__content">{children}</div> : null}
    </section>
  );
}

export default function FollowSeriesPage() {
  const {
    theme,
    collections,
    followed,
    followedCollectionObjects,
    newUpcomingBooks,
    dismissedBooks,
    loadingCollections,
    collectionsError,
    toggleFollow,
    toggleTheme,
  } = useFollowShelfState();

  const [search, setSearch] = useState("");
  const [followedSearch, setFollowedSearch] = useState("");
  const [selectedFollows, setSelectedFollows] = useState([]);

  const filteredCollections = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (keyword.length < 2) return [];

    return collections
      .filter((collection) => !followed.includes(collection.handle))
      .filter((collection) => collection.title.toLowerCase().includes(keyword))
      .slice(0, 64);
  }, [collections, search, followed]);

  const filteredFollowed = useMemo(() => {
    const keyword = followedSearch.trim().toLowerCase();
    return followedCollectionObjects.filter(
      (collection) => !keyword || collection.title.toLowerCase().includes(keyword),
    );
  }, [followedCollectionObjects, followedSearch]);

  function toggleFollowSelection(handle) {
    setSelectedFollows((prev) =>
      prev.includes(handle) ? prev.filter((item) => item !== handle) : [...prev, handle],
    );
  }

  function unfollowSelected() {
    selectedFollows.forEach((handle) => toggleFollow(handle));
    setSelectedFollows([]);
  }

  const sidebar = (
    <>
      <Accordion title="How to use">
        <p>
          Search books first, follow the series you want, then head to Releases to mark titles as
          pre-ordered or dismiss them.
        </p>
        <p>
          Clicking on books will direct you to the Tankobonbon page where you can see more book
          information and view links to pre-order them.
        </p>
        <p>
          Everything is stored only in this browser. Open it on another device or browser and your
          list will be empty there. Also, if you have a lot of books it might take a while for
          everything to load.
        </p>
        <p>Unfollowing series will remove them from Releases and pre-order pages.</p>
        <p>Want a hard reset? Clear this site’s cache or site data.</p>
      </Accordion>

      <Accordion title="What is Tankobonbon?">
        <p>
          Tankobonbon is a passion project slash manga-specialty private library in Cavite,
          Philippines. The website, <a href="https://tankobonbon.com" target="_blank" rel="noopener noreferrer">tankobonbon.com</a>, is a database of more than 20,000 (and
          growing) English print books. This page acts as an extension to Tankobonbon for manga
          collectors like Bon (the owner) for tracking unreleased books.
        </p>
      </Accordion>

      <section className="betaNotice">
        <p>
          This Release Tracker is something I made out on a whim and is in beta mode. There are still a lot of upcoming books not yet
          added to the website, as well as series not yet prepped as a collection that you can find
          and follow, but I’ll strive to catch up to that as soon as I can before the library
          opens. Meanwhile, I’d appreciate your understanding and proper use of this site. -Bon
        </p>
      </section>
    </>
  );

  return (
    <AppShell
      eyebrow="Tankobonbon"
      title="Release Tracker (Beta)"
      intro="Follow your manga series, keep tabs on upcoming releases, and track your pre-ordered books."
      stats={[
        { label: "Followed", value: followed.length },
        { label: "Upcoming", value: newUpcomingBooks.length },
        { label: "Dismissed", value: dismissedBooks.length },
      ]}
      sidebar={sidebar}
      theme={theme}
      onToggleTheme={toggleTheme}
      navCounts={{ releases: newUpcomingBooks.length }}
    >
      {collectionsError ? <div className="errorBox">{collectionsError}</div> : null}
      {loadingCollections ? <div className="loadingBox">Loading collections...</div> : null}

      <section className="panel panel--compact followSearchPanel">
        <div className="panel__header panel__header--stacked">
          <h2>Find series</h2>
          <span className="panel__meta panel__meta--spaced">Follow from here</span>
        </div>

        <div className="searchWrap searchWrap--roomy followSearchBar followSearchBar--merged">
          <Search size={15} strokeWidth={2} className="searchIcon" />
          <input
            className="searchInput"
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search series..."
          />
          {search ? (
            <button type="button" className="searchClear" onClick={() => setSearch("")}>×</button>
          ) : null}
        </div>

        {search.trim().length < 2 ? (
          <div className="emptyMini emptyMini--center emptyMini--roomy">Type at least 2 letters and click + to follow.<br /><em>Maybe try Re:Zero or Solo Leveling</em></div>
        ) : !filteredCollections.length ? (
          <div className="emptyMini emptyMini--center emptyMini--roomy emptyMini--narrow">No collections found, has no English release, not yet configured to the site, or already followed.</div>
        ) : (
          <div className="searchResults searchResults--tall scrollArea">
            {filteredCollections.map((collection) => (
              <div key={collection.handle} className="collectionResult">
                <strong className="collectionResult__title">{collection.title}</strong>
                <button
                  type="button"
                  className="tinyAction tinyAction--soft"
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleFollow(collection.handle);
                  }}
                  aria-label={`Follow ${collection.title}`}
                >
                  <Plus size={15} strokeWidth={2.1} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="panel panel--compact followedPanel">
        <div className="panel__header panel__header--followed">
          <div className="panel__header panel__header--stacked">
            <h2>Followed</h2>
            <span className="panel__meta">{followedCollectionObjects.length} series</span>
          </div>

          {followedCollectionObjects.length ? (
            <div className="toolbar__group followedPanel__actions">
            <button
              type="button"
              className="ghostButton ghostButton--compact followedActionBtn"
              onClick={() => setSelectedFollows(filteredFollowed.map((collection) => collection.handle))}
              disabled={!filteredFollowed.length}
            >
              <span className="desktopOnly">Select all</span>
              <span className="mobileOnly">
                <ListChecks size={16} />
              </span>
            </button>
            <button
              type="button"
              className="ghostButton ghostButton--compact followedActionBtn"
              onClick={() => setSelectedFollows([])}
              disabled={!selectedFollows.length}
            >
              <span className="desktopOnly">Deselect</span>
              <span className="mobileOnly">
                <SquareDashed size={16} />
              </span>
            </button>
            <button
              type="button"
              className="dangerButton dangerButton--compact followedPanel__bulkButton"
              onClick={unfollowSelected}
              disabled={!selectedFollows.length}
            >
              Unfollow
            </button>
            </div>
          ) : null}        </div>

        <div className="searchWrap searchWrap--roomy searchWrap--compactBottom">
          <Search size={15} strokeWidth={2} className="searchIcon" />
          <input
            className="searchInput"
            type="text"
            value={followedSearch}
            onChange={(event) => setFollowedSearch(event.target.value)}
            placeholder="Search followed..."
          />
          {followedSearch ? (
            <button type="button" className="searchClear" onClick={() => setFollowedSearch("")}>×</button>
          ) : null}
        </div>

        <div className="followList followList--scroll scrollArea">
          {!filteredFollowed.length ? (
            <div className="emptyMini emptyMini--center emptyMini--roomy">
              You are not following anything yet.
            </div>
          ) : (
            filteredFollowed.map((collection) => {
              const selected = selectedFollows.includes(collection.handle);
              return (
                <label
                  key={collection.handle}
                  className={`followItem ${selected ? "followItem--selected" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleFollowSelection(collection.handle)}
                  />
                  <span>{collection.title}</span>
                  <button
                    type="button"
                    className="tinyAction tinyAction--soft"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      toggleFollow(collection.handle);
                    }}
                    aria-label={`Unfollow ${collection.title}`}
                  >
                    <Minus size={15} strokeWidth={2.15} />
                  </button>
                </label>
              );
            })
          )}
        </div>
      </section>
    </AppShell>
  );
}
