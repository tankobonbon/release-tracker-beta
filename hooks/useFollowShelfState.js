"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export const FOLLOWS_KEY = "tkbb_followed_collections";
export const DISMISSED_KEY = "tkbb_dismissed_products";
export const PREORDERS_KEY = "tkbb_preordered_products";
export const THEME_KEY = "tkbb_follow_shelf_theme";

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export function formatRelativeDate(dateString) {
  if (!dateString) return "Added recently";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Added recently";
  const diffMs = new Date().getTime() - date.getTime();
  const day = 24 * 60 * 60 * 1000;
  if (diffMs <= 0) return "Added just now";
  if (diffMs < day) return "Added today";
  return `Added ${Math.floor(diffMs / day)} day${Math.floor(diffMs / day) === 1 ? "" : "s"} ago`;
}

export function formatReleaseDate(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;
  let month = new Intl.DateTimeFormat("en-US", { month: "short" }).format(date);
  if (month === "Sep") month = "Sept";
  if (["Oct", "Nov", "Dec"].includes(month)) month = `${month}.`;
  return `${month} ${new Intl.DateTimeFormat("en-US", { day: "numeric" }).format(date)}, ${new Intl.DateTimeFormat("en-US", { year: "numeric" }).format(date)}`;
}

export function formatMonthYear(dateString) {
  if (!dateString) return "Unknown month";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Unknown month";
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(date);
}

export function isFutureRelease(dateString) {
  if (!dateString) return false;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return false;
  return date.getTime() >= startOfToday().getTime();
}

export function isReleasedWithinDays(dateString, days = 30) {
  if (!dateString) return false;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return false;
  const today = startOfToday();
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() - days);
  return date.getTime() < today.getTime() && date.getTime() >= cutoff.getTime();
}

export function getProductDate(product) {
  return product?.createdAt || product?.publishedAt || null;
}

function parseTagLabel(value) {
  return value.replaceAll("_", " ").trim();
}

function getGroupedTagValue(tags = [], prefix) {
  const tag = tags.find((entry) => entry.startsWith(prefix));
  return tag ? parseTagLabel(tag.slice(prefix.length)) : "";
}

function getGroupedTagValues(tags = [], prefix) {
  return (tags || []).filter((entry) => entry.startsWith(prefix)).map((entry) => parseTagLabel(entry.slice(prefix.length)));
}

function matchesMultiFilter(selectedValues = [], actualValues = []) {
  if (!selectedValues?.length) return true;
  if (!actualValues?.length) return false;
  return selectedValues.some((value) => actualValues.includes(value));
}

export function buildFilterOptions(books = []) {
  const monthSet = new Set();
  const yearSet = new Set();
  const publisherSet = new Set();
  const imprintSet = new Set();
  const typeSet = new Set();
  const genreSet = new Set();
  const classSet = new Set();
  const volumeSet = new Set();

  books.forEach((book) => {
    if (book.releaseDate) {
      const date = new Date(book.releaseDate);
      if (!Number.isNaN(date.getTime())) {
        monthSet.add(new Intl.DateTimeFormat("en-US", { month: "long" }).format(date));
        yearSet.add(String(date.getFullYear()));
      }
    }
    const publisher = getGroupedTagValue(book.tags, "Publisher_");
    if (publisher) publisherSet.add(publisher);
    const imprint = getGroupedTagValue(book.tags, "Imprint_");
    if (imprint) imprintSet.add(imprint);
    getGroupedTagValues(book.tags, "Type_").forEach((value) => typeSet.add(value));
    getGroupedTagValues(book.tags, "Genre_").forEach((value) => genreSet.add(value));
    const className = getGroupedTagValue(book.tags, "Class_");
    if (className) classSet.add(className);
    const volume = getGroupedTagValue(book.tags, "Volume_");
    if (volume) volumeSet.add(volume);
  });

  const collator = new Intl.Collator("en-US");
  const sortValues = (values) => [...values].sort(collator.compare);
  return {
    months: sortValues(monthSet),
    years: [...yearSet].sort((a, b) => Number(a) - Number(b)),
    publishers: sortValues(publisherSet),
    imprints: sortValues(imprintSet),
    types: sortValues(typeSet),
    classes: sortValues(classSet),
    volumes: sortValues(volumeSet),
    genres: sortValues(genreSet),
  };
}

