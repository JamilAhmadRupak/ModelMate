import ModelAvatar from './ModelAvatar';
import { costPerThousandChats, formatUSD, isNew } from '@/lib/guide';

export function ModelBadges({ model }) {
  return (
    <>
      {model.has_free_tier && (
        <span className="rounded-full bg-mint-50 px-2.5 py-0.5 text-xs font-semibold text-mint-700">Free tier</span>
      )}
      {isNew(model) && (
        <span className="rounded-full bg-butter-100 px-2.5 py-0.5 text-xs font-semibold text-butter-700">New</span>
      )}
      {model.kind === 'app' && (
        <span className="rounded-full bg-lilac-50 px-2.5 py-0.5 text-xs font-semibold text-lilac-700">App</span>
      )}
    </>
  );
}

export function ModelName({ model }) {
  const name = <span className="font-bold text-ink-900">{model.name}</span>;
  return (
    <div className="min-w-0">
      {model.url ? (
        <a href={model.url} target="_blank" rel="noopener noreferrer" className="hover:text-coral-600 hover:underline">
          {name}
        </a>
      ) : (
        name
      )}
      <div className="text-sm text-ink-500">{model.creator}</div>
    </div>
  );
}

export function ChatCost({ model }) {
  const cost = costPerThousandChats(model);
  if (cost == null) return <span className="text-ink-400">—</span>;
  return (
    <span
      title={`$${model.input_price_per_mtok} in / $${model.output_price_per_mtok} out per 1M tokens`}
      className={cost === 0 ? 'font-bold text-mint-600' : 'font-bold text-ink-900'}
    >
      {cost === 0 ? 'Free' : formatUSD(cost)}
    </span>
  );
}

function formatContext(tokens) {
  if (!tokens) return null;
  return tokens >= 1000000 ? `${Number((tokens / 1000000).toFixed(1))}M` : `${Math.round(tokens / 1000)}K`;
}

export default function ModelRow({ model }) {
  const context = formatContext(model.context_length);
  return (
    <li className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-cream-200/50">
      <div className="flex min-w-0 items-center gap-3.5">
        <ModelAvatar model={model} />
        <div className="flex min-w-0 items-center gap-2 flex-wrap">
          <ModelName model={model} />
          <ModelBadges model={model} />
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-8 text-right">
        {context && (
          <div className="hidden sm:block" title="How much text it can read at once (tokens)">
            <div className="font-semibold text-ink-700">{context}</div>
            <div className="text-xs text-ink-400">memory</div>
          </div>
        )}
        <div className="min-w-[5.5rem]">
          <ChatCost model={model} />
          <div className="text-xs text-ink-400">per 1,000 chats</div>
        </div>
      </div>
    </li>
  );
}
