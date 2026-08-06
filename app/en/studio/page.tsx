"use client";
import React, { useEffect } from 'react';
import StudioContent from '@/app/studio/StudioContent';

export default function StudioPageEn() {
  useEffect(() => {
    localStorage.setItem("preferred_language", "en");
  }, []);
  return <StudioContent locale="en" />;
}
