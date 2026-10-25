import Link from 'next/link';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import TaskCard from '@/app/_components/guide/TaskCard';
import PageHero from '@/app/_components/layout/PageHero';
import { getJSON, LANGUAGES } from '@/lib/guide';

export const metadata = {
  title: 'What do you want to do with AI? - ModelMate',
  description: 'Pick a task and see which AI does it best right now, with prices and free options.',
};

export default async function TasksPage({ searchParams }) {
  const { language = '', search = '' } = await searchParams;
  const params = new URLSearchParams();
  if (language) params.set('language', language);
  if (search) params.set('search', search);
  const tasks = (await getJSON(`/tasks/?${params}`)) || [];

  const filterHref = (code) => {
    const next = new URLSearchParams(params);
    if (code) next.set('language', code);
    else next.delete('language');
    return `/tasks${next.size ? `?${next}` : ''}`;
  };
  const filters = [['', 'All languages'], ...Object.entries(LANGUAGES).map(([code, l]) => [code, l.native])];

  return (
    <main className="min-h-[60vh]">
      <PageHero title="What do you want to do?">
        <p className="mt-3 max-w-2xl text-xl text-ink-500">Pick a task to see which AI does it best right now.</p>

        <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center">
          <form action="/tasks" className="flex max-w-xl flex-1 items-center rounded-full border-2 border-cream-200 bg-white p-1.5 focus-within:border-coral-200">
            {language && <input type="hidden" name="language" value={language} />}
            <MagnifyingGlassIcon className="ml-3 h-5 w-5 shrink-0 text-ink-400" aria-hidden />
            <input
              name="search"
              defaultValue={search}
              aria-label="Search tasks"
              placeholder="e.g. summarize, email, Bangla…"
              className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-ink-900 placeholder:text-ink-400 focus:outline-none"
            />
            <button className="rounded-full bg-coral-500 px-5 py-2.5 font-semibold text-white hover:bg-coral-600">Search</button>
          </form>
          <div className="flex gap-2">
            {filters.map(([code, label]) => (
              <Link
                key={code || 'all'}
                href={filterHref(code)}
                className={`rounded-full px-4 py-2.5 font-semibold transition ${
                  language === code ? 'bg-ink-900 text-white' : 'border border-cream-300 bg-white text-ink-700 hover:border-coral-200'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </PageHero>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {search && (
          <p className="mb-6 text-ink-500">
            {tasks.length} {tasks.length === 1 ? 'task matches' : 'tasks match'} <span className="font-semibold text-ink-900">“{search}”</span>
            {' · '}
            <Link href={language ? `/tasks?language=${language}` : '/tasks'} className="font-semibold text-coral-600 hover:underline">
              Clear search
            </Link>
          </p>
        )}
        {tasks.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tasks.map((task) => <TaskCard key={task.id} task={task} />)}
          </div>
        ) : (
          <div className="mx-auto max-w-md rounded-3xl bg-cream-100 p-10 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-coral-600">
              <MagnifyingGlassIcon className="h-7 w-7" aria-hidden />
            </span>
            <h2 className="mt-4 text-xl font-bold text-ink-900">No tasks match{search ? ` “${search}”` : ''} yet</h2>
            <p className="mt-1 text-ink-500">Try a shorter word like “write”, “code” or “Bangla”.</p>
            <Link href="/tasks" className="mt-6 inline-block rounded-full bg-coral-500 px-6 py-2.5 font-semibold text-white hover:bg-coral-600">
              See all tasks
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
