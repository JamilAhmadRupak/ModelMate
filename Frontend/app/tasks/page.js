import Link from 'next/link';
import TaskCard from '@/app/_components/guide/TaskCard';
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
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900">What do you want to do?</h1>
      <p className="mt-2 text-gray-600">Pick a task to see which AI does it best right now.</p>

      <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <form action="/tasks" className="flex-1 flex gap-2">
          {language && <input type="hidden" name="language" value={language} />}
          <input
            name="search"
            defaultValue={search}
            placeholder="e.g. summarize, email, Bangla…"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
          />
          <button className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">Search</button>
        </form>
        <div className="flex gap-2">
          {filters.map(([code, label]) => (
            <Link
              key={code || 'all'}
              href={filterHref(code)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                language === code ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {tasks.length ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => <TaskCard key={task.id} task={task} />)}
        </div>
      ) : (
        <p className="mt-10 text-gray-600">No tasks match{search ? ` "${search}"` : ''} yet.</p>
      )}
    </main>
  );
}
