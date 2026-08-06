import admin from "firebase-admin";

function readPrivateKey(): string {
  let rawKey = process.env.FIREBASE_PRIVATE_KEY || "";
  if (rawKey.startsWith('"') && rawKey.endsWith('"')) {
    rawKey = rawKey.slice(1, -1);
  }
  rawKey = rawKey.trim();
  if (rawKey.includes("\\n")) {
    rawKey = rawKey.replace(/\\n/g, "\n");
  }
  return rawKey;
}

function hasValidCredentials(): boolean {
  const rawKey = readPrivateKey();
  const clientEmail = (process.env.FIREBASE_CLIENT_EMAIL || "").replace(/"/g, "").trim();
  return !!(
    clientEmail &&
    rawKey &&
    rawKey.includes("-----BEGIN PRIVATE KEY-----") &&
    rawKey.includes("-----END PRIVATE KEY-----") &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );
}

export const isFirebaseAdminReady: boolean = (() => {
  try {
    if (!hasValidCredentials()) {
      console.warn(
        "Firebase Admin: missing FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY — Admin SDK disabled (local share fallback available in development)."
      );
      return false;
    }

    if (!admin.apps.length) {
      const rawKey = readPrivateKey();
      const clientEmail = (process.env.FIREBASE_CLIENT_EMAIL || "").replace(/"/g, "").trim();
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail,
          privateKey: rawKey,
        }),
      });
      console.log("Firebase Admin initialized successfully.");
    }
    return true;
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
    return false;
  }
})();

function requireAdmin() {
  if (!isFirebaseAdminReady || !admin.apps.length) {
    throw new Error(
      "Firebase Admin is not configured. Add FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY to .env.local (see .env.example)."
    );
  }
}

export const adminDb = new Proxy({} as any, {
  get(_t, prop) {
    requireAdmin();
    const db = admin.firestore() as any;
    const value = db[prop];
    return typeof value === "function" ? value.bind(db) : value;
  },
});

export const adminAuth = new Proxy({} as any, {
  get(_t, prop) {
    requireAdmin();
    const auth = admin.auth() as any;
    const value = auth[prop];
    return typeof value === "function" ? value.bind(auth) : value;
  },
});
