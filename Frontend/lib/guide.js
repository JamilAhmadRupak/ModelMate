// Server-side data helpers and formatters for the buyer's guide (tasks, rankings, catalog).

const API = process.env.NEXT_PUBLIC_API_BASE;

export async function getJSON(path, { revalidate = 300 } = {}) {
  const res = await fetch(`${API}${path}`, { next: { revalidate } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Request failed (${res.status}): ${path}`);
  return res.json();
}

export const LANGUAGES = {
  en: { label: 'English', native: 'English' },
  bn: { label: 'Bangla', native: 'বাংলা' },
};

export function languageLabel(code) {
  return LANGUAGES[code]?.native || code;
}

// A "typical chat" is ~500 tokens in and ~500 out, so 1,000 chats ≈ 0.5M of each.
export function costPerThousandChats(model) {
  const input = Number(model.input_price_per_mtok);
  const output = Number(model.output_price_per_mtok);
  if (model.input_price_per_mtok == null || model.output_price_per_mtok == null) return null;
  return (input + output) * 0.5;
}

export function formatUSD(value) {
  if (value == null) return '—';
  if (value === 0) return '$0';
  if (value < 0.01) return '<$0.01';
  return `$${value < 10 ? value.toFixed(2) : Math.round(value).toLocaleString('en-US')}`;
}

export function isNew(model, days = 14) {
  if (!model.first_seen_at) return false;
  return Date.now() - new Date(model.first_seen_at).getTime() < days * 86400000;
}

export function formatDay(date) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// "Translate English to Bangla" -> "translate English to Bangla", for "Best AI to …" headings.
export function asPhrase(taskName) {
  return taskName.charAt(0).toLowerCase() + taskName.slice(1);
}
