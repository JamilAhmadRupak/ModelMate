'use client';

import Card from '@/app/_components/ui/Card';
import { useEffect, useState } from 'react';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/leaderboard/`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch leaderboard');
        const data = await res.json();
        setLeaderboard(data.results || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Model Leaderboard</h1>
        <p className="text-gray-600 mb-4">
          Discover the top-rated AI models based on user reviews and ratings
        </p>
      </div>
      <Card>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading leaderboard...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : leaderboard.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No leaderboard data available.</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Rank</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Model</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Creator</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Category</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Rating</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Reviews</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((row, idx) => (
                  <tr key={row.id || idx} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-bold">{idx + 1}</td>
                    <td className="px-4 py-2">{row.name}</td>
                    <td className="px-4 py-2">{row.creator}</td>
                    <td className="px-4 py-2">{row.category}</td>
                    <td className="px-4 py-2">{row.rating}</td>
                    <td className="px-4 py-2">{row.reviews}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
} 