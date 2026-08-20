import React from 'react';
import { headers } from 'next/headers';
import dynamic from 'next/dynamic';
import LocaleRedirectGuard from '@/components/LocaleRedirectGuard';

const DemoDesktop = dynamic(() => import('@/components/DemoDesktop'), {
  ssr: true,
  loading: () => <div className="min-h-screen bg-[#09090b]" />,
});

const DemoMobile = dynamic(() => import('@/components/DemoMobile'), {
  ssr: true,
  loading: () => <div className="min-h-screen bg-[#09090b]" />,
});

export default async function DemoPage() {
  const headersList = await headers();
  const deviceType = headersList.get('x-device-type') || 'desktop';

  return (
    <>
      <LocaleRedirectGuard pathRo="/demo" />
      {deviceType === 'mobile' ? (
        <DemoMobile locale="ro" />
      ) : (
        <DemoDesktop locale="ro" />
      )}
    </>
  );
}
