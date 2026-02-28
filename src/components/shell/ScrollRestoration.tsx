'use client';

import { useEffect } from 'react';

export default function ScrollRestoration() {
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
      const key = () => `scroll:${window.location.pathname}`;
      const saved = sessionStorage.getItem(key());
      if (saved) window.scrollTo(0, Number(saved));
      const onBeforeUnload = () => sessionStorage.setItem(key(), String(window.scrollY));
      window.addEventListener('beforeunload', onBeforeUnload);
      return () => {
        sessionStorage.setItem(key(), String(window.scrollY));
        window.removeEventListener('beforeunload', onBeforeUnload);
      };
    }
  }, []);

  return null;
}
