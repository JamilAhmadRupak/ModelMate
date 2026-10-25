import Link from 'next/link';
import { languageLabel } from '@/lib/guide';

export default function TaskCard({ task }) {
  return (
    <Link
      href={`/tasks/${task.slug}`}
      className="group block h-full rounded-xl border border-gray-200 bg-white p-5 hover:border-blue-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-gray-900 group-hover:text-blue-700">{task.name}</h3>
        {task.language !== 'en' && (
          <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
            {languageLabel(task.language)}
          </span>
        )}
      </div>
      {task.description && <p className="mt-2 text-sm text-gray-600 line-clamp-2">{task.description}</p>}
      <span className="mt-3 inline-block text-sm font-medium text-blue-600">See the best AI for this →</span>
    </Link>
  );
}
