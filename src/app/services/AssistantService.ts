// Client du moteur d'assistant Python (backend/main.py).
// Envoie le message au service FastAPI local et renvoie un objet normalisé.
// Si le backend Python n'est pas joignable, le composant AdminQuoteAgent
// bascule automatiquement sur le moteur local (QuoteService.ts).

import { WorkEstimate } from './QuoteService';

export interface AssistantReply {
  reply: string;
  intent: string;
  category?: string | null;
  estimate?: WorkEstimate | null;
}

interface RequestPayload {
  message: string;
  history: { role: 'user' | 'bot'; text: string }[];
  report?: {
    title?: string;
    category?: string;
    subCategory?: string;
  } | null;
}

let unhealthyUntil = 0;

export const ASSISTANT_API_URL =
  (import.meta.env.VITE_ASSISTANT_API_URL as string | undefined) ||
  'http://localhost:8000/api/assistant';

export const resolveAssistantUrl = () => ASSISTANT_API_URL;

export const checkAssistantHealth = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${ASSISTANT_API_URL}/health`, { signal: controller.signal });
    clearTimeout(timer);
    if (res.ok) {
      unhealthyUntil = 0;
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

export const isAssistantBackendAvailable = () =>
  Date.now() > unhealthyUntil || unhealthyUntil === 0;

export const askAssistant = async (
  message: string,
  history: { role: 'user' | 'bot'; text: string }[],
  report?: RequestPayload['report']
): Promise<AssistantReply> => {
  if (Date.now() < unhealthyUntil) {
    throw new Error('backend unavailable');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4500);

  try {
    const res = await fetch(ASSISTANT_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, report } satisfies RequestPayload),
      signal: controller.signal,
    });

    if (!res.ok) throw new Error(`Assistant HTTP ${res.status}`);

    const data = (await res.json()) as AssistantReply;
    unhealthyUntil = 0;
    return data;
  } catch {
    unhealthyUntil = Date.now() + 20_000;
    throw new Error('assistant backend unreachable');
  } finally {
    clearTimeout(timer);
  }
};