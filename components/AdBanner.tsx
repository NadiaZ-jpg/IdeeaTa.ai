'use client';

import { useEffect, useRef, useState } from 'react';
import { ADSENSE_CLIENT, hasCookieConsent, loadAdSenseScript } from '@/lib/adsenseConsent';

interface AdBannerProps {
  dataAdSlot: string;
  dataAdFormat?: string;
  dataFullWidthResponsive?: string;
  className?: string;
}

export function AdBanner({
  dataAdSlot,
  dataAdFormat = 'auto',
  dataFullWidthResponsive = 'true',
  className = '',
}: AdBannerProps) {
  const adRef = useRef<HTMLModElement>(null);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const sync = () => {
      const ok = hasCookieConsent();
      setAllowed(ok);
      if (ok) loadAdSenseScript();
    };
    sync();
    window.addEventListener('ideeta-cookie-consent', sync);
    return () => window.removeEventListener('ideeta-cookie-consent', sync);
  }, []);

  useEffect(() => {
    if (!allowed) return;
    try {
      if (adRef.current && !adRef.current.hasAttribute('data-adsbygoogle-status')) {
        loadAdSenseScript();
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.warn('AdSense error:', err);
    }
  }, [allowed, dataAdSlot]);

  if (!allowed) {
    return null;
  }

  return (
    <div className={`overflow-hidden flex justify-center items-center ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={dataAdSlot}
        data-ad-format={dataAdFormat}
        data-full-width-responsive={dataFullWidthResponsive}
      />
    </div>
  );
}
