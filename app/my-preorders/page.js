"use client";

import { useMemo, useState } from "react";
import AppShell from "../../components/AppShell";
import BookCard from "../../components/BookCard";
import FilterBar from "../../components/FilterBar";
import {
  buildFilterOptions,
  filterBooks,
  formatMonthYear,
  getDefaultFilters,
} from "../../hooks/useFollowShelfState";
import useFollowShelfState from "../../hooks/useFollowShelfState";

export default function Page() {
  const {
    theme,
    activePreorderBooks,
    recentReleasedPreorderBooks,
    removePreorder,
    toggleTheme,
    loadingBooks,
    newUpcomingBooks,
  } = useFollowShelfState();

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(getDefaultFilters());
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filteredBooks = useMemo(
    () => filterBooks(activePreorderBooks, search, filters),
    [activePreorderBooks, search, filters],
  );
  const filteredRecent = useMemo(
    () => filterBooks(recentReleasedPreorderBooks, search, filters),
    [recentReleasedPreorderBooks, search, filters],
  );
  const filterOptions = useMemo(
    () => buildFilterOptions([...activePreorderBooks, ...recentReleasedPreorderBooks]),
    [activePreorderBooks, recentReleasedPreorderBooks],
  );

  const groupedBooks = useMemo(() => {
    const map = new Map();
    filteredBooks.forEach((book) => {
      const key = formatMonthYear(book.releaseDate);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(book);
    });
    return [...map.entries()];
  }, [filteredBooks]);

  const sidebar = (
    <FilterBar
      search={search}
      setSearch={setSearch}
      filters={filters}
      setFilters={setFilters}
      options={filterOptions}
      mobileOpen={filtersOpen}
      setMobileOpen={setFiltersOpen}
      searchPlaceholder="Search pre-orders..."
    />
  );

  return (
    <AppShell
      eyebrow="Tankobonbon"
      title="My Selected Pre-orders"
      intro="Your saved pre-orders, grouped by release month."
      stats={[
        { label: "Pre-orders", value: activePreorderBooks.length },
        { label: "Released ≤30 days", value: recentReleasedPreorderBooks.length },
      ]}
      sidebar={sidebar}
      theme={theme}
      onToggleTheme={toggleTheme}
      navCounts={{ releases: newUpcomingBooks.length }}
    >
      {loadingBooks ? <div className="loadingBox">Loading books...</div> : null}
      {!loadingBooks && !filteredBooks.length && !filteredRecent.length ? (
        <div className="emptyState">
          <h3>No pre-orders yet</h3>
          <p>Mark books as pre-ordered from Releases and they’ll camp here for you.</p>
        </div>
      ) : null}

      {groupedBooks.map(([month, books]) => (
        <section key={month} className="monthGroup">
          <div className="monthGroup__header">
            <h2 className="monthGroup__title">{month}</h2>
            <span className="monthGroup__count">
              {books.length} book{books.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="bookGrid bookGrid--desktopFive">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                cornerRemove
                onCornerRemove={removePreorder}
              />
            ))}
          </div>
        </section>
      ))}

      {!!filteredRecent.length && (
        <section className="panel panel--compact monthGroup">
          <div className="monthGroup__header">
            <h2 className="monthGroup__title">Already released within 30 days</h2>
            <span className="monthGroup__count">{filteredRecent.length}</span>
          </div>
          <div className="bookGrid bookGrid--desktopFive">
            {filteredRecent.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                cornerRemove
                onCornerRemove={removePreorder}
              />
            ))}
          </div>
        </section>
      )}
    </AppShell>
  );
}
