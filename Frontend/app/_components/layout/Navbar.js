import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link href="/" className="text-xl font-bold text-purple-700">ModelMate</Link>
        <Link href="/discussions" className="text-gray-700 hover:text-purple-700 font-medium">Community</Link>
        <Link href="/categories" className="text-gray-700 hover:text-purple-700 font-medium">Categories</Link>
        <Link href="/leaderboard" className="text-gray-700 hover:text-purple-700 font-medium">Leaderboard</Link>
        <Link href="/models/compare" className="text-gray-700 hover:text-purple-700 font-medium">Compare</Link>
      </div>
      <div>
        {/* Add sign in/profile button here if needed */}
      </div>
    </nav>
  );
}
