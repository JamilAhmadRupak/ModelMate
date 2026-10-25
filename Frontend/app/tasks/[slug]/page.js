import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRightIcon, BeakerIcon, ClockIcon, ChatBubbleBottomCenterTextIcon, TrophyIcon } from '@heroicons/react/24/outline';
import { ModelBadges, ModelName, ChatCost } from '@/app/_components/guide/ModelRow';
import ModelAvatar from '@/app/_components/guide/ModelAvatar';
import TaskIcon from '@/app/_components/guide/TaskIcon';
import PageHero from '@/app/_components/layout/PageHero';
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

// Rank badge colours: gold, silver, bronze.
const PLACES = {
  1: { badge: 'bg-butter-400 text-ink-900', card: 'bg-butter-50', order: 'sm:order-2', label: 'Best overall' },
  2: { badge: 'bg-cream-300 text-ink-700', card: 'bg-cream-100', order: 'sm:order-1', label: 'Runner-up' },
  3: { badge: 'bg-coral-200 text-coral-700', card: 'bg-coral-50', order: 'sm:order-3', label: 'Third place' },
};

function RankBadge({ rank, size = 'md' }) {
  const place = PLACES[rank];
  const box = size === 'lg' ? 'h-10 w-10 text-lg' : 'h-8 w-8 text-sm';
  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold ${box} ${place ? place.badge : 'bg-cream-100 text-ink-500'}`}>
      {rank}
    </span>
  );
}

function WinBar({ rate }) {
  const pct = Math.round(rate * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="h-2.5 w-full min-w-16 overflow-hidden rounded-full bg-cream-200">
        <div className="h-full rounded-full bg-coral-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-10 shrink-0 text-right font-semibold tabular-nums text-ink-900">{pct}%</span>
    </div>
  );
}

function Podium({ rows }) {
  return (
    <div className="grid gap-5 sm:grid-cols-3 sm:pt-5">
      {rows.map((row) => {
        const place = PLACES[row.rank] || PLACES[3];
        const first = row.rank === 1;
        return (
          <div key={row.model.id} className={`${place.order} ${first ? 'sm:-translate-y-5' : ''}`}>
            <div className={`relative h-full rounded-3xl p-6 text-center ${place.card}`}>
              <div className="flex items-center justify-between">
                <RankBadge rank={row.rank} size="lg" />
                <span className={`text-sm font-bold ${first ? 'text-butter-700' : 'text-ink-400'}`}>
                  {first && <TrophyIcon className="mr-1 inline h-4 w-4 -mt-0.5" aria-hidden />}
                  {place.label}
                </span>
              </div>
              <div className="mt-5 flex justify-center">
                <ModelAvatar model={row.model} size="lg" />
              </div>
              <div className="mt-3 flex justify-center text-left">
                <ModelName model={row.model} />
              </div>
              <div className="mt-2 flex min-h-6 flex-wrap justify-center gap-1.5">
                <ModelBadges model={row.model} />
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-2">
                <div className="rounded-2xl bg-white px-2 py-2.5">
                  <dt className="text-xs text-ink-500">Wins</dt>
                  <dd className="text-lg font-bold text-ink-900">{Math.round(row.win_rate * 100)}%</dd>
                </div>
                <div className="rounded-2xl bg-white px-2 py-2.5">
                  <dt className="text-xs text-ink-500">1,000 chats</dt>
                  <dd className="text-lg"><ChatCost model={row.model} /></dd>
                </div>
              </dl>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SectionTitle({ icon: Icon, tint = 'bg-coral-50 text-coral-600', title, subtitle }) {
  return (
    <div className="mb-5 flex items-start gap-3">
      {Icon && (
        <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${tint}`}>
          <Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden />
        </span>
      )}
      <div>
        <h2 className="text-2xl font-bold text-ink-900">{title}</h2>
        {subtitle && <p className="mt-0.5 text-ink-500">{subtitle}</p>}
      </div>
    </div>
  );
}

