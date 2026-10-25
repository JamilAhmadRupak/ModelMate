import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/outline';
import TaskIcon, { taskVisual, taskQuestion } from './TaskIcon';
import { languageLabel } from '@/lib/guide';

export default function TaskCard({ task }) {
  const { soft } = taskVisual(task);
  return (
    <div className={`group flex h-full flex-col rounded-3xl p-6 transition duration-300 hover:-translate-y-1 ${soft}`}>
      <div className="flex items-start justify-between gap-3">
        <TaskIcon task={task} onTint />
        {task.language !== 'en' && (
          <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-mint-700">{languageLabel(task.language)}</span>
        )}
      </div>

      <p className="mt-5 text-sm font-semibold text-ink-500">{task.name}</p>
      <h3 className="mt-1 text-xl font-bold leading-snug text-ink-900">
        <Link href={`/tasks/${task.slug}`} className="hover:text-coral-600">{taskQuestion(task)}</Link>
      </h3>
      {task.description && <p className="mt-2 leading-relaxed text-ink-500 line-clamp-2">{task.description}</p>}

      <div className="mt-auto grid grid-cols-2 gap-2 pt-6">
        <Link
          href={`/tasks/${task.slug}`}
          className="inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-full bg-coral-500 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-coral-600"
        >
          Check here
          <ArrowRightIcon className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
        </Link>
        <Link
          href="/discussions/create"
          className="inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-full bg-white px-3 py-2.5 text-sm font-semibold text-ink-700 transition hover:text-coral-600"
        >
          <ChatBubbleLeftEllipsisIcon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />
          Your opinion
        </Link>
      </div>
    </div>
  );
}
