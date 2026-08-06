"use client";

import { Suspense } from "react";
import AuthActionContent from "@/components/AuthActionContent";

export default function AuthActionPageEn() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#09090b]" />}>
      <AuthActionContent locale="en" />
    </Suspense>
  );
}