export default async function TaskPage({ params }) {
  const { slug } = await params;
  const [task, history] = await Promise.all([getJSON(`/tasks/${slug}/`), getJSON(`/tasks/${slug}/history/`)]);
  if (!task) notFound();

  const lang = task.language === 'en' ? undefined : task.language;
  const periods = leaderPeriods(history || []);
  const hasRanking = task.ranking.length > 0;

  return (
    <main>
      <PageHero
        size="max-w-5xl"
        eyebrow={
          <nav className="flex items-center gap-1">
            <Link href="/tasks" className="hover:text-coral-600">Tasks</Link>
            <ChevronRightIcon className="h-4 w-4" aria-hidden />
            <span className="text-ink-700">{task.name}</span>
          </nav>
        }
        title={
          <span className="flex items-center gap-4">
            <TaskIcon task={task} size="lg" />
            <span>Best AI to {asPhrase(task.name)}</span>
          </span>
        }
      >
        {task.description && <p className="mt-4 max-w-2xl text-xl text-ink-500">{task.description}</p>}
        <div className="mt-5 flex flex-wrap items-center gap-2 text-sm font-semibold">
          {task.category_name && <span className="rounded-full bg-white px-3.5 py-1.5 text-ink-700 ring-1 ring-cream-300">{task.category_name}</span>}
          <span className="rounded-full bg-mint-50 px-3.5 py-1.5 text-mint-700">{languageLabel(task.language)}</span>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 ${hasRanking ? 'bg-mint-50 text-mint-700' : 'bg-butter-50 text-butter-700'}`}>
            <span className={`h-2 w-2 rounded-full ${hasRanking ? 'bg-mint-500' : 'bg-butter-400'}`} />
            {hasRanking ? `Ranking updated ${formatDay(task.ranking_date)}` : 'Ranking coming soon'}
          </span>
        </div>
      </PageHero>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
        {hasRanking ? (
          <section>
            <SectionTitle icon={TrophyIcon} tint="bg-butter-50 text-butter-700" title="Current top picks" subtitle="Recent votes count more than old ones, so this changes as new models come out." />
            <Podium rows={task.ranking.slice(0, 3)} />

            {task.ranking.length > 3 && (
              <div className="mt-8 overflow-hidden rounded-3xl bg-cream-100">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="text-left text-sm text-ink-500">
                      <tr>
                        <th className="px-5 py-3.5 font-semibold">Rank</th>
                        <th className="px-5 py-3.5 font-semibold">AI</th>
                        <th className="px-5 py-3.5 font-semibold w-52">Wins</th>
                        <th className="px-5 py-3.5 font-semibold text-right">Votes (30 days)</th>
                        <th className="px-5 py-3.5 font-semibold text-right" title="A short chat: about 375 English words in and 375 out">Cost / 1,000 chats</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cream-200">
                      {task.ranking.map((row) => (
                        <tr key={row.model.id} className="transition-colors hover:bg-cream-200/50">
                          <td className="px-5 py-3.5"><RankBadge rank={row.rank} /></td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <ModelAvatar model={row.model} size="sm" />
                              <div className="flex items-center gap-2 flex-wrap">
                                <ModelName model={row.model} />
                                <ModelBadges model={row.model} />
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5"><WinBar rate={row.win_rate} /></td>
                          <td className="px-5 py-3.5 text-right tabular-nums text-ink-700">{row.recent_votes}</td>
                          <td className="px-5 py-3.5 text-right"><ChatCost model={row.model} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        ) : (
          <section className="overflow-hidden rounded-[2rem] bg-cream-100 p-8 sm:p-10">
            <div className="grid items-center gap-10 md:grid-cols-2">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-butter-50 px-3.5 py-1.5 text-sm font-semibold text-butter-700">
                  <span className="h-2 w-2 rounded-full bg-butter-400" /> Voting opens soon
                </span>
                <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink-900">The podium is still empty</h2>
                <p className="mt-3 text-lg leading-relaxed text-ink-500">
                  Rankings come from blind side-by-side votes: two AIs answer the same prompt, and people pick the better answer
                  without knowing which AI wrote it. Once enough people have voted, the winners show up here.
                </p>
                <Link href="/auth/register" className="mt-6 inline-flex rounded-full bg-coral-500 px-6 py-3 font-semibold text-white transition hover:bg-coral-600">
                  Join free to be an early voter
                </Link>
              </div>
              <div aria-hidden className="flex items-end justify-center gap-3">
                {[[2, 'h-24 bg-cream-200'], [1, 'h-36 bg-butter-100'], [3, 'h-16 bg-coral-100']].map(([rank, block]) => (
                  <div key={rank} className="flex w-24 flex-col items-center">
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-dashed border-cream-300 text-2xl font-bold text-ink-400">
                      ?
                    </div>
                    <div className={`flex w-full items-start justify-center rounded-t-3xl pt-4 ${block}`}>
                      <RankBadge rank={rank} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {task.new_challengers.length > 0 && (
          <section>
            <SectionTitle icon={BeakerIcon} tint="bg-lilac-50 text-lilac-700" title="New challengers" subtitle="Being tested. They get ranked once enough people have voted." />
            <div className="grid gap-4 sm:grid-cols-2">
              {task.new_challengers.map((row) => (
                <div key={row.model.id} className="flex items-center justify-between gap-4 rounded-3xl bg-lilac-50 p-5">
                  <div className="flex min-w-0 items-center gap-3">
                    <ModelAvatar model={row.model} />
                    <div className="flex items-center gap-2 flex-wrap">
                      <ModelName model={row.model} />
                      <ModelBadges model={row.model} />
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-white px-3 py-1 text-sm font-semibold text-lilac-700">
                    {row.recent_votes} votes so far
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {periods.length > 1 && (
          <section>
            <SectionTitle icon={ClockIcon} tint="bg-mint-50 text-mint-700" title="Who has been #1" subtitle="The lead changes hands as new models come out." />
            <ol className="rounded-3xl bg-cream-100 p-6">
              {periods.map((p, i) => (
                <li key={`${p.model_id}-${p.from}`} className="relative flex gap-4 pb-6 last:pb-0">
                  {i < periods.length - 1 && <span aria-hidden className="absolute left-[11px] top-7 bottom-0 w-0.5 bg-cream-200" />}
                  <span className={`relative mt-1 h-6 w-6 shrink-0 rounded-full border-4 border-cream-100 ring-2 ${i === 0 ? 'bg-butter-400 ring-butter-400' : 'bg-cream-300 ring-cream-300'}`} />
                  <div className="flex flex-1 flex-wrap items-baseline justify-between gap-2">
                    <span className="font-bold text-ink-900">
                      {p.model_name}
                      {i === 0 && <span className="ml-2 rounded-full bg-butter-50 px-2.5 py-0.5 text-xs font-semibold text-butter-700">Current #1</span>}
                    </span>
                    <span className="text-ink-500">
                      {formatDay(p.from)}{p.to !== p.from ? ` – ${formatDay(p.to)}` : ''}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {task.prompts.length > 0 && (
          <section>
            <SectionTitle
              icon={ChatBubbleBottomCenterTextIcon}
              title="How we test this"
              subtitle="Every AI, including each new release, answers these same prompts."
            />
            <div className="space-y-4 rounded-3xl bg-cream-100 p-5 sm:p-6">
              {task.prompts.map((p, i) => (
                <div key={p.id} className="flex justify-end">
                  <div lang={lang} className="max-w-[85%] whitespace-pre-line rounded-3xl rounded-br-md bg-white px-5 py-3.5 text-[16px] leading-relaxed text-ink-900">
                    <div className="mb-1 text-xs font-bold uppercase tracking-wide text-coral-600">Test prompt {i + 1}</div>
                    {p.prompt}
                  </div>
                </div>
              ))}
              <div className="flex">
                <div className="flex items-center gap-2.5 rounded-3xl rounded-bl-md bg-cream-200 px-5 py-3.5 text-ink-500">
                  <span className="flex gap-1" aria-hidden>
                    <span className="h-2 w-2 rounded-full bg-ink-400 animate-bounce" />
                    <span className="h-2 w-2 rounded-full bg-ink-400 animate-bounce [animation-delay:150ms]" />
                    <span className="h-2 w-2 rounded-full bg-ink-400 animate-bounce [animation-delay:300ms]" />
                  </span>
                  Two AIs answer · names hidden until you vote
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
