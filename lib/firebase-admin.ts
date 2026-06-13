import admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    let rawKey = process.env.FIREBASE_PRIVATE_KEY || '';

    // Strip surrounding quotes if present
    if (rawKey.startsWith('"') && rawKey.endsWith('"')) {
      rawKey = rawKey.slice(1, -1);
    }

    // Trim any leading/trailing whitespace
    rawKey = rawKey.trim();

    // Handle both formats:
    // 1. Literal \n (from JSON copy-paste): replace \\n with real newline
    // 2. Real newlines already in the string (from Vercel multiline paste): leave as-is
    if (rawKey.includes('\\n')) {
      rawKey = rawKey.replace(/\\n/g, '\n');
    }

    // If key doesn't have the PEM headers, it's unusable - log for debugging
    const hasBegin = rawKey.includes('-----BEGIN PRIVATE KEY-----');
    const hasEnd = rawKey.includes('-----END PRIVATE KEY-----');
    console.log(`Firebase key check — hasBegin: ${hasBegin}, hasEnd: ${hasEnd}, length: ${rawKey.length}`);

    const clientEmail = (process.env.FIREBASE_CLIENT_EMAIL || '').replace(/"/g, '').trim();

    if (clientEmail && rawKey && hasBegin && hasEnd) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: clientEmail,
          privateKey: rawKey,
        }),
      });
      console.log("Firebase Admin initialized successfully.");
    } else {
      console.warn(`Firebase Admin: missing credentials. email=${!!clientEmail}, key=${!!rawKey}, begin=${hasBegin}, end=${hasEnd}`);
      admin.initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    }
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
  }
}

const adminDb = admin.firestore();
const adminAuth = admin.auth();

export { adminDb, adminAuth };
