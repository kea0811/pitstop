import 'server-only';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * Cloudflare R2 photo storage (S3-compatible). We run on Vercel, so there are
 * no Cloudflare bindings — we talk to R2's S3 API with plain env credentials.
 *
 * Flow (egress-free): the browser asks /api/photos/upload-url for a short-lived
 * presigned PUT, uploads the JPEG straight to R2, and we store the permanent
 * public URL (`{R2_PUBLIC_URL}/{key}`) on the Mongo photo doc. The bucket is
 * public-by-URL — the same capability-URL model the old Supabase signed URLs
 * used. Each key is namespaced by user, so guessing another user's path is the
 * only exposure, exactly as before.
 *
 * Env (Vercel):
 *   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
 *   R2_BUCKET           (e.g. gotham-garage-photos)
 *   R2_PUBLIC_URL       (bucket's public r2.dev URL or a custom domain)
 */

interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicBase: string;
}

function readConfig(): R2Config | null {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;
  const publicBase = process.env.R2_PUBLIC_URL;
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicBase) {
    return null;
  }
  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucket,
    publicBase: publicBase.replace(/\/+$/, ''),
  };
}

export function isR2Configured(): boolean {
  return readConfig() !== null;
}

let _client: S3Client | null = null;
function client(cfg: R2Config): S3Client {
  if (!_client) {
    _client = new S3Client({
      region: 'auto',
      endpoint: `https://${cfg.accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: cfg.accessKeyId, secretAccessKey: cfg.secretAccessKey },
    });
  }
  return _client;
}

/** Storage key for a user's item photo. Mirrors the old Supabase layout. */
export function photoKey(userId: string, itemId: string, timestamp: number): string {
  return `${userId}/${itemId}/${timestamp}.jpg`;
}

/** Permanent, renderable URL for a stored key. */
export function publicUrlFor(key: string): string {
  const cfg = readConfig();
  if (!cfg) throw new Error('R2 is not configured.');
  return `${cfg.publicBase}/${key}`;
}

export interface PresignedUpload {
  uploadUrl: string;
  key: string;
  publicUrl: string;
}

/** Short-lived presigned PUT so the browser can upload straight to R2. */
export async function presignPhotoUpload(args: {
  userId: string;
  itemId: string;
  timestamp: number;
  contentType?: string;
  expiresInSeconds?: number;
}): Promise<PresignedUpload> {
  const cfg = readConfig();
  if (!cfg) throw new Error('R2 is not configured.');
  const key = photoKey(args.userId, args.itemId, args.timestamp);
  const cmd = new PutObjectCommand({
    Bucket: cfg.bucket,
    Key: key,
    ContentType: args.contentType ?? 'image/jpeg',
  });
  const uploadUrl = await getSignedUrl(client(cfg), cmd, {
    expiresIn: args.expiresInSeconds ?? 300,
  });
  return { uploadUrl, key, publicUrl: `${cfg.publicBase}/${key}` };
}
