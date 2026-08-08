/**
 * One-shot: create/update Firestore promo_codes/STANDARD_NADIA (tier: standard only).
 * Usage: node --env-file=.env.local scripts/seed-standard-promo.mjs
 */
import admin from "firebase-admin";

const CODE = "STANDARD_NADIA";

function readPrivateKey() {
  let rawKey = process.env.FIREBASE_PRIVATE_KEY || "";
  if (rawKey.startsWith('"') && rawKey.endsWith('"')) {
    rawKey = rawKey.slice(1, -1);
  }
  rawKey = rawKey.trim().replace(/\\n/g, "\n");
  return rawKey;
}

const clientEmail = (process.env.FIREBASE_CLIENT_EMAIL || "").replace(/"/g, "").trim();
const privateKey = readPrivateKey();
const projectId =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  process.env.FIREBASE_PROJECT_ID ||
  "ideeata";

if (!clientEmail || !privateKey.includes("BEGIN PRIVATE KEY")) {
  console.error("Missing FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY — abort.");
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

const db = admin.firestore();
const ref = db.collection("promo_codes").doc(CODE);
const snap = await ref.get();

const payload = {
  active: true,
  tier: "standard",
  note: "Test promo — Standard package only (not Full Access). Created for Nadia.",
  updatedAt: admin.firestore.FieldValue.serverTimestamp(),
};

if (!snap.exists) {
  await ref.set({
    ...payload,
    usedBy: [],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  console.log(`Created promo_codes/${CODE} (tier=standard, active=true)`);
} else {
  const existing = snap.data() || {};
  await ref.set(
    {
      ...payload,
      usedBy: Array.isArray(existing.usedBy) ? existing.usedBy : [],
    },
    { merge: true }
  );
  console.log(`Updated promo_codes/${CODE} (tier=standard, active=true)`);
}

process.exit(0);
