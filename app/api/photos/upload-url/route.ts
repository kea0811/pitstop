import { NextResponse } from 'next/server';
import { requireUser, isErrorResponse, handleRouteError } from '@/lib/api-helpers';
import { isR2Configured, presignPhotoUpload } from '@/lib/r2';

export const dynamic = 'force-dynamic';

/**
 * POST /api/photos/upload-url  { itemId, contentType? }
 * Returns a short-lived presigned R2 PUT URL scoped to the signed-in user's
 * own {userId}/ prefix, plus the permanent public URL to store on the item.
 * 501 when R2 isn't configured so the client can fall back to Supabase.
 */
export async function POST(req: Request) {
  const user = await requireUser();
  if (isErrorResponse(user)) return user;

  if (!isR2Configured()) {
    return NextResponse.json({ error: 'R2 storage is not configured.' }, { status: 501 });
  }

  try {
    const body = (await req.json().catch(() => null)) as
      | { itemId?: unknown; contentType?: unknown }
      | null;
    const itemId = typeof body?.itemId === 'string' ? body.itemId.trim() : '';
    if (!itemId) {
      return NextResponse.json({ error: 'itemId is required.' }, { status: 400 });
    }
    const contentType =
      typeof body?.contentType === 'string' && body.contentType.startsWith('image/')
        ? body.contentType
        : 'image/jpeg';

    const presigned = await presignPhotoUpload({
      userId: user.id,
      itemId,
      timestamp: Date.now(),
      contentType,
    });
    return NextResponse.json(presigned);
  } catch (err) {
    return handleRouteError(err);
  }
}
