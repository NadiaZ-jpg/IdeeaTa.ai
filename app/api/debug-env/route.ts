import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const rawKey = process.env.FIREBASE_PRIVATE_KEY || '';
  const email = process.env.FIREBASE_CLIENT_EMAIL || '';
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '';

  return NextResponse.json({
    emailPresent: !!email,
    emailLength: email.length,
    emailPreview: email.slice(0, 20) + '...',
    keyPresent: !!rawKey,
    keyLength: rawKey.length,
    keyFirst30: rawKey.slice(0, 30),
    keyLast30: rawKey.slice(-30),
    hasBegin: rawKey.includes('-----BEGIN PRIVATE KEY-----'),
    hasEnd: rawKey.includes('-----END PRIVATE KEY-----'),
    hasLiteralN: rawKey.includes('\\n'),
    hasRealN: rawKey.includes('\n'),
    projectId: projectId,
  });
}
