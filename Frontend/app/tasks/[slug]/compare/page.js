import Link from 'next/link';
import { notFound } from 'next/navigation';
import ArenaClient from '@/app/_components/guide/ArenaClient';
import { getJSON, asPhrase } from '@/lib/guide';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const task = await getJSON(`/tasks/${slug}/`);
  return {
    title: task ? `Compare AIs: ${task.name} - ModelMate` : 'Task not found - ModelMate',
    robots: { index: false },
  };
}

export default async function ComparePage({ params }) {
  const { slug } = await params;
  const task = await getJSON(`/tasks/${slug}/`);
  if (!task) notFound();

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/tasks" className="hover:text-gray-900">Tasks</Link> <span aria-hidden>/</span>{' '}
        <Link href={`/tasks/${task.slug}`} className="hover:text-gray-900">{task.name}</Link> <span aria-hidden>/</span> Compare
      </nav>
      <h1 className="text-3xl font-bold text-gray-900">Which answer is better?</h1>
      <p className="mt-2 mb-6 text-gray-600">
        Two AIs answer the same request to {asPhrase(task.name)}. Pick the better one. You will see which AI wrote
        which only after you vote, so brand names can&apos;t sway you.
      </p>
      <ArenaClient task={{ slug: task.slug, name: task.name, language: task.language }} />
    </main>
  );
}
