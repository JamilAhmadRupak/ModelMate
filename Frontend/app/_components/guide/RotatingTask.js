'use client';
import { useEffect, useState } from 'react';

// Types out each phrase, pauses, deletes it, and moves on to the next.
export default function RotatingTask({ phrases }) {
  const [index, setIndex] = useState(0);
  const [length, setLength] = useState(phrases[0]?.length || 0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (phrases.length < 2) return;
    const phrase = phrases[index];
    let delay = deleting ? 28 : 55;
    if (!deleting && length === phrase.length) delay = 2200;
    if (deleting && length === 0) delay = 350;

    const timer = setTimeout(() => {
      if (!deleting && length === phrase.length) setDeleting(true);
      else if (deleting && length === 0) {
        setDeleting(false);
        setIndex((i) => (i + 1) % phrases.length);
      } else setLength((n) => n + (deleting ? -1 : 1));
    }, delay);
    return () => clearTimeout(timer);
  }, [phrases, index, length, deleting]);

  const phrase = phrases[index] || '';
  return (
    <span>
      <span className="sr-only">{phrases[0]}</span>
      <span aria-hidden className="text-coral-500">{phrase.slice(0, length)}</span>
      <span aria-hidden className="ml-1 inline-block w-[4px] h-[0.85em] -mb-[0.06em] rounded-full bg-coral-500 animate-caret" />
    </span>
  );
}
