import DiscussionCard from './DiscussionCard';
import LoadingSpinner from '../ui/LoadingSpinner';

export default function DiscussionList({ discussions, loading, error, showModel = true }) {
  console.log(discussions)
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner text="Loading discussions..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading discussions: {error}</p>
      </div>
    );
  }

  if (!discussions || discussions.length === 0) {
    return (
      <div className="text-center py-8">
        <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p className="text-gray-600">No discussions yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {discussions.map((discussion) => (
        <DiscussionCard key={discussion} discussion={discussion} showModel={showModel} />
      ))}
    </div>
  );
}
