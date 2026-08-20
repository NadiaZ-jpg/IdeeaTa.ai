import React from 'react';
import { headers } from 'next/headers';
import dynamic from 'next/dynamic';
import LocalePreferredSetter from '@/components/LocalePreferredSetter';

const DemoDesktop = dynamic(() => import('@/components/DemoDesktop'), {
  ssr: true,
  loading: () => <div className="min-h-screen bg-[#09090b]" />,
});

const DemoMobile = dynamic(() => import('@/components/DemoMobile'), {
  ssr: true,
  loading: () => <div className="min-h-screen bg-[#09090b]" />,
});

export default async function DemoPageEn() {
  const headersList = await headers();
  const deviceType = headersList.get('x-device-type') || 'desktop';

  return (
    <>
      <LocalePreferredSetter locale="en" />
      {deviceType === 'mobile' ? (
        <DemoMobile locale="en" />
      ) : (
        <DemoDesktop locale="en" />
      )}
    </>
  );
}
