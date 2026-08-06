"use client";
import React, { useEffect } from 'react';
import DemoContent from '@/app/demo/DemoContent';

export default function DemoPageEn() {
  useEffect(() => {
    localStorage.setItem("preferred_language", "en");
  }, []);

  return <DemoContent locale="en" />;
}