export function getDefaultFilters() {
  return { month: [], year: [], publisher: [], imprint: [], type: [], class: [], volume: [], genre: [] };
}

export function filterBooks(books = [], search = "", filters = getDefaultFilters()) {
  const keyword = search.trim().toLowerCase();
  return books.filter((book) => {
    if (keyword) {
      const haystack = [book.title, book.collectionTitle, ...(book.tags || [])].filter(Boolean).join(" ").toLowerCase();
      if (!haystack.includes(keyword)) return false;
    }
    const month = book.releaseDate ? new Intl.DateTimeFormat("en-US", { month: "long" }).format(new Date(book.releaseDate)) : "";
    const year = book.releaseDate ? String(new Date(book.releaseDate).getFullYear()) : "";
    const publisher = getGroupedTagValue(book.tags, "Publisher_");
    const imprint = getGroupedTagValue(book.tags, "Imprint_");
    const types = getGroupedTagValues(book.tags, "Type_");
    const genres = getGroupedTagValues(book.tags, "Genre_");
    const className = getGroupedTagValue(book.tags, "Class_");
    const volume = getGroupedTagValue(book.tags, "Volume_");
    if (!matchesMultiFilter(filters.month, month ? [month] : [])) return false;
    if (!matchesMultiFilter(filters.year, year ? [year] : [])) return false;
    if (!matchesMultiFilter(filters.publisher, publisher ? [publisher] : [])) return false;
    if (!matchesMultiFilter(filters.imprint, imprint ? [imprint] : [])) return false;
    if (!matchesMultiFilter(filters.type, types)) return false;
    if (!matchesMultiFilter(filters.class, className ? [className] : [])) return false;
    if (!matchesMultiFilter(filters.volume, volume ? [volume] : [])) return false;
    if (!matchesMultiFilter(filters.genre, genres)) return false;
    return true;
  });
}

function sortByReleaseDateAsc(a, b) {
  return new Date(a.releaseDate || "9999-12-31").getTime() - new Date(b.releaseDate || "9999-12-31").getTime();
}

