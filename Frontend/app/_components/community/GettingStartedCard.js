import Link from 'next/link';
import Card from '../ui/Card';

export default function GettingStartedCard() {
  return (
    <Card className="border-green-100 w-full">
      <div className="p-4 sm:p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">Getting Started <span className="text-green-600">🌱</span></h3>
        <ul className="list-disc list-inside text-gray-700 text-sm mb-2 space-y-1">
          <li>Sign up and create your profile</li>
          <li>Review and discuss AI models</li>
          <li>Start or join discussions</li>
          <li>Earn badges and climb the leaderboard</li>
        </ul>
        <Link href="/guidelines" className="text-green-700 hover:underline text-sm">Read Community Guidelines</Link>
      </div>
    </Card>
  );
} 