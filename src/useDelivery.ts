import { useEffect, useState } from 'react';
import { telegramBriefEnabled } from './telegram';

// SSR starts with an honest, usable manual route. A healthy durable service upgrades intake.
export function useTelegramDelivery() {
  const [manual, setManual] = useState(telegramBriefEnabled);
  useEffect(() => {
    const configured = import.meta.env?.VITE_BRIEF_DELIVERY;
    if (configured === 'telegram' || configured === 'desk') return;
    const controller = new AbortController();
    void fetch('/health', {
      cache: 'no-store',
      signal: AbortSignal.any([controller.signal, AbortSignal.timeout(4000)]),
    })
      .then(async (response) => {
        if (!response.ok) return;
        const data = await response.json();
        if (data.intake === 'durable' && !controller.signal.aborted) setManual(false);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);
  return manual;
}
