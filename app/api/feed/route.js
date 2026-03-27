export const dynamic = 'force-dynamic';

import { getRecentProductsForCollections } from '../../lib/shopify';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const handles = searchParams.getAll('handles').filter(Boolean);
    const days = Number(searchParams.get('days') || '90');

    if (!handles.length) {
      return Response.json({ products: [] });
    }

    const products = await getRecentProductsForCollections(handles, days);
    return Response.json({ products });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
