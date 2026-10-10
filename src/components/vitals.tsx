'use client';
import { useCallback } from 'react';
import { useReportWebVitals } from 'next/web-vitals';
export function Vitals() {
  useReportWebVitals(useCallback((metric) => {
    if (new URLSearchParams(window.location.search).has('measure')) console.info('[local-vitals]', JSON.stringify({ name: metric.name, value: metric.value, rating: metric.rating }));
  }, []));
  return null;
}
