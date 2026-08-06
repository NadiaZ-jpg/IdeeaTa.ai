"use client";
import React, { useEffect } from 'react';
import StudioContent from '@/app/studio/StudioContent';

export default function StudioPageEs() {
  useEffect(() => {
    localStorage.setItem("preferred_language", "es");
  }, []);
  return <StudioContent locale="es" />;
}
