"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import AppShell from "../../components/AppShell";
import BookCard from "../../components/BookCard";
import FilterBar from "../../components/FilterBar";
import { buildFilterOptions, filterBooks, getDefaultFilters, isFutureRelease } from "../../hooks/useFollowShelfState";
import useFollowShelfState from "../../hooks/useFollowShelfState";

export default function Page() {
  const {
    theme,
    newUpcomingBooks,
    dismissedBooks,
    followed,
    loadingBooks,
    booksError,
    dismissBooks,
    restoreBook,
    markPreordered,
    toggleTheme,
  } = useFollowShelfState();

  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(getDefaultFilters());
  const [showDismissed, setShowDismissed] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filteredBooks = useMemo(() => filterBooks(newUpcomingBooks, search, filters), [newUpcomingBooks, search, filters]);
  const filteredDismissed = useMemo(() => filterBooks(dismissedBooks, search, filters), [dismissedBooks, search, filters]);
  const filterOptions = useMemo(() => buildFilterOptions([...newUpcomingBooks, ...dismissedBooks]), [newUpcomingBooks, dismissedBooks]);
  const hasPreorderableSelection = selected.some((id) => filteredBooks.some((book) => book.id === id && isFutureRelease(book.releaseDate)));

  const bulkButtons = followed.length ? (
    <div className="mobileActionRow">
      <button type="button" className="ghostButton ghostButton--compact" onClick={() => setSelected(filteredBooks.map((book) => book.id))} disabled={!filteredBooks.length}>Select all</button>
      <button type="button" className="ghostButton ghostButton--compact" onClick={() => setSelected([])} disabled={!selected.length}>Clear</button>
    </div>
  ) : null;

  const sidebar = (
    <FilterBar
      search={search}
      setSearch={setSearch}
      filters={filters}
      setFilters={setFilters}
      options={filterOptions}
      mobileOpen={filtersOpen}
      setMobileOpen={setFiltersOpen}
      mobileActions={bulkButtons}
    />
  );

  const desktopToolbar = followed.length ? (
    <div className="toolbar toolbar--split">
      <div className="toolbar__group toolbar__group--leftActions">
        <button type="button" className="ghostButton ghostButton--compact" onClick={() => setSelected(filteredBooks.map((book) => book.id))} disabled={!filteredBooks.length}>Select all</button>
        <button type="button" className="ghostButton ghostButton--compact" onClick={() => setSelected([])} disabled={!selected.length}>Clear</button>
      </div>
      <div className="toolbar__group toolbar__group--right">
        <button type="button" className="dangerButton dangerButton--compact" onClick={() => { dismissBooks(selected); setSelected([]); }} disabled={!selected.length}>Dismiss selected</button>
        <button type="button" className="goldButton goldButton--compact goldButton--blue" onClick={() => { markPreordered(selected); setSelected([]); }} disabled={!hasPreorderableSelection}>Mark pre-ordered</button>
      </div>
    </div>
  ) : null;

  const mobileToolbar = selected.length ? (
    <div className="toolbar toolbar--mobileFloat">
      <button type="button" className="dangerButton dangerButton--compact" onClick={() => { dismissBooks(selected); setSelected([]); }}>Dismiss ({selected.length})</button>
      <button type="button" className="goldButton goldButton--compact goldButton--blue" onClick={() => { markPreordered(selected); setSelected([]); }} disabled={!hasPreorderableSelection}>Mark as pre-ordered</button>
    </div>
  ) : null;

  return (
    <AppShell
      eyebrow="Tankobonbon"
      title="New Upcoming Releases"
      intro="Fresh upcoming books from your followed shelf."
      stats={[{ label: "Followed", value: followed.length }, { label: "Upcoming", value: filteredBooks.length }, { label: "Dismissed", value: dismissedBooks.length }]}
      sidebar={sidebar}
      desktopToolbar={desktopToolbar}
      mobileToolbar={mobileToolbar}
      theme={theme}
      onToggleTheme={toggleTheme}
      navCounts={{ releases: newUpcomingBooks.length }}
    >
      {booksError ? <div className="errorBox">{booksError}</div> : null}
      {loadingBooks ? <div className="loadingBox">Loading books...</div> : null}
      {!loadingBooks && !followed.length ? <div className="emptyState"><h3>No followed series yet</h3><p>Follow some collections first so this page has books to show.</p></div> : null}
      {!loadingBooks && followed.length && !filteredBooks.length ? <div className="emptyState"><h3>No matching upcoming books</h3><p>Try clearing filters or wait for more future releases.</p></div> : null}

      {!!filteredBooks.length && (
        <section className="panel panel--compact booksPanel booksPanel--gridWrap">
          <div className="bookGrid bookGrid--desktopFive">
            {filteredBooks.map((book) => (
              <BookCard key={book.id} book={book} selected={selected.includes(book.id)} onToggleSelect={(id) => setSelected((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id])} />
            ))}
          </div>
        </section>
      )}

      <section className="panel panel--compact accordionPanel">
        <button type="button" className={`accordionToggle ${showDismissed ? "accordionToggle--open" : ""}`} onClick={() => setShowDismissed((prev) => !prev)}>
          <span>Dismissed books ({dismissedBooks.length})</span>
          <ChevronDown size={15} strokeWidth={2.1} />
        </button>
        {showDismissed ? (
          <div className="accordion__content accordion__content--topPad">
            {!filteredDismissed.length ? <div className="emptyMini">Nothing dismissed right now.</div> : (
              <div className="bookGrid bookGrid--desktopFive">
                {filteredDismissed.map((book) => <BookCard key={book.id} book={book} actionLabel="Restore" onAction={restoreBook} />)}
              </div>
            )}
          </div>
        ) : null}
      </section>
    </AppShell>
  );
}
