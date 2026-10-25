'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/lib/hooks/useAuth';

const VOTES = [
  ['a', '← A is better'],
  ['tie', 'Tie'],
  ['both_bad', 'Both are bad'],
  ['b', 'B is better →'],
];

function errorText(err) {
  return err.response?.data?.detail || 'Something went wrong. Please try again.';
}

function Answer({ label, text, model, outcome, lang }) {
  return (
    <div
      className={`flex flex-col rounded-xl border p-4 ${
        outcome === 'won' ? 'border-green-400 bg-green-50/40' : 'border-gray-200 bg-white'
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-500">Answer {label}</span>
        {model && (
          <span className="text-sm font-semibold text-gray-900">
            {model.name} <span className="font-normal text-gray-500">· {model.creator}</span>
          </span>
        )}
      </div>
      <div lang={lang} className="whitespace-pre-wrap text-gray-800 leading-relaxed">{text}</div>
    </div>
  );
}

export default function ArenaClient({ task }) {
  const { isLoggedIn, loading: authLoading } = useAuth();
  const [limits, setLimits] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [result, setResult] = useState(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const lang = task.language === 'en' ? undefined : task.language;

  useEffect(() => {
    if (!isLoggedIn) return;
    api.get(`/tasks/${task.slug}/arena/`).then(({ data }) => setLimits(data)).catch(() => {});
  }, [isLoggedIn, task.slug]);

  const start = useCallback(async () => {
    setBusy(true);
    setError('');
    setResult(null);
    try {
      const body = useCustom && customPrompt.trim() ? { prompt: customPrompt.trim() } : {};
      const { data } = await api.post(`/tasks/${task.slug}/arena/`, body);
      setComparison(data);
      setLimits(data.limits);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  }, [customPrompt, task.slug, useCustom]);

  const vote = async (choice) => {
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post(`/comparisons/${comparison.id}/vote/`, { vote: choice });
      setResult(data);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  if (authLoading) return null;

  if (!isLoggedIn) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center">
        <p className="text-gray-700">Sign in to vote. It keeps the rankings fair: one person, one vote per comparison.</p>
        <div className="mt-4 flex justify-center gap-3">
          <Link
            href={`/auth/login?next=/tasks/${task.slug}/compare`}
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            Sign in
          </Link>
          <Link href="/auth/register" className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50">
            Create an account
          </Link>
        </div>
      </div>
    );
  }

  const outcomeFor = (side) => {
    if (!result) return undefined;
    return result.vote === side ? 'won' : undefined;
  };

  return (
    <div>
      {!comparison || result ? (
        <div className="rounded-xl border border-gray-200 p-5">
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={start}
              disabled={busy || limits?.comparisons_left === 0 || (useCustom && !customPrompt.trim())}
              className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {busy ? 'Getting two answers…' : result ? 'Next comparison' : 'Show me two answers'}
            </button>
            {limits?.custom_prompts_available && (
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={useCustom} onChange={(e) => setUseCustom(e.target.checked)} />
                Use my own prompt ({limits.custom_prompts_left} left today)
              </label>
            )}
            {limits && <span className="text-sm text-gray-500 sm:ml-auto">{limits.comparisons_left} votes left today</span>}
          </div>
          {useCustom && (
            <textarea
              lang={lang}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              maxLength={2000}
              rows={3}
              placeholder="Type something you would really ask an AI…"
              className="mt-4 w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none"
            />
          )}
          {busy && <p className="mt-3 text-sm text-gray-500">New answers can take up to a minute.</p>}
        </div>
      ) : null}

      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {comparison && (
        <section className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Prompt</h2>
          <p lang={lang} className="mt-1 whitespace-pre-line rounded-lg bg-gray-50 p-4 text-gray-900">{comparison.prompt}</p>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Answer label="A" text={comparison.output_a} model={result?.model_a} outcome={outcomeFor('a')} lang={lang} />
            <Answer label="B" text={comparison.output_b} model={result?.model_b} outcome={outcomeFor('b')} lang={lang} />
          </div>

          {result ? (
            <p className="mt-4 text-center text-gray-700">
              Thanks! Your vote counts toward the ranking in the next daily update.
            </p>
          ) : (
            <div className="sticky bottom-4 mt-4 grid grid-cols-2 gap-2 rounded-xl bg-white/90 p-2 shadow-lg backdrop-blur sm:grid-cols-4">
              {VOTES.map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => vote(value)}
                  disabled={busy}
                  className={`rounded-lg px-4 py-2.5 font-medium disabled:opacity-50 ${
                    value === 'a' || value === 'b'
                      ? 'bg-gray-900 text-white hover:bg-gray-700'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
