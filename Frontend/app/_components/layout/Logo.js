import Link from 'next/link';

export function LogoMark({ className = 'h-9 w-9' }) {
  return (
    <span className={`relative inline-flex items-center justify-center rounded-2xl bg-coral-500 text-white ${className}`}>
      {/* Two chat bubbles side by side: a head-to-head comparison */}
      <svg viewBox="0 0 24 24" className="h-[58%] w-[58%]" fill="currentColor" aria-hidden>
        <path d="M3 6.5A3.5 3.5 0 0 1 6.5 3h4A3.5 3.5 0 0 1 14 6.5v2A3.5 3.5 0 0 1 10.5 12H8l-3 2.5V11.6A3.5 3.5 0 0 1 3 8.5v-2Z" />
        <path opacity=".75" d="M21 13.5a3.5 3.5 0 0 0-3.5-3.5H16v.5A5.5 5.5 0 0 1 10.5 16H10v.5a3.5 3.5 0 0 0 3.5 3.5H16l3 2.5v-2.9a3.5 3.5 0 0 0 2-3.1v-3Z" />
      </svg>
    </span>
  );
}

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <LogoMark />
      <span className="text-xl font-bold tracking-tight text-ink-900">
        Model<span className="text-coral-500">Mate</span>
      </span>
    </Link>
  );
}
