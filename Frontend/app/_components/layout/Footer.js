import Link from 'next/link';
import Logo from './Logo';

const COLUMNS = [
  {
    title: 'Explore',
    links: [
      ['/tasks', 'All tasks'],
      ['/tasks?language=bn', 'বাংলা tasks'],
      ['/models', 'All models'],
      ['/models?free=true', 'Free AI models'],
    ],
  },
  {
    title: 'Community',
    links: [
      ['/discussions', 'Discussions'],
      ['/discussions/create', 'Start a discussion'],
      ['/auth/register', 'Join free'],
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-cream-200 bg-cream-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm leading-relaxed text-ink-500">
              Find the right AI for what you want to do, ranked by blind votes from real people and kept up to date as
              new models come out.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="font-bold text-ink-900">{col.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map(([href, label]) => (
                  <li key={href}>
                    <Link href={href} className="text-ink-500 transition hover:text-coral-600">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-cream-300 pt-6 text-sm text-ink-500 md:flex-row">
          <p>© {new Date().getFullYear()} ModelMate. Prices are API list prices and may change.</p>
          <p>Made with care for English &amp; বাংলা speakers.</p>
        </div>
      </div>
    </footer>
  );
}
