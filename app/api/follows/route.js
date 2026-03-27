import { getCollections } from '../../lib/shopify';

export async function GET() {
  try {
    const collections = await getCollections();
    return Response.json({ collections });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
