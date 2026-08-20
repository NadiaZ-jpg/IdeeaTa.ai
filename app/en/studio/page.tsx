import React from 'react';
import { headers } from 'next/headers';
import dynamic from 'next/dynamic';
import LocalePreferredSetter from '@/components/LocalePreferredSetter';

const StudioDesktop = dynamic(() => import('@/components/StudioDesktop'), {
  ssr: true,
  loading: () => <div className="min-h-screen bg-[#09090b]" />,
});

const StudioMobile = dynamic(() => import('@/components/StudioMobile'), {
  ssr: true,
  loading: () => <div className="min-h-screen bg-[#09090b]" />,
});

export default async function StudioPageEn() {
  const headersList = await headers();
  const deviceType = headersList.get('x-device-type') || 'desktop';

  return (
    <>
      <LocalePreferredSetter locale="en" />
      {deviceType === 'mobile' ? (
        <StudioMobile locale="en" />
      ) : (
        <StudioDesktop locale="en" />
      )}
    </>
  );
}
