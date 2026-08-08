'use client';

import { useEffect, useRef, useState } from 'react';
import { ADSENSE_CLIENT, hasCookieConsent, loadAdSenseScript } from '@/lib/adsenseConsent';

interface AdBannerProps {
  dataAdSlot: string;
  dataAdFormat?: string;
  dataFullWidthResponsive?: string;
  className?: string;
}

function scheduleAfterLcp(fn: () => void): () => void {
  let cancelled = false;
  let idleId: number | undefined;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const run = () => {
    if (cancelled) return;
    fn();
  };

  const start = () => {
    if (cancelled) return;
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(() => run(), { timeout: 2500 });
    } else {
      timeoutId = setTimeout(run, 1200);
    }
  };

  if (typeof document !== "undefined" && document.readyState === "complete") {
    timeoutId = setTimeout(start, 400);
  } else if (typeof window !== "undefined") {
    const onLoad = () => {
      timeoutId = setTimeout(start, 400);
    };
    window.addEventListener("load", onLoad, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("load", onLoad);
      if (idleId != null && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId) clearTimeout(timeoutId);
    };
  }

  return () => {
    cancelled = true;
    if (typeof window !== "undefined" && idleId != null && "cancelIdleCallback" in window) {
      window.cancelIdleCallback(idleId);
    }
    if (timeoutId) clearTimeout(timeoutId);
  };
}

export function AdBanner({
  dataAdSlot,
  dataAdFormat = 'auto',
  dataFullWidthResponsive = 'true',
  className = '',
}: AdBannerProps) {
  const adRef = useRef<HTMLModElement>(null);
  const [allowed, setAllowed] = useState(false);
  const [canRender, setCanRender] = useState(false);

  useEffect(() => {
    const sync = () => {
      const ok = hasCookieConsent();
      setAllowed(ok);
    };
    sync();
    window.addEventListener('ideeta-cookie-consent', sync);
    return () => window.removeEventListener('ideeta-cookie-consent', sync);
  }, []);

  // Defer AdSense inject until after load / idle — protects LCP on Landing + Resources.
  useEffect(() => {
    if (!allowed) {
      setCanRender(false);
      return;
    }
    return scheduleAfterLcp(() => {
      loadAdSenseScript();
      setCanRender(true);
    });
  }, [allowed]);

  useEffect(() => {
    if (!canRender) return;
    try {
      if (adRef.current && !adRef.current.hasAttribute('data-adsbygoogle-status')) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.warn('AdSense error:', err);
    }
  }, [canRender, dataAdSlot]);

  if (!allowed || !canRender) {
    return <div className={`min-h-[90px] ${className}`} aria-hidden />;
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
