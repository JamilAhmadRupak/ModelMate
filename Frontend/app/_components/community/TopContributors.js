import Card from '../ui/Card';

export default function TopContributors({ contributors = [] }) {
  return (
    <Card className="w-full md:w-80 border-blue-100 shadow-sm flex-shrink-0 mx-auto md:mx-0">
      <div className="p-4 sm:p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">Top Contributors <span className="text-xl">🔥</span></h3>
        <ul className="space-y-2">
          {contributors.map((contrib) => (
            <li key={contrib.username} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-base">{contrib.username.charAt(0)}</div>
              <span className="font-medium text-gray-800">{contrib.username}</span>
              <span className="ml-auto text-blue-600 font-semibold">{contrib.points} pts</span>
              <span className="ml-2 text-lg">{contrib.badge}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
} 