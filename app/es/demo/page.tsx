"use client";
import React, { useEffect } from 'react';
import DemoContent from '@/app/demo/DemoContent';

export default function DemoPageEs() {
  useEffect(() => {
    localStorage.setItem("preferred_language", "es");
  }, []);

  return <DemoContent locale="es" />;
}
