import { NextResponse } from 'next/server';
import { getDb, isDbConfigured } from '@/lib/db';
import { searchProducts, RATE_LIMIT_MESSAGE, type UpcSearchHit } from '@/lib/upcitemdb';
import { handleRouteError } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

/** Catalog listings drift, so cache search results for a week (not forever). */
const SEARCH_TTL_MS = 1000 * 60 * 60 * 24 * 7;

interface SearchCacheDoc {
  q: string;
  results: UpcSearchHit[];
  fetchedAt: Date;
}

/**
 * GET /api/upc/search?q=...
 * Keyword catalog search (for adding a wishlist car you don't own). Public for
 * the same reasons as the barcode lookup: no user data, and demo guests use it.
 * Results are cached per normalized query (7-day TTL) so repeat searches cost
 * no upcitemdb quota. Each result carries a barcode → saved + deduped like a scan.
 */
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get('q')?.trim() ?? '';
  if (!q) {
    return NextResponse.json({ error: 'Type something to search for.' }, { status: 400 });
  }
  const norm = q.toLowerCase();

  try {
    // 1. Cache hit within TTL → no quota spent.
    if (isDbConfigured()) {
      const db = await getDb();
      const cached = await db
        .collection<SearchCacheDoc>('upc_search_cache')
        .findOne({ q: norm });
      if (cached && Date.now() - cached.fetchedAt.getTime() < SEARCH_TTL_MS) {
        return NextResponse.json({ results: cached.results, source: 'cache' });
      }
    }

    // 2. Live search.
    const result = await searchProducts(q);
    if (result.status === 'rate_limited') {
      return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 });
    }
    if (result.status === 'error') {
      return NextResponse.json({ error: result.message }, { status: 502 });
    }

    // 3. Cache (one doc per unique query; refreshed on miss).
    if (isDbConfigured()) {
      const db = await getDb();
      await db.collection<SearchCacheDoc>('upc_search_cache').updateOne(
        { q: norm },
        { $set: { q: norm, results: result.hits, fetchedAt: new Date() } },
        { upsert: true },
      );
    }

    return NextResponse.json({ results: result.hits });
  } catch (err) {
    return handleRouteError(err);
  }
}
