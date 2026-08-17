/**
 * Rate limit helpers.
 * - IP: trust X-Real-IP (nginx) or rightmost X-Forwarded-For hop (proxy-appended).
 * - Storage: Firestore when Admin is ready (shared across instances); else in-memory Map.
 */

import { createHash } from "crypto";
import { isFirebaseAdminReady } from "@/lib/firebase-admin";

type Bucket = { count: number; resetAt: number };

const memoryBuckets = new Map<string, Bucket>();

/** Sweep: șterge intrările expirate pentru a preveni creșterea nelimitată a Map-ului. */
function sweepExpiredBuckets(): void {
  const now = Date.now();
  for (const [key, bucket] of memoryBuckets) {
    if (bucket.resetAt <= now) {
      memoryBuckets.delete(key);
    }
  }
}

// Rulează sweep automat la fiecare 10 minute (doar pe server, nu pe client).
if (typeof window === "undefined") {
  setInterval(sweepExpiredBuckets, 10 * 60 * 1000);
}

/** Cap de siguranță: dacă Map-ul depășește această limită, trigger sweep imediat. */
const MEMORY_BUCKET_CAP = 10_000;

function isIpLike(value: string): boolean {
  // Basic IPv4 / IPv6 (incl. ::ffff:x.x.x.x) — reject empty / garbage spoof attempts
  if (!value || value.length > 45) return false;
  if (value === "unknown") return false;
  return /^[\d.:a-fA-F]+$/.test(value);
}

/**
 * Client IP behind a single trusted reverse proxy (Hetzner nginx / Cloudflare).
 * Prefer X-Real-IP (set by proxy to $remote_addr).
 * For X-Forwarded-For, use the RIGHTMOST hop (appended by proxy); leftmost is client-spoofable.
 */
export function clientIpFromRequest(req: { headers: Headers }): string {
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp && isIpLike(realIp)) return realIp;

  const xf = req.headers.get("x-forwarded-for");
  if (xf) {
    const parts = xf
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    // Rightmost = last proxy-added address when using $proxy_add_x_forwarded_for
    for (let i = parts.length - 1; i >= 0; i--) {
      if (isIpLike(parts[i])) return parts[i];
    }
  }

  const cf = req.headers.get("cf-connecting-ip")?.trim();
  if (cf && isIpLike(cf)) return cf;

  return "unknown";
}

function consumeMemoryRateLimit(
  key: string,
  limit: number,
  windowMs: number
): boolean {
  // Auto-sweep dacă Map-ul depășește cap-ul de siguranță
  if (memoryBuckets.size > MEMORY_BUCKET_CAP) {
    sweepExpiredBuckets();
  }
  const now = Date.now();
  const existing = memoryBuckets.get(key);
  if (!existing || existing.resetAt <= now) {
    memoryBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (existing.count >= limit) return false;
  existing.count += 1;
  return true;
}

function rateLimitDocId(key: string): string {
  return createHash("sha256").update(key).digest("hex").slice(0, 40);
}

async function consumeFirestoreRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<boolean> {
  // Dynamic import path keeps admin init lazy via existing proxy
  const { adminDb } = await import("@/lib/firebase-admin");
  const FieldValue = (await import("firebase-admin/firestore")).FieldValue;
  const ref = adminDb.collection("rate_limits").doc(rateLimitDocId(key));
  const now = Date.now();

  return adminDb.runTransaction(async (tx: any) => {
    const snap = await tx.get(ref);
    const data = snap.exists ? snap.data() : null;
    const resetAt = typeof data?.resetAt === "number" ? data.resetAt : 0;
    const count = typeof data?.count === "number" ? data.count : 0;

    if (!data || resetAt <= now) {
      tx.set(ref, {
        key,
        count: 1,
        resetAt: now + windowMs,
        updatedAt: FieldValue.serverTimestamp(),
      });
      return true;
    }
    if (count >= limit) return false;
    tx.update(ref, {
      count: count + 1,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return true;
  });
}

/**
 * Returns true if allowed; false if over limit.
 * Uses Firestore when Admin is configured (multi-instance safe); else memory.
 */
export async function consumeRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<boolean> {
  if (isFirebaseAdminReady) {
    try {
      return await consumeFirestoreRateLimit(key, limit, windowMs);
    } catch (err) {
      console.warn("[rateLimit] Firestore backend failed — memory fallback:", err);
    }
  }
  return consumeMemoryRateLimit(key, limit, windowMs);
}
