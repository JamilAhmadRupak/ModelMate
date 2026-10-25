import Link from 'next/link';
import {
  MagnifyingGlassIcon,
  EyeSlashIcon,
  ClockIcon,
  BoltIcon,
  SparklesIcon,
  TrophyIcon,
  TagIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import TaskCard from './_components/guide/TaskCard';
import TaskIcon from './_components/guide/TaskIcon';
import ModelRow from './_components/guide/ModelRow';
import RotatingTask from './_components/guide/RotatingTask';
import BlindVoteDemo from './_components/guide/BlindVoteDemo';
import { getJSON, formatDay, formatUSD, asPhrase } from '@/lib/guide';

export const metadata = {
  title: 'ModelMate - Which AI should you use?',
  description:
    'Pick what you want to do and see which AI does it best right now, ranked by blind votes, with prices and free options. Includes Bangla tasks.',
};

function PriceMove({ change }) {
  const before = Number(change.old_input_price_per_mtok) + Number(change.old_output_price_per_mtok);
  const after = Number(change.new_input_price_per_mtok) + Number(change.new_output_price_per_mtok);
  const cheaper = after < before;
  const Icon = cheaper ? ArrowTrendingDownIcon : ArrowTrendingUpIcon;
  return (
    <li className="flex items-center justify-between gap-4 px-5 py-3.5">
      <div className="min-w-0">
        <div className="font-bold text-ink-900">{change.model.name}</div>
        <div className="text-sm text-ink-500">{change.model.creator}</div>
      </div>
      <span
        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${
          cheaper ? 'bg-mint-50 text-mint-700' : 'bg-coral-50 text-coral-700'
        }`}
        title="Cost per 1,000 chats"
      >
        <Icon className="h-4 w-4" aria-hidden />
        {formatUSD(before * 0.5)} → {formatUSD(after * 0.5)}
      </span>
    </li>
  );
}

function FeedCard({ icon: Icon, tint, title, action, children }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-3xl bg-cream-100">
      <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-5">
        <h3 className="flex items-center gap-3 text-lg font-bold text-ink-900">
          <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white ${tint}`}>
            <Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden />
          </span>
          {title}
        </h3>
        {action}
      </div>
      <div className="flex-1 border-t border-cream-200/80">{children}</div>
    </div>
  );
}

function EmptyFeed({ children }) {
  return <p className="flex h-full min-h-24 items-center justify-center px-6 py-8 text-center text-ink-500">{children}</p>;
}

function SectionHeading({ kicker, title, kickerClass = 'text-coral-600', children }) {
  return (
    <div>
      <p className={`font-bold ${kickerClass}`}>{kicker}</p>
      <h2 className="mt-1 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">{title}</h2>
      {children}
    </div>
  );
}

const STEPS = [
  {
    icon: EyeSlashIcon,
    soft: 'bg-coral-50',
    tint: 'text-coral-600',
    title: 'Blind tests',
    text: 'Two AIs answer the same prompt. You pick the better answer without knowing which AI wrote it, so brand names can’t sway you.',
  },
  {
    icon: ClockIcon,
    soft: 'bg-mint-50',
    tint: 'text-mint-700',
    title: 'Fresh votes count more',
    text: 'A vote loses half its weight every 30 days, so the ranking follows today’s models, not last year’s.',
  },
  {
    icon: BoltIcon,
    soft: 'bg-butter-50',
    tint: 'text-butter-700',
    title: 'New models tested fast',
    text: 'New releases answer the same fixed prompts right away and appear as challengers until enough people have voted.',
  },
];

