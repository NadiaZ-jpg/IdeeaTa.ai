/**
 * One-shot: apply Pro Tools top-up (+5 gen / +4 Pro edits / +2 combine) by email.
 * Use when Lemon order succeeded but webhook could not reach local / undeployed code.
 *
 * Usage: node --env-file=.env.local scripts/grant-pro-topup-by-email.mjs you@email.com
 */
import admin from "firebase-admin";

const GENERATE = 5;
const EDIT = 4;
const COMBINE = 2;

const email = (process.argv[2] || "").trim().toLowerCase();
if (!email) {
  console.error(
    "Usage: node --env-file=.env.local scripts/grant-pro-topup-by-email.mjs <email>"
  );
  process.exit(1);
}

function readPrivateKey() {
  let rawKey = process.env.FIREBASE_PRIVATE_KEY || "";
  if (rawKey.startsWith('"') && rawKey.endsWith('"')) rawKey = rawKey.slice(1, -1);
  return rawKey.trim().replace(/\\n/g, "\n");
}

const clientEmail = (process.env.FIREBASE_CLIENT_EMAIL || "").replace(/"/g, "").trim();
const privateKey = readPrivateKey();
const projectId =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  process.env.FIREBASE_PROJECT_ID ||
  "ideeata";

if (!clientEmail || !privateKey.includes("BEGIN PRIVATE KEY")) {
  console.error("Missing Firebase Admin credentials.");
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
  });
}

const authUser = await admin.auth().getUserByEmail(email);
const uid = authUser.uid;
const ref = admin.firestore().collection("users").doc(uid);
const snap = await ref.get();
const prev = snap.exists ? snap.data() : {};

if (!prev?.euFundsUnlocked) {
  console.error(
    `User ${email} (uid=${uid}) does not have euFundsUnlocked — refuse top-up.`
  );
  process.exit(1);
}

const before = {
  generate: Number(prev.proPackGenerateRemaining ?? 0),
  edit: Number(prev.proPackEditRemaining ?? 0),
  combine: Number(prev.proPackCombineRemaining ?? 0),
};

await ref.set(
  {
    proPackQuotaInitialized: true,
    proPackGenerateRemaining: admin.firestore.FieldValue.increment(GENERATE),
    proPackEditRemaining: admin.firestore.FieldValue.increment(EDIT),
    proPackCombineRemaining: admin.firestore.FieldValue.increment(COMBINE),
    proPackLastTopupAt: new Date().toISOString(),
    lemonUnlockNote: "Manual Pro top-up after Lemon test order (webhook not local)",
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  { merge: true }
);

console.log(
  `Top-up applied for ${email} uid=${uid}: ${before.generate}/${before.edit}/${before.combine} → +${GENERATE}/+${EDIT}/+${COMBINE} (expect ${before.generate + GENERATE}/${before.edit + EDIT}/${before.combine + COMBINE})`
);
process.exit(0);
