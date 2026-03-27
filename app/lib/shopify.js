const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const STOREFRONT_TOKEN =
  process.env.SHOPIFY_STOREFRONT_TOKEN ||
  process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

function getEndpoint() {
  if (!SHOPIFY_DOMAIN || !STOREFRONT_TOKEN) {
    throw new Error("Missing Shopify environment variables.");
  }
  return `https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`;
}

export async function shopifyFetch({
  query,
  variables = {},
  revalidate = 3600, // default = 1 hour
}) {
  const response = await fetch(getEndpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate },
  });

  const json = await response.json();

  if (!response.ok || json.errors) {
    console.error("Shopify Error Log:", JSON.stringify(json, null, 2));
    throw new Error("Shopify API request failed.");
  }

  return json.data;
}

export async function getCollections() {
  const query = `#graphql
    query GetCollections($after: String) {
      collections(first: 250, after: $after, sortKey: TITLE) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          handle
          title
        }
      }
    }
  `;

  let all = [];
  let hasNext = true;
  let cursor = null;

  while (hasNext) {
    const data = await shopifyFetch({
      query,
      variables: { after: cursor },
      revalidate: 86400, // 24 hours
    });

    const collections = data?.collections;
    if (!collections) break;

    all.push(...collections.nodes);
    hasNext = collections.pageInfo.hasNextPage;
    cursor = collections.pageInfo.endCursor;

    if (all.length > 5000) break;
  }

  return all;
}

export async function getRecentProductsForCollections(handles = [], days = 90) {
  const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;

  const query = `#graphql
    query GetCollectionProducts($handle: String!) {
      collection(handle: $handle) {
        id
        handle
        title
        products(first: 50, sortKey: CREATED, reverse: true) {
          nodes {
            id
            handle
            title
            onlineStoreUrl
            publishedAt
            createdAt
            tags
            featuredImage {
              url
              altText
            }
            releaseMetafield: metafield(namespace: "arena", key: "release") {
              value
              type
            }
          }
        }
      }
    }
  `;

  const results = [];

  for (const handle of handles) {
    try {
      const data = await shopifyFetch({
        query,
        variables: { handle },
        // uses default revalidate = 3600 (1 hour)
      });

      const collection = data?.collection;
      if (!collection) continue;

      for (const product of collection.products.nodes) {
        const addedDate = product.createdAt || product.publishedAt;
        const addedTime = new Date(addedDate).getTime();
        if (Number.isNaN(addedTime) || addedTime < cutoffTime) continue;

        results.push({
          id: product.id,
          handle: product.handle,
          title: product.title,
          onlineStoreUrl: product.onlineStoreUrl,
          publishedAt: product.publishedAt,
          createdAt: product.createdAt,
          featuredImage: product.featuredImage,
          releaseDate: product.releaseMetafield?.value || null,
          releaseDateType: product.releaseMetafield?.type || null,
          tags: product.tags || [],
          collectionHandle: collection.handle,
          collectionTitle: collection.title,
        });
      }
    } catch (error) {
      console.error(`Error fetching handle ${handle}:`, error);
    }
  }

  const seen = new Set();

  return results
    .filter((product) => {
      if (seen.has(product.id)) return false;
      seen.add(product.id);
      return true;
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt || b.publishedAt).getTime() -
        new Date(a.createdAt || a.publishedAt).getTime()
    );
}
