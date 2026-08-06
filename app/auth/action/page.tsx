"use client";

import { Suspense } from "react";
import AuthActionContent from "@/components/AuthActionContent";

export default function AuthActionPageRo() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#09090b]" />}>
      <AuthActionContent locale="ro" />
    </Suspense>
  );
}
