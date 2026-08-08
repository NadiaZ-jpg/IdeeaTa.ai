/**
 * One-shot: mark a user as Standard paid (isPaid) by email.
 * Usage: node --env-file=.env.local scripts/unlock-standard-by-email.mjs nadiaramonaz@gmail.com
 */
import admin from "firebase-admin";

const email = (process.argv[2] || "").trim().toLowerCase();
if (!email) {
  console.error("Usage: node --env-file=.env.local scripts/unlock-standard-by-email.mjs <email>");
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

await ref.set(
  {
    isPaid: true,
    unlockedPlans: Array.isArray(prev?.unlockedPlans) ? prev.unlockedPlans : [],
    lemonUnlockNote: "Manual Standard unlock after Lemon test order (8 Aug 2026)",
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  { merge: true }
);

console.log(`Unlocked Standard (isPaid=true) for ${email} uid=${uid}`);
process.exit(0);
