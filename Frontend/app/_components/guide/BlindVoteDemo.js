'use client';
import { useState } from 'react';
import Link from 'next/link';
import { CheckCircleIcon, LockClosedIcon, ArrowPathIcon } from '@heroicons/react/20/solid';

// A hands-on illustration of a blind vote. Sample answers only; no real models or votes are involved.
const PROMPT = 'Translate to Bangla: "Could you tell me where the station is?"';
const ANSWERS = [
  { id: 'A', text: 'স্টেশনটা কোথায়, একটু বলবেন?' },
  { id: 'B', text: 'আপনি কি আমাকে বলতে পারেন স্টেশন কোথায় আছে?' },
];

export default function BlindVoteDemo({ taskHref }) {
  const [picked, setPicked] = useState(null);

  return (
    <div className="relative rounded-[2rem] bg-cream-100 p-6 sm:p-7">
      {/* Little sticker in the corner */}
      <span className="absolute -right-3 -top-4 rotate-6 rounded-full bg-butter-400 px-3.5 py-1.5 text-sm font-bold text-ink-900 animate-wiggle">
        Try it!
      </span>

      <div className="flex items-center justify-between">
        <span className="text-sm font-bold uppercase tracking-wide text-mint-700">Blind vote</span>
        {picked && (
          <button onClick={() => setPicked(null)} className="inline-flex items-center gap-1 text-sm font-semibold text-ink-500 hover:text-ink-900">
            <ArrowPathIcon className="h-4 w-4" /> Try again
          </button>
        )}
      </div>

      <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-[15px] text-ink-700">
        <span className="font-semibold text-ink-900">Prompt: </span>
        {PROMPT}
      </div>

      <p className="mt-5 font-semibold text-ink-900">{picked ? 'Thanks! Your vote is in.' : 'Which answer is better? Tap one.'}</p>

      <div className="mt-3 grid gap-3">
        {ANSWERS.map((answer) => {
          const chosen = picked === answer.id;
          const faded = picked && !chosen;
          return (
            <button
              key={answer.id}
              onClick={() => setPicked(answer.id)}
              disabled={Boolean(picked)}
              className={`rounded-2xl border-2 p-4 text-left transition duration-200 ${
                chosen
                  ? 'border-coral-500 bg-coral-50'
                  : faded
                    ? 'border-transparent bg-white opacity-50'
                    : 'cursor-pointer border-transparent bg-white hover:-translate-y-0.5 hover:border-coral-200'
              }`}
            >
              <div className="flex items-center justify-between text-sm font-semibold text-ink-500">
                <span className="inline-flex items-center gap-1.5">
                  {picked ? `Answer ${answer.id}` : <><LockClosedIcon className="h-3.5 w-3.5" /> Answer {answer.id} · AI hidden</>}
                </span>
                {chosen && <CheckCircleIcon className="h-5 w-5 text-coral-500" />}
              </div>
              <p lang="bn" className="mt-1.5 text-lg text-ink-900">{answer.text}</p>
            </button>
          );
        })}
      </div>

      <div className={`grid transition-all duration-500 ${picked ? 'mt-4 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`} aria-live="polite">
        <div className="overflow-hidden">
          <div className="rounded-2xl bg-white p-4 text-[15px] leading-relaxed text-ink-700">
            <span className="font-bold text-mint-700">That&apos;s how every ranking is made. </span>
            Real people pick the better answer without knowing which AI wrote it.{' '}
            {picked === 'A' ? 'Answer A sounds like a person talking.' : 'Answer B is correct, but word-for-word.'} Natural Bangla
            is exactly what the translation ranking rewards.
            {taskHref && (
              <Link href={taskHref} className="mt-2 block font-semibold text-mint-700 hover:underline">
                See the Bangla translation ranking →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
