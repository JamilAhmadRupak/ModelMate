import Link from 'next/link';
import Card from '../ui/Card';

export default function TrendingDiscussions({ discussions = [] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {discussions.map((d) => (
        <Card key={d.id} className="border hover:border-blue-300 group transition-all">
          <div className="p-4 sm:p-5 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-blue-700 flex items-center justify-center font-bold text-base">{d.author.charAt(0)}</div>
              <span className="text-sm text-gray-700 font-medium">{d.author}</span>
              <span className="ml-auto bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">{d.tag}</span>
            </div>
            <Link href={`/discussions/${d.id}`} className="block font-semibold text-gray-900 group-hover:text-blue-700 mb-1 line-clamp-2 text-base sm:text-lg">{d.title}</Link>
            <div className="flex items-center gap-3 text-xs text-gray-500 mt-auto pt-2">
              <span>⬆️ {d.upvotes}</span>
              <span>💬 {d.replies}</span>
              <span>{d.time}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
} 