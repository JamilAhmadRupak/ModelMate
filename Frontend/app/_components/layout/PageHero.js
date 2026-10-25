// Page title band shared by the inner guide pages.
export default function PageHero({ eyebrow, title, children, size = 'max-w-7xl' }) {
  return (
    <section className="relative overflow-hidden border-b border-cream-300/70">
      {/* Flat decorative shapes, kept to the right so they never sit under text */}
      <div aria-hidden className="absolute -right-16 -top-20 hidden h-64 w-64 rounded-full bg-coral-50 md:block" />
      <div aria-hidden className="absolute right-40 top-24 hidden h-20 w-20 rounded-full bg-mint-50 md:block" />
      <div className={`relative ${size} mx-auto px-4 pb-10 pt-10 sm:px-6 lg:px-8`}>
        {eyebrow && <div className="mb-3 text-sm font-medium text-ink-500">{eyebrow}</div>}
        <h1 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">{title}</h1>
        {children}
      </div>
    </section>
  );
}
