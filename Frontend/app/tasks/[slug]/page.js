import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ModelBadges, ModelName, ChatCost } from '@/app/_components/guide/ModelRow';
import { getJSON, formatDay, languageLabel, asPhrase } from '@/lib/guide';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const task = await getJSON(`/tasks/${slug}/`);
  if (!task) return { title: 'Task not found - ModelMate' };
  const leader = task.ranking[0]?.model.name;
  return {
    title: `Best AI to ${asPhrase(task.name)} (${new Date().getFullYear()}) - ModelMate`,
    description: leader
      ? `${leader} is currently #1 for "${task.name}", based on blind votes. See the full ranking, prices and free options.`
      : `Which AI is best for "${task.name}"? Rankings from blind side-by-side votes, with prices and free options.`,
  };
}

// Turn the daily rank-1 history into "who led, from when to when".
function leaderPeriods(history) {
  const periods = [];
  for (const row of history.filter((r) => r.rank === 1)) {
    const last = periods[periods.length - 1];
    if (last && last.model_id === row.model_id) last.to = row.date;
    else periods.push({ model_id: row.model_id, model_name: row.model_name, from: row.date, to: row.date });
  }
  return periods.reverse();
}

export default async function TaskPage({ params }) {
  const { slug } = await params;
  const [task, history] = await Promise.all([getJSON(`/tasks/${slug}/`), getJSON(`/tasks/${slug}/history/`)]);
  if (!task) notFound();

  const lang = task.language === 'en' ? undefined : task.language;
  const periods = leaderPeriods(history || []);
  const hasRanking = task.ranking.length > 0;

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/tasks" className="hover:text-gray-900">Tasks</Link> <span aria-hidden>/</span> {task.name}
      </nav>

      <header className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          {task.category_name && <span className="text-sm text-blue-600">{task.category_name}</span>}
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
            {languageLabel(task.language)}
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Best AI to {asPhrase(task.name)}</h1>
        {task.description && <p className="mt-2 text-lg text-gray-600">{task.description}</p>}
        <p className="mt-3 text-sm text-gray-500">
          {hasRanking
            ? `Ranking updated ${formatDay(task.ranking_date)}. Recent votes count more than old ones, so this changes as new models come out.`
            : 'No ranking yet.'}
        </p>
        <Link
          href={`/tasks/${task.slug}/compare`}
          className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700"
        >
          Compare two AIs and vote
        </Link>
      </header>

      {hasRanking ? (
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Current ranking</h2>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">AI</th>
                  <th className="px-4 py-3 font-medium text-right">Wins</th>
                  <th className="px-4 py-3 font-medium text-right">Votes (30 days)</th>
                  <th className="px-4 py-3 font-medium text-right" title="A short chat: about 375 English words in and 375 out">Cost / 1,000 chats</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {task.ranking.map((row) => (
                  <tr key={row.model.id} className={row.rank === 1 ? 'bg-blue-50/50' : undefined}>
                    <td className="px-4 py-3 font-semibold text-gray-900">{row.rank}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <ModelName model={row.model} />
                        <ModelBadges model={row.model} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">{Math.round(row.win_rate * 100)}%</td>
                    <td className="px-4 py-3 text-right">{row.recent_votes}</td>
                    <td className="px-4 py-3 text-right"><ChatCost model={row.model} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="mb-10 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6">
          <h2 className="font-semibold text-gray-900">Rankings are on the way</h2>
          <p className="mt-2 text-gray-600">
            Rankings come from blind side-by-side votes: two AIs answer the same prompt, and people pick the
            better answer without knowing which AI wrote it.{' '}
            <Link href={`/tasks/${task.slug}/compare`} className="font-medium text-blue-600 hover:underline">
              Be one of the first to vote
            </Link>.
          </p>
        </section>
      )}

      {task.new_challengers.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900">New challengers</h2>
          <p className="text-sm text-gray-500 mb-3">Being tested. They get ranked once enough people have voted.</p>
          <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 px-4">
            {task.new_challengers.map((row) => (
              <li key={row.model.id} className="flex items-center justify-between gap-4 py-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <ModelName model={row.model} />
                  <ModelBadges model={row.model} />
                </div>
                <span className="text-sm text-gray-500">{row.recent_votes} votes so far</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {periods.length > 1 && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Who has been #1</h2>
          <ol className="space-y-2 text-sm">
            {periods.map((p) => (
              <li key={`${p.model_id}-${p.from}`} className="flex justify-between gap-4 border-b border-gray-100 pb-2">
                <span className="font-medium text-gray-900">{p.model_name}</span>
                <span className="text-gray-500">
                  {formatDay(p.from)}{p.to !== p.from ? ` – ${formatDay(p.to)}` : ''}
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {task.prompts.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900">How we test this</h2>
          <p className="text-sm text-gray-500 mb-3">Every AI, including each new release, answers these same prompts.</p>
          <ul className="space-y-3">
            {task.prompts.map((p) => (
              <li key={p.id} lang={lang} className="whitespace-pre-line rounded-lg bg-gray-50 p-4 text-gray-800">
                {p.prompt}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
