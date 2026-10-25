import Link from 'next/link';
import ModelRow from '@/app/_components/guide/ModelRow';
import { getJSON } from '@/lib/guide';

export const metadata = {
  title: 'All AI models, prices and free tiers - ModelMate',
  description: 'Every AI model we track, with current prices, free tiers and newest releases. Updated daily.',
};

const SORTS = [
  ['-first_seen_at', 'Newest'],
  ['chat_price', 'Cheapest'],
  ['-context_length', 'Longest memory'],
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
    `rounded-full px-3 py-1.5 text-sm font-medium ${active ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`;

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900">All AI models</h1>
      <p className="mt-2 text-gray-600">
        {data.count} models with current prices, updated daily. Not sure which to pick?{' '}
        <Link href="/tasks" className="text-blue-600 hover:underline">Start from what you want to do</Link>.
      </p>

      <form action="/models" className="mt-6 flex gap-2">
        {free && <input type="hidden" name="free" value="true" />}
        {ordering !== '-first_seen_at' && <input type="hidden" name="ordering" value={ordering} />}
        <input
          name="search"
          defaultValue={search}
          placeholder="Search by name or company…"
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
        />
        <button className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">Search</button>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {SORTS.map(([value, label]) => (
          <Link key={value} href={href({ ordering: value, page: '1' })} className={chip(ordering === value)}>
            {label}
          </Link>
        ))}
        <span className="mx-1 h-5 w-px bg-gray-300" aria-hidden />
        <Link href={href({ free: free ? '' : 'true', page: '1' })} className={chip(Boolean(free))}>
          Free tier only
        </Link>
      </div>

      {data.results.length ? (
        <ul className="mt-6 divide-y divide-gray-100 rounded-xl border border-gray-200 px-4">
          {data.results.map((model) => <ModelRow key={model.id} model={model} />)}
        </ul>
      ) : (
        <p className="mt-10 text-gray-600">No models match{search ? ` "${search}"` : ''}.</p>
      )}

      <p className="mt-3 text-xs text-gray-500">
        Cost per 1,000 chats assumes a short chat (about 375 English words in and 375 out) at API prices. Apps with monthly plans may differ.
      </p>

      {(data.previous || data.next) && (
        <div className="mt-6 flex justify-between">
          {data.previous ? (
            <Link href={href({ page: String(pageNum - 1) })} className="text-blue-600 hover:underline">← Previous</Link>
          ) : <span />}
          {data.next && <Link href={href({ page: String(pageNum + 1) })} className="text-blue-600 hover:underline">Next →</Link>}
        </div>
      )}
    </main>
  );
}