export default function useFollowShelfState() {
  const [collections, setCollections] = useState([]);
  const [followed, setFollowed] = useState([]);
  const [dismissed, setDismissed] = useState([]);
  const [preorders, setPreorders] = useState([]);
  const [books, setBooks] = useState([]);
  const [loadingCollections, setLoadingCollections] = useState(true);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [collectionsError, setCollectionsError] = useState("");
  const [booksError, setBooksError] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    try {
      const savedFollowed = JSON.parse(localStorage.getItem(FOLLOWS_KEY) || "[]");
      const savedDismissed = JSON.parse(localStorage.getItem(DISMISSED_KEY) || "[]");
      const savedPreorders = JSON.parse(localStorage.getItem(PREORDERS_KEY) || "[]");
      const savedTheme = localStorage.getItem(THEME_KEY) || "light";
      setFollowed(Array.isArray(savedFollowed) ? savedFollowed : []);
      setDismissed(Array.isArray(savedDismissed) ? savedDismissed : []);
      setPreorders(Array.isArray(savedPreorders) ? savedPreorders : []);
      setTheme(savedTheme === "dark" ? "dark" : "light");
    } catch {
      setFollowed([]); setDismissed([]); setPreorders([]); setTheme("light");
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme, hydrated]);

  useEffect(() => {
    async function loadCollections() {
      setLoadingCollections(true); setCollectionsError("");
      try {
        const res = await fetch("/api/follows", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load collections.");
        setCollections([...(data.collections || [])].sort((a, b) => a.title.localeCompare(b.title)));
      } catch (error) {
        setCollectionsError(error.message || "Failed to load collections.");
      } finally { setLoadingCollections(false); }
    }
    loadCollections();
  }, [refreshTick]);

  useEffect(() => { if (hydrated) localStorage.setItem(FOLLOWS_KEY, JSON.stringify(followed)); }, [followed, hydrated]);
  useEffect(() => { if (hydrated) localStorage.setItem(DISMISSED_KEY, JSON.stringify(dismissed)); }, [dismissed, hydrated]);
  useEffect(() => { if (hydrated) localStorage.setItem(PREORDERS_KEY, JSON.stringify(preorders)); }, [preorders, hydrated]);

  useEffect(() => {
    async function loadBooks() {
      if (!hydrated) return;
      if (!followed.length) { setBooks([]); setIsRefreshing(false); return; }
      setLoadingBooks(true); setBooksError("");
      try {
        const params = new URLSearchParams();
        followed.forEach((handle) => params.append("handles", handle));
        const res = await fetch(`/api/feed?${params.toString()}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load books.");
        setBooks(data.products || []);
      } catch (error) {
        setBooksError(error.message || "Failed to load books.");
      } finally {
        setLoadingBooks(false); setIsRefreshing(false);
      }
    }
    loadBooks();
  }, [followed, refreshTick, hydrated]);

  const followedCollectionObjects = useMemo(() => [...collections].filter((collection) => followed.includes(collection.handle)).sort((a, b) => a.title.localeCompare(b.title)), [collections, followed]);

  const visibleBooks = useMemo(() => books.filter((product) => !dismissed.includes(product.id) && !preorders.some((entry) => entry.productId === product.id)), [books, dismissed, preorders]);
  const newUpcomingBooks = useMemo(() => visibleBooks.filter((book) => isFutureRelease(book.releaseDate)).sort(sortByReleaseDateAsc), [visibleBooks]);
  const dismissedBooks = useMemo(() => books.filter((book) => dismissed.includes(book.id) && isFutureRelease(book.releaseDate)).sort(sortByReleaseDateAsc), [books, dismissed]);
  const preorderBooks = useMemo(() => preorders.map((entry) => { const book = books.find((item) => item.id === entry.productId); return book ? { ...book, markedAt: entry.markedAt } : null; }).filter(Boolean).sort(sortByReleaseDateAsc), [preorders, books]);
  const activePreorderBooks = useMemo(() => preorderBooks.filter((book) => isFutureRelease(book.releaseDate)), [preorderBooks]);
  const recentReleasedPreorderBooks = useMemo(() => preorderBooks.filter((book) => isReleasedWithinDays(book.releaseDate, 30)).sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()), [preorderBooks]);

  const toggleFollow = useCallback((handle) => {
    setFollowed((prev) => prev.includes(handle) ? prev.filter((item) => item !== handle) : [...prev, handle].sort((a, b) => a.localeCompare(b)));
  }, []);
  const dismissBooks = useCallback((productIds) => setDismissed((prev) => [...new Set([...prev, ...productIds])]), []);
  const restoreBook = useCallback((productId) => setDismissed((prev) => prev.filter((id) => id !== productId)), []);
  const markPreordered = useCallback((productIds) => {
    setPreorders((prev) => {
      const existing = new Set(prev.map((item) => item.productId));
      const additions = productIds.map((productId) => books.find((book) => book.id === productId)).filter((book) => book && isFutureRelease(book.releaseDate) && !existing.has(book.id)).map((book) => ({ productId: book.id, markedAt: new Date().toISOString() }));
      return [...prev, ...additions];
    });
  }, [books]);
  const removePreorder = useCallback((productId) => setPreorders((prev) => prev.filter((item) => item.productId !== productId)), []);
  const refreshNow = useCallback(() => { setIsRefreshing(true); setRefreshTick((prev) => prev + 1); }, []);
  const resetAll = useCallback(() => { setFollowed([]); setDismissed([]); setPreorders([]); }, []);
  const toggleTheme = useCallback(() => setTheme((prev) => (prev === "dark" ? "light" : "dark")), []);

  return {
    hydrated, theme, collections, followed, dismissed, preorders, books, visibleBooks, newUpcomingBooks, dismissedBooks,
    preorderBooks, activePreorderBooks, recentReleasedPreorderBooks, followedCollectionObjects, loadingCollections,
    loadingBooks, collectionsError, booksError, isRefreshing, toggleFollow, dismissBooks, restoreBook, markPreordered,
    removePreorder, refreshNow, resetAll, toggleTheme,
  };
}
