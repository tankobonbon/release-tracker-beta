"use client";

import { ListFilter, Search, X } from "lucide-react";

const FILTER_DEFS = [
  { key: "month", label: "Month", optionKey: "months" },
  { key: "year", label: "Year", optionKey: "years" },
  { key: "publisher", label: "Publisher", optionKey: "publishers" },
  { key: "imprint", label: "Imprint", optionKey: "imprints" },
  { key: "type", label: "Type", optionKey: "types" },
  { key: "class", label: "Class", optionKey: "classes" },
  { key: "volume", label: "Volume", optionKey: "volumes" },
  { key: "genre", label: "Genre", optionKey: "genres" },
];

const EMPTY_FILTERS = { month: [], year: [], publisher: [], imprint: [], type: [], class: [], volume: [], genre: [] };

export default function FilterBar({
  search,
  setSearch,
  filters,
  setFilters,
  options,
  mobileOpen,
  setMobileOpen,
  searchPlaceholder = "Search books...",
  mobileActions = null,
}) {
  const activeFilterCount = Object.values(filters).reduce((count, list) => count + (Array.isArray(list) ? list.length : 0), 0);
  const hasAnyFilter = !!search || activeFilterCount > 0;

  function toggleFilter(key, value) {
    setFilters((prev) => {
      const current = prev[key] || [];
      return { ...prev, [key]: current.includes(value) ? current.filter((item) => item !== value) : [...current, value] };
    });
  }

  function clearAll() {
    setSearch("");
    setFilters(EMPTY_FILTERS);
  }

  return (
    <section className="panel panel--compact filterPanel">
      <div className="filterPanel__header">
        <div className="searchWrap searchWrap--filters">
          <Search size={15} strokeWidth={2} className="searchIcon" />
          <input className="searchInput" type="text" placeholder={searchPlaceholder} value={search} onChange={(event) => setSearch(event.target.value)} />
          {search ? (
            <button type="button" className="searchClear" onClick={() => setSearch("")}
              aria-label="Clear search">
              <X size={14} strokeWidth={2.2} />
            </button>
          ) : null}
        </div>

        <button
          type="button"
          className={`filterToggle ${mobileOpen ? "filterToggle--active" : ""}`}
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label={`Toggle filters${activeFilterCount ? `, ${activeFilterCount} active` : ""}`}
        >
          <ListFilter size={15} strokeWidth={2} />
          {activeFilterCount ? <span className="filterToggle__badge">{activeFilterCount}</span> : null}
        </button>
      </div>

      {mobileActions ? <div className="filterPanel__mobileActions">{mobileActions}</div> : null}

      <div className={`filterPanel__body ${mobileOpen ? "filterPanel__body--open" : ""}`}>
        {FILTER_DEFS.map((def) => {
          const values = options[def.optionKey] || [];
          if (!values.length) return null;
          return (
            <div key={def.key} className="filterGroup">
              <span className="filterGroup__label">{def.label}</span>
              <div className="filterChips">
                {values.map((value) => {
                  const active = (filters[def.key] || []).includes(value);
                  return (
                    <button
                      type="button"
                      key={value}
                      className={`filterChip ${active ? "filterChip--active" : ""}`}
                      onClick={() => toggleFilter(def.key, value)}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {hasAnyFilter ? (
          <div className="filterPanel__footer">
            <button type="button" className="ghostButton ghostButton--compact" onClick={clearAll}>Clear all</button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
