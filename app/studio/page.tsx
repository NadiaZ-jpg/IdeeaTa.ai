import React from 'react';
import { headers } from 'next/headers';
import dynamic from 'next/dynamic';
import LocaleRedirectGuard from '@/components/LocaleRedirectGuard';

const StudioDesktop = dynamic(() => import('@/components/StudioDesktop'), {
  ssr: true,
  loading: () => <div className="min-h-screen bg-[#09090b]" />,
});

const StudioMobile = dynamic(() => import('@/components/StudioMobile'), {
  ssr: true,
  loading: () => <div className="min-h-screen bg-[#09090b]" />,
});

export default async function StudioPage() {
  const headersList = await headers();
  const deviceType = headersList.get('x-device-type') || 'desktop';

  return (
    <>
      <LocaleRedirectGuard pathRo="/studio" />
      {deviceType === 'mobile' ? (
        <StudioMobile locale="ro" />
      ) : (
        <StudioDesktop locale="ro" />
      )}
    </>
  );
}
