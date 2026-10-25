const TINTS = [
  'bg-coral-50 text-coral-700',
  'bg-mint-50 text-mint-700',
  'bg-butter-50 text-butter-700',
  'bg-sky-soft-50 text-sky-soft-700',
  'bg-lilac-50 text-lilac-700',
];

// Same creator, same colour on every page.
function hash(text) {
  let h = 0;
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

export default function ModelAvatar({ model, size = 'md' }) {
  const key = model.creator || model.name || '?';
  const tint = TINTS[hash(key) % TINTS.length];
  const box = size === 'lg' ? 'h-14 w-14 text-xl rounded-2xl' : size === 'sm' ? 'h-8 w-8 text-xs rounded-xl' : 'h-11 w-11 text-base rounded-2xl';
  return (
    <span className={`inline-flex shrink-0 items-center justify-center font-bold uppercase ${tint} ${box}`} aria-hidden>
      {key.charAt(0)}
    </span>
  );
}
