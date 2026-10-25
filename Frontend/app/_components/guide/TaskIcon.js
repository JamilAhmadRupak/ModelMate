import {
  ChatBubbleLeftRightIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  LanguageIcon,
  LightBulbIcon,
  PencilSquareIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { asPhrase } from '@/lib/guide';

// Picks an icon, soft colour and short topic from the task's wording, so new tasks get a sensible look without config.
const VISUALS = [
  { pattern: /translat/i, Icon: LanguageIcon, soft: 'bg-sky-soft-50', ink: 'text-sky-soft-700', topic: 'translation' },
  { pattern: /summar/i, Icon: DocumentTextIcon, soft: 'bg-butter-50', ink: 'text-butter-700', topic: 'summaries' },
  { pattern: /debug|code|python|program/i, Icon: CodeBracketIcon, soft: 'bg-lilac-50', ink: 'text-lilac-700', topic: 'coding' },
  { pattern: /letter/i, Icon: EnvelopeIcon, soft: 'bg-coral-50', ink: 'text-coral-600', topic: 'formal letters' },
  { pattern: /email/i, Icon: EnvelopeIcon, soft: 'bg-coral-50', ink: 'text-coral-600', topic: 'emails' },
  { pattern: /explain|concept|learn/i, Icon: LightBulbIcon, soft: 'bg-mint-50', ink: 'text-mint-700', topic: 'explaining things' },
  { pattern: /question|answer|chat/i, Icon: ChatBubbleLeftRightIcon, soft: 'bg-mint-50', ink: 'text-mint-700', topic: 'Q&A' },
  { pattern: /write|essay|story/i, Icon: PencilSquareIcon, soft: 'bg-coral-50', ink: 'text-coral-600', topic: 'writing' },
];
const FALLBACK = { Icon: SparklesIcon, soft: 'bg-coral-50', ink: 'text-coral-600', topic: null };

export function taskVisual(task) {
  const text = `${task.slug} ${task.name}`;
  return VISUALS.find((v) => v.pattern.test(text)) || FALLBACK;
}

// "Debug Python code" -> "Best AI for coding?", "Summarize Bangla text" -> "Best AI for Bangla summaries?"
export function taskQuestion(task) {
  const { topic } = taskVisual(task);
  if (!topic) return `Best AI to ${asPhrase(task.name)}?`;
  return `Best AI for ${task.language === 'bn' ? `Bangla ${topic}` : topic}?`;
}

// onTint: the icon sits on a card already filled with the task colour, so use a white tile.
export default function TaskIcon({ task, size = 'md', onTint = false }) {
  const { Icon, soft, ink } = taskVisual(task);
  const box = size === 'lg' ? 'h-16 w-16 rounded-3xl' : size === 'sm' ? 'h-7 w-7 rounded-lg' : 'h-12 w-12 rounded-2xl';
  const icon = size === 'lg' ? 'h-8 w-8' : size === 'sm' ? 'h-4 w-4' : 'h-6 w-6';
  return (
    <span className={`inline-flex shrink-0 items-center justify-center ${onTint ? 'bg-white' : soft} ${ink} ${box}`}>
      <Icon className={icon} strokeWidth={1.8} aria-hidden />
    </span>
  );
}
