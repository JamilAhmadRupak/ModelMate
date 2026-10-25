import Link from 'next/link';
import { MagnifyingGlassIcon, SparklesIcon, BanknotesIcon, BookOpenIcon, GiftIcon } from '@heroicons/react/24/outline';
import ModelRow from '@/app/_components/guide/ModelRow';
import PageHero from '@/app/_components/layout/PageHero';
import { getJSON } from '@/lib/guide';

export const metadata = {
  title: 'All AI models, prices and free tiers - ModelMate',
  description: 'Every AI model we track, with current prices, free tiers and newest releases. Updated daily.',
};

const SORTS = [
  ['-first_seen_at', 'Newest', SparklesIcon],
  ['chat_price', 'Cheapest', BanknotesIcon],
  ['-context_length', 'Longest memory', BookOpenIcon],
];

export default async function ModelsPage({ searchParams }) {
  const { search = '', free = '', ordering = '-first_seen_at', page = '1' } = await searchParams;

  const params = new URLSearchParams({ active: 'true', ordering, page });
  if (search) params.set('search', search);
  if (free) params.set('free', 'true');
  const data = (await getJSON(`/models/?${params}`, { revalidate: 600 })) || { count: 0, results: [] };

  const href = (changes) => {
    const next = new URLSearchParams({ ...(search && { search }), ...(free && { free }), ordering, page, ...changes });
    for (const [k, v] of [...next]) if (!v) next.delete(k);
    if (next.get('ordering') === '-first_seen_at') next.delete('ordering');
    if (next.get('page') === '1') next.delete('page');
    return `/models${next.size ? `?${next}` : ''}`;
  };
  const pageNum = Number(page) || 1;
  const chip = (active) =>
    `inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 font-semibold transition ${
      active ? 'bg-ink-900 text-white' : 'border border-cream-300 bg-white text-ink-700 hover:border-coral-200'
    }`;

  return (
    <main className="min-h-[60vh]">
      <PageHero size="max-w-5xl" title="All AI models">
        <p className="mt-3 max-w-2xl text-xl text-ink-500">
          <span className="font-bold text-ink-900">{data.count.toLocaleString('en-US')}</span> models with current prices, updated daily.
          Not sure which to pick?{' '}
          <Link href="/tasks" className="font-semibold text-coral-600 hover:underline">Start from what you want to do →</Link>
        </p>

        <form action="/models" className="mt-8 flex max-w-xl items-center rounded-full border-2 border-cream-200 bg-white p-1.5 focus-within:border-coral-200">
          {free && <input type="hidden" name="free" value="true" />}
          {ordering !== '-first_seen_at' && <input type="hidden" name="ordering" value={ordering} />}
          <MagnifyingGlassIcon className="ml-3 h-5 w-5 shrink-0 text-ink-400" aria-hidden />
          <input
            name="search"
            defaultValue={search}
            aria-label="Search models"
            placeholder="Search by name or company…"
            className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-ink-900 placeholder:text-ink-400 focus:outline-none"
          />
          <button className="rounded-full bg-coral-500 px-5 py-2.5 font-semibold text-white hover:bg-coral-600">Search</button>
        </form>
      </PageHero>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-wrap items-center gap-2">
          {SORTS.map(([value, label, Icon]) => (
            <Link key={value} href={href({ ordering: value, page: '1' })} className={chip(ordering === value)}>
              <Icon className="h-4 w-4" aria-hidden /> {label}
            </Link>
          ))}
          <span className="mx-1 h-6 w-px bg-cream-300" aria-hidden />
          <Link
            href={href({ free: free ? '' : 'true', page: '1' })}
            className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2.5 font-semibold transition ${
              free ? 'border-mint-500 bg-mint-50 text-mint-700' : 'border-cream-300 bg-white text-ink-700 hover:border-mint-500'
            }`}
          >
            <GiftIcon className="h-4 w-4" aria-hidden /> Free tier only
          </Link>
          {search && (
            <Link href={href({ search: '', page: '1' })} className="ml-auto font-semibold text-coral-600 hover:underline">
              Clear “{search}” ✕
            </Link>
          )}
        </div>

        {data.results.length ? (
          <ul className="mt-6 divide-y divide-cream-200/80 overflow-hidden rounded-3xl bg-cream-100">
            {data.results.map((model) => <ModelRow key={model.id} model={model} />)}
          </ul>
        ) : (
          <div className="mx-auto mt-10 max-w-md rounded-3xl bg-cream-100 p-10 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-coral-600">
              <MagnifyingGlassIcon className="h-7 w-7" aria-hidden />
            </span>
            <h2 className="mt-4 text-xl font-bold text-ink-900">No models match{search ? ` “${search}”` : ''}</h2>
            <p className="mt-1 text-ink-500">Try a company name like “Google” or “Anthropic”.</p>
          </div>
        )}

        <p className="mt-4 text-sm text-ink-500">
          Cost per 1,000 chats assumes a short chat (about 375 English words in and 375 out) at API prices. Apps with monthly plans may differ.
        </p>

        {(data.previous || data.next) && (
          <div className="mt-8 flex items-center justify-between">
            {data.previous ? <Link href={href({ page: String(pageNum - 1) })} className={chip(false)}>← Previous</Link> : <span />}
            <span className="text-ink-500">Page {pageNum}</span>
            {data.next ? <Link href={href({ page: String(pageNum + 1) })} className={chip(false)}>Next →</Link> : <span />}
          </div>
        )}
      </div>
    </main>
  );
}
