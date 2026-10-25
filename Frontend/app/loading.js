import { LogoMark } from './_components/layout/Logo';

export default function Loading() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
      <LogoMark className="h-12 w-12 animate-bounce" />
      <p className="font-medium text-ink-500">Finding the best AI…</p>
    </div>
  );
}
