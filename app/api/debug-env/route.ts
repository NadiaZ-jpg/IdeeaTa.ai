import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Check all Firebase-related env vars
  const allKeys = Object.keys(process.env).filter(k => 
    k.includes('FIREBASE') || k.includes('firebase')
  );

  const result: any = {
    foundFirebaseKeys: allKeys,
    FIREBASE_PRIVATE_KEY: {
      present: !!process.env.FIREBASE_PRIVATE_KEY,
      length: (process.env.FIREBASE_PRIVATE_KEY || '').length,
    },
    FIREBASE_CLIENT_EMAIL: {
      present: !!process.env.FIREBASE_CLIENT_EMAIL,
      preview: (process.env.FIREBASE_CLIENT_EMAIL || '').slice(0, 25),
    },
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  };

  return NextResponse.json(result);
}
