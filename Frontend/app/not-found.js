import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <p className="text-8xl font-bold tracking-tight text-coral-500 sm:text-9xl">404</p>
        <h1 className="mt-3 text-2xl font-bold text-ink-900">Even the best AI couldn&apos;t find this page</h1>
        <p className="mt-2 text-lg text-ink-500">It may have moved, or the link might be wrong.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="rounded-full bg-coral-500 px-6 py-3 font-semibold text-white hover:bg-coral-600">
            Back to home
          </Link>
          <Link href="/tasks" className="rounded-full border border-cream-300 bg-white px-6 py-3 font-semibold text-ink-700 hover:border-coral-200">
            Browse tasks
          </Link>
        </div>
      </div>
    </div>
  );
}
