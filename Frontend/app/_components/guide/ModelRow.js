import { costPerThousandChats, formatUSD, isNew } from '@/lib/guide';

export function ModelBadges({ model }) {
  return (
    <>
      {model.has_free_tier && (
        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">Free tier</span>
      )}
      {isNew(model) && (
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">New</span>
      )}
      {model.kind === 'app' && (
        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">App</span>
      )}
    </>
  );
}

export function ModelName({ model }) {
  const name = <span className="font-medium text-gray-900">{model.name}</span>;
  return (
    <div className="min-w-0">
      {model.url ? (
        <a href={model.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
          {name}
        </a>
      ) : (
        name
      )}
      <div className="text-xs text-gray-500">{model.creator}</div>
    </div>
  );
}

export function ChatCost({ model }) {
  const cost = costPerThousandChats(model);
  if (cost == null) return <span className="text-gray-400">—</span>;
  return (
    <span title={`$${model.input_price_per_mtok} in / $${model.output_price_per_mtok} out per 1M tokens`}>
      {cost === 0 ? 'Free' : formatUSD(cost)}
    </span>
  );
}

export default function ModelRow({ model }) {
  return (
    <li className="flex items-center justify-between gap-4 py-3">
      <div className="flex min-w-0 items-center gap-2 flex-wrap">
        <ModelName model={model} />
        <ModelBadges model={model} />
      </div>
      <div className="shrink-0 text-right text-sm text-gray-700">
        <ChatCost model={model} />
        <div className="text-xs text-gray-500">per 1,000 chats</div>
      </div>
    </li>
  );
}
