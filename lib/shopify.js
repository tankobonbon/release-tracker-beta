const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN;

function endpoint() {
  if (!SHOPIFY_DOMAIN || !STOREFRONT_TOKEN) {
    throw new Error('Missing Shopify environment variables.');
  }
  return `https://${SHOPIFY_DOMAIN}/api/2026-01/graphql.json`;
}

export async function shopifyFetch(query, variables = {}) {
  const response = await fetch(endpoint(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN
    },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store'
  });

  const json = await response.json();

  if (!response.ok || json.errors) {
    console.error(JSON.stringify(json, null, 2));
    throw new Error('Shopify API request failed.');
  }

  return json.data;
}

export async function getCollections() {
  const query = `#graphql
    query GetCollections($first: Int!) {
      collections(first: $first, sortKey: TITLE) {
        nodes {
          id
          handle
          title
        }
      }
    }
  `;

  const data = await shopifyFetch(query, { first: 100 });
  return data.collections.nodes;
}

export async function getRecentProductsForCollections(handles = [], days = 90) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const query = `#graphql
    query GetCollectionProducts($handle: String!) {
      collection(handle: $handle) {
        id
        handle
        title
        products(first: 50, reverse: true) {
          nodes {
            id
            handle
            title
            onlineStoreUrl
            createdAt
            featuredImage {
              url
              altText
            }
          }
        }
      }
    }
  `;

  const results = [];

  for (const handle of handles) {
    const data = await shopifyFetch(query, { handle });
    const collection = data.collection;
    if (!collection) continue;

    for (const product of collection.products.nodes) {
      const createdAtMs = new Date(product.createdAt).getTime();
      if (Number.isNaN(createdAtMs) || createdAtMs < cutoff) continue;

      results.push({
        ...product,
        collectionHandle: collection.handle,
        collectionTitle: collection.title
      });
    }
  }

  const seen = new Set();
  const unique = [];
  for (const item of results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    unique.push(item);
  }

  return unique;
}
