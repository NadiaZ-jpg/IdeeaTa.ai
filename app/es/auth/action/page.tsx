"use client";

import { Suspense } from "react";
import AuthActionContent from "@/components/AuthActionContent";

export default function AuthActionPageEs() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#09090b]" />}>
      <AuthActionContent locale="es" />
    </Suspense>
  );
}
