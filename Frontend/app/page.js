import Link from 'next/link';
import TaskCard from './_components/guide/TaskCard';
import ModelRow from './_components/guide/ModelRow';
import { getJSON, formatDay, formatUSD, LANGUAGES } from '@/lib/guide';

export const metadata = {
  title: 'ModelMate - Which AI should you use?',
  description:
    'Pick what you want to do and see which AI does it best right now, ranked by blind votes, with prices and free options. Includes Bangla tasks.',
};

function PriceMove({ change }) {
  const before = Number(change.old_input_price_per_mtok) + Number(change.old_output_price_per_mtok);
  const after = Number(change.new_input_price_per_mtok) + Number(change.new_output_price_per_mtok);
  const cheaper = after < before;
  return (
    <li className="flex items-center justify-between gap-4 py-3 text-sm">
      <div>
        <div className="font-medium text-gray-900">{change.model.name}</div>
        <div className="text-xs text-gray-500">{change.model.creator}</div>
      </div>
      <span className={cheaper ? 'text-green-700' : 'text-red-700'}>
        {cheaper ? 'Cheaper' : 'Pricier'}: {formatUSD(before * 0.5)} → {formatUSD(after * 0.5)}
        <span className="text-gray-500"> / 1,000 chats</span>
      </span>
    </li>
  );
}

export default async function HomePage() {
  const [tasks, changes] = await Promise.all([
    getJSON('/tasks/?featured=true').catch(() => []),
    getJSON('/changes/?days=7').catch(() => null),
  ]);
  const byLanguage = Object.keys(LANGUAGES)
    .map((code) => ({ code, tasks: (tasks || []).filter((t) => t.language === code) }))
    .filter((group) => group.tasks.length);

  return (
    <main className="bg-white">
      <section className="border-b border-gray-200 bg-gradient-to-b from-blue-50/60 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">Which AI should you use?</h1>
          <p className="mt-4 text-lg text-gray-600">
            Tell us what you want to do. We show which AI does it best <em>right now</em>, ranked by blind votes
            from real people, with prices and free options. Updated as new models come out.
          </p>
          <form action="/tasks" className="mt-8 flex gap-2 max-w-xl mx-auto">
            <input
              name="search"
              placeholder="What do you want to do? e.g. write an email"
              className="flex-1 rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:outline-none"
            />
            <button className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">Find</button>
          </form>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
        {byLanguage.map((group) => (
          <section key={group.code}>
            <div className="flex items-end justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {group.code === 'en' ? 'Popular tasks' : `Tasks in ${LANGUAGES[group.code].label} · ${LANGUAGES[group.code].native}`}
              </h2>
              <Link href={`/tasks?language=${group.code}`} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                View all →
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {group.tasks.map((task) => <TaskCard key={task.id} task={task} />)}
            </div>
          </section>
        ))}

        {changes && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900">What changed this week</h2>
            <p className="text-gray-600 mb-6">AI moves fast. Here is what is new since {formatDay(Date.now() - changes.days * 86400000)}.</p>

            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <div className="flex items-end justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">New models</h3>
                  <Link href="/models" className="text-sm text-blue-600 hover:text-blue-800">All models →</Link>
                </div>
                {changes.new_models.length ? (
                  <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 px-4">
                    {changes.new_models.slice(0, 6).map((m) => <ModelRow key={m.id} model={m} />)}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No new models this week.</p>
                )}
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">New #1s</h3>
                  {changes.leader_changes.length ? (
                    <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 px-4">
                      {changes.leader_changes.map((c) => (
                        <li key={`${c.task.slug}-${c.date}`} className="py-3 text-sm">
                          <Link href={`/tasks/${c.task.slug}`} className="font-medium text-gray-900 hover:text-blue-700">
                            {c.task.name}
                          </Link>
                          <div className="text-gray-600">
                            {c.new_leader.name} took #1{c.previous_leader ? ` from ${c.previous_leader.name}` : ''} · {formatDay(c.date)}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No task changed leader this week.</p>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Price changes</h3>
                  {changes.price_changes.length ? (
                    <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 px-4">
                      {changes.price_changes.map((c) => <PriceMove key={`${c.model.id}-${c.changed_at}`} change={c} />)}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No price changes this week.</p>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="rounded-2xl bg-gray-50 p-8">
          <h2 className="text-xl font-bold text-gray-900">How the rankings work</h2>
          <ol className="mt-4 grid gap-6 sm:grid-cols-3 text-sm text-gray-700">
            <li><span className="font-semibold text-gray-900">1. Blind tests.</span> Two AIs answer the same prompt. You pick the better answer without knowing which AI wrote it.</li>
            <li><span className="font-semibold text-gray-900">2. Fresh votes count more.</span> A vote loses half its weight every 30 days, so rankings follow the newest models.</li>
            <li><span className="font-semibold text-gray-900">3. New models get tested fast.</span> New releases start as challengers and are ranked once enough people have voted.</li>
          </ol>
        </section>
      </div>
    </main>
  );
}