export default async function HomePage() {
  const [tasks, changes] = await Promise.all([
    getJSON('/tasks/?featured=true').catch(() => []),
    getJSON('/changes/?days=7').catch(() => null),
  ]);
  const featured = tasks || [];
  const english = featured.filter((t) => t.language === 'en');
  const bangla = featured.filter((t) => t.language === 'bn');

  const phrases = featured.length ? featured.map((t) => asPhrase(t.name)) : ['write an email'];
  const translateTask = featured.find((t) => t.slug === 'translate-english-to-bangla');


  return (
    <main>
      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="absolute -right-24 top-10 hidden h-[30rem] w-[30rem] rounded-full bg-coral-50 lg:block" />

        <div className="relative max-w-7xl mx-auto grid items-center gap-14 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-20 lg:px-8 lg:pb-16 lg:pt-20">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-mint-50 px-4 py-1.5 text-sm font-semibold text-mint-700">
              <span className="h-2 w-2 rounded-full bg-mint-500" />
              Updated as new models come out
            </span>

            <h1 className="mt-6 text-[2.6rem] font-bold leading-[1.1] tracking-tight text-ink-900 sm:text-6xl">
              Which AI should you use to{' '}
              <span className="block min-h-[2.2em] sm:min-h-[1.1em]">
                <RotatingTask phrases={phrases} />
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-xl leading-relaxed text-ink-500">
              Tell us what you want to do. We&apos;ll show you which AI does it best right now, picked by real people in blind
              tests, with prices and free options.
            </p>

            <form action="/tasks" className="mt-8 max-w-xl">
              <div className="flex items-center rounded-full border-2 border-cream-200 bg-white p-1.5 transition focus-within:border-coral-200">
                <MagnifyingGlassIcon className="ml-3 h-6 w-6 shrink-0 text-ink-400" aria-hidden />
                <input
                  name="search"
                  aria-label="What do you want to do?"
                  placeholder="What do you want to do?"
                  className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-lg text-ink-900 placeholder:text-ink-400 focus:outline-none"
                />
                <button className="rounded-full bg-coral-500 px-6 py-3 font-semibold text-white transition hover:bg-coral-600">
                  Find my AI
                </button>
              </div>
            </form>

            {featured.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <span className="mr-1 font-medium text-ink-500">Popular:</span>
                {featured.slice(0, 4).map((t) => (
                  <Link
                    key={t.id}
                    href={`/tasks/${t.slug}`}
                    className="inline-flex items-center gap-2 rounded-full border border-cream-300 bg-white py-1 pl-1 pr-3.5 text-[15px] font-medium text-ink-700 transition hover:border-coral-200 hover:text-coral-700"
                  >
                    <TaskIcon task={t} size="sm" />
                    {t.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="relative animate-fade-up [animation-delay:150ms]">
            <BlindVoteDemo taskHref={translateTask ? `/tasks/${translateTask.slug}` : null} />
          </div>
        </div>
      </section>


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-6 space-y-24">
        {/* ── Tasks ────────────────────────────────────────── */}
        {english.length > 0 && (
          <section>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <SectionHeading kicker="Start here" title="Popular tasks" />
              <Link href="/tasks?language=en" className="rounded-full bg-coral-50 px-5 py-2.5 font-semibold text-coral-700 transition hover:bg-coral-100">
                View all →
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {english.map((task) => <TaskCard key={task.id} task={task} />)}
            </div>
          </section>
        )}

        {bangla.length > 0 && (
          <section>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <SectionHeading kicker="বাংলায় AI" kickerClass="text-mint-700" title="Tasks in Bangla">
                <p className="mt-2 max-w-xl text-lg text-ink-500">Most rankings only test English. We test how well each AI reads and writes Bangla.</p>
              </SectionHeading>
              <Link href="/tasks?language=bn" className="rounded-full bg-mint-50 px-5 py-2.5 font-semibold text-mint-700 transition hover:bg-mint-100">
                View all →
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {bangla.map((task) => <TaskCard key={task.id} task={task} />)}
            </div>
          </section>
        )}

        {/* ── What changed ─────────────────────────────────── */}
        {changes && (
          <section>
            <SectionHeading kicker="AI moves fast" title="What changed this week">
              <p className="mt-2 text-lg text-ink-500">Everything new since {formatDay(Date.now() - changes.days * 86400000)}.</p>
            </SectionHeading>

            <div className="mt-8 grid gap-5 lg:grid-cols-5">
              <div className="lg:col-span-3">
                <FeedCard
                  icon={SparklesIcon}
                  tint="text-butter-700"
                  title="New models"
                  action={<Link href="/models" className="font-semibold text-coral-600 hover:text-coral-700">All models →</Link>}
                >
                  {changes.new_models.length ? (
                    <ul className="divide-y divide-cream-200">
                      {changes.new_models.slice(0, 6).map((m) => <ModelRow key={m.id} model={m} />)}
                    </ul>
                  ) : (
                    <EmptyFeed>No new models this week. Quiet weeks are rare, so check back soon.</EmptyFeed>
                  )}
                </FeedCard>
              </div>

              <div className="grid content-start gap-5 lg:col-span-2">
                <FeedCard icon={TrophyIcon} tint="text-coral-600" title="New #1s">
                  {changes.leader_changes.length ? (
                    <ul className="divide-y divide-cream-200">
                      {changes.leader_changes.map((c) => (
                        <li key={`${c.task.slug}-${c.date}`} className="px-5 py-3.5">
                          <Link href={`/tasks/${c.task.slug}`} className="font-bold text-ink-900 hover:text-coral-600">
                            {c.task.name}
                          </Link>
                          <div className="text-ink-500">
                            <span className="font-semibold text-ink-700">{c.new_leader.name}</span> took #1
                            {c.previous_leader ? ` from ${c.previous_leader.name}` : ''} · {formatDay(c.date)}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <EmptyFeed>No task changed leader this week.</EmptyFeed>
                  )}
                </FeedCard>

                <FeedCard icon={TagIcon} tint="text-mint-700" title="Price changes">
                  {changes.price_changes.length ? (
                    <ul className="divide-y divide-cream-200">
                      {changes.price_changes.map((c) => <PriceMove key={`${c.model.id}-${c.changed_at}`} change={c} />)}
                    </ul>
                  ) : (
                    <EmptyFeed>No price changes this week.</EmptyFeed>
                  )}
                </FeedCard>
              </div>
            </div>
          </section>
        )}

        {/* ── How it works ─────────────────────────────────── */}
        <section>
          <div className="mx-auto max-w-2xl text-center">
            <SectionHeading kicker="Why you can trust it" title="How the rankings work" />
          </div>
          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step.title} className={`rounded-3xl p-7 ${step.soft}`}>
                <div className="flex items-center justify-between">
                  <span className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white ${step.tint}`}>
                    <step.icon className="h-7 w-7" strokeWidth={1.8} aria-hidden />
                  </span>
                  <span className="text-5xl font-bold text-ink-900/10">{i + 1}</span>
                </div>
                <h3 className="mt-5 text-xl font-bold text-ink-900">{step.title}</h3>
                <p className="mt-2 leading-relaxed text-ink-500">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ── CTA ──────────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-[2.5rem] bg-coral-500 px-6 py-14 text-center sm:px-12 sm:py-16">
          <div aria-hidden className="absolute -left-12 -top-12 h-48 w-48 rounded-full bg-coral-600/60" />
          <div aria-hidden className="absolute -bottom-16 -right-10 h-56 w-56 rounded-full bg-butter-400/40" />
          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Your vote helps everyone pick better.</h2>
            <p className="mx-auto mt-3 max-w-xl text-lg text-coral-50">
              Join free to take part in blind votes as they open, and share which AI works best for you.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/auth/register" className="rounded-full bg-white px-7 py-3.5 font-bold text-coral-600 transition hover:bg-cream-100">
                Join free
              </Link>
              <Link href="/tasks" className="rounded-full border-2 border-white/60 px-7 py-3.5 font-bold text-white transition hover:bg-white/10">
                Browse all tasks
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
