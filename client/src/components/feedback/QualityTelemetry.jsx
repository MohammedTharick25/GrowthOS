import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

const endpoint = `${(import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')}/quality/v1/event`;

export default function QualityTelemetry() {
  const enabled = useSelector((state) => Boolean(state.session.user?.analyticsOptIn));
  const sent = useRef(new Set());

  useEffect(() => {
    if (!enabled) return undefined;
    let cls = 0;
    let lcp = 0;
    let inp = 0;
    let active = true;
    const report = (payload, key) => {
      if (!active || sent.current.has(key)) return;
      sent.current.add(key);
      fetch(endpoint, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), keepalive: true }).catch(() => {});
    };
    const error = () => report({ kind: 'error', name: 'window_error' }, 'window_error');
    const rejection = () => report({ kind: 'error', name: 'unhandled_rejection' }, 'unhandled_rejection');
    const observe = (type, callback) => {
      if (!window.PerformanceObserver?.supportedEntryTypes?.includes(type)) return null;
      const observer = new PerformanceObserver((list) => callback(list.getEntries()));
      observer.observe({ type, buffered: true });
      return observer;
    };
    const observers = [
      observe('largest-contentful-paint', (entries) => { lcp = entries.at(-1)?.startTime || lcp; }),
      observe('layout-shift', (entries) => { for (const entry of entries) if (!entry.hadRecentInput) cls += entry.value; }),
      observe('event', (entries) => { for (const entry of entries) inp = Math.max(inp, entry.duration || 0); }),
    ].filter(Boolean);
    const nav = performance.getEntriesByType('navigation')[0];
    if (nav) report({ kind: 'vital', name: 'TTFB', value: Math.max(0, Math.round(nav.responseStart - nav.startTime)) }, 'TTFB');
    const flush = () => {
      if (document.visibilityState !== 'hidden') return;
      if (lcp) report({ kind: 'vital', name: 'LCP', value: Math.round(lcp) }, 'LCP');
      report({ kind: 'vital', name: 'CLS', value: Math.round(cls * 1000) / 1000 }, 'CLS');
      if (inp) report({ kind: 'vital', name: 'INP', value: Math.round(inp) }, 'INP');
    };
    window.addEventListener('error', error);
    window.addEventListener('unhandledrejection', rejection);
    document.addEventListener('visibilitychange', flush);
    return () => {
      active = false;
      for (const observer of observers) observer.disconnect();
      window.removeEventListener('error', error);
      window.removeEventListener('unhandledrejection', rejection);
      document.removeEventListener('visibilitychange', flush);
    };
  }, [enabled]);

  return null;
}
