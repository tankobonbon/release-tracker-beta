'use client';

import { useEffect, useMemo, useState } from 'react';

const FOLLOW_KEY = 'tankobonbon-followed-collections';
const DISMISS_KEY = 'tankobonbon-dismissed-products';
const DAYS = 90;

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export default function HomePage() {
  const [collections, setCollections] = useState([]);
  const [followed, setFollowed] = useState([]);
  const [dismissed, setDismissed] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingCollections, setLoadingCollections] = useState(true);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      setFollowed(JSON.parse(localStorage.getItem(FOLLOW_KEY) || '[]'));
      setDismissed(JSON.parse(localStorage.getItem(DISMISS_KEY) || '[]'));
    } catch {
      setFollowed([]);
      setDismissed([]);
    }
  }, []);

  useEffect(() => {
    async function loadCollections() {
      setLoadingCollections(true);
      setError('');
      try {
        const response = await fetch('/api/follows');
        const json = await response.json();
        if (!response.ok) throw new Error(json.error || 'Failed to load collections.');
        setCollections(json.collections || []);
      } catch (err) {
        setError(err.message || 'Failed to load collections.');
      } finally {
        setLoadingCollections(false);
      }
    }

    loadCollections();
  }, []);

  useEffect(() => {
    localStorage.setItem(FOLLOW_KEY, JSON.stringify(followed));
  }, [followed]);

  useEffect(() => {
    localStorage.setItem(DISMISS_KEY, JSON.stringify(dismissed));
  }, [dismissed]);

  useEffect(() => {
    async function loadFeed() {
      if (!followed.length) {
        setProducts([]);
        return;
      }

      setLoadingFeed(true);
      setError('');
      try {
        const params = new URLSearchParams();
        followed.forEach((handle) => params.append('handle', handle));
        params.set('days', String(DAYS));

        const response = await fetch(`/api/feed?${params.toString()}`);
        const json = await response.json();
        if (!response.ok) throw new Error(json.error || 'Failed to load feed.');
        setProducts(json.products || []);
      } catch (err) {
        setError(err.message || 'Failed to load feed.');
      } finally {
        setLoadingFeed(false);
      }
    }

    loadFeed();
  }, [followed]);

  const visibleProducts = useMemo(() => {
    return products.filter((product) => !dismissed.includes(product.id));
  }, [products, dismissed]);

  const filteredCollections = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return collections;
    return collections.filter((collection) =>
      collection.title.toLowerCase().includes(q) || collection.handle.toLowerCase().includes(q)
    );
  }, [collections, search]);

  const toggleFollow = (handle) => {
    setFollowed((current) =>
      current.includes(handle)
        ? current.filter((item) => item !== handle)
        : [...current, handle]
    );
  };

  const dismissProduct = (productId) => {
    setDismissed((current) => (current.includes(productId) ? current : [...current, productId]));
  };

  const resetDismissed = () => setDismissed([]);

  return (
    <main className="page">
      <div className="header">
        <div>
          <h1 style={{ margin: 0 }}>Tankobonbon Follow Shelf</h1>
          <p className="muted" style={{ marginTop: 8 }}>
            Follow collections, then see books added in the last {DAYS} days. Dismissed items stay hidden in this browser.
          </p>
        </div>
      </div>

      <div className="grid">
        <section className="stack">
          <div className="card stack">
            <div>
              <strong>1) Pick collections to follow</strong>
              <p className="small">For MVP, it is easiest if each series has its own collection handle.</p>
            </div>

            <input
              type="text"
              placeholder="Search collections..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {loadingCollections ? (
              <p className="muted">Loading collections...</p>
            ) : (
              <div className="collections">
                {filteredCollections.map((collection) => (
                  <label key={collection.id} className="collectionRow">
                    <input
                      type="checkbox"
                      checked={followed.includes(collection.handle)}
                      onChange={() => toggleFollow(collection.handle)}
                    />
                    <span>{collection.title}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="card stack">
            <strong>2) Your saved follows</strong>
            {followed.length ? (
              <div>
                {followed.map((handle) => (
                  <span className="pill" key={handle}>{handle}</span>
                ))}
              </div>
            ) : (
              <p className="muted">No follows yet.</p>
            )}
            <div className="actions">
              <button onClick={resetDismissed}>Reset dismissed items</button>
            </div>
          </div>
        </section>

        <section className="card stack">
          <div>
            <strong>3) New books for you</strong>
            <p className="small">Newest first. Hidden items are stored only on this device/browser.</p>
          </div>

          {error ? <p className="muted">Error: {error}</p> : null}
          {loadingFeed ? <p className="muted">Loading your feed...</p> : null}

          {!loadingFeed && !visibleProducts.length ? (
            <p className="muted">No matching new books right now. Either nothing new was added in the last 90 days, or you already dismissed them.</p>
          ) : (
            <div className="products">
              {visibleProducts.map((product) => (
                <article className="product" key={product.id}>
                  {product.featuredImage?.url ? (
                    <img src={product.featuredImage.url} alt={product.featuredImage.altText || product.title} />
                  ) : (
                    <div className="placeholder" />
                  )}
                  <div>
                    <div className="small">{product.collectionTitle}</div>
                    <h3 style={{ margin: '4px 0 8px' }}>{product.title}</h3>
                    <div className="small">Added {formatDate(product.createdAt)}</div>
                    <div className="actions">
                      {product.onlineStoreUrl ? (
                        <a href={product.onlineStoreUrl} target="_blank" rel="noreferrer">
                          <button className="primary">Open book page</button>
                        </a>
                      ) : null}
                      <button onClick={() => dismissProduct(product.id)}>Dismiss</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
