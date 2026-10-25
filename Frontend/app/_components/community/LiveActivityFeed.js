import Card from '../ui/Card';
import Link from 'next/link';

export default function LiveActivityFeed({ activity = [] }) {
  return (
    <Card className="bg-white border shadow-sm w-full">
      <div className="p-4 sm:p-6">
        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></div>
          Live Activity
        </h3>
        <div className="space-y-3 sm:space-y-4">
          {activity.map((a) => (
            <div key={a.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {a.user.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">{a.user}</span> {a.action} <span className="font-medium">{a.target}</span>
                </p>
                <p className="text-xs text-gray-500">{a.time}</p>
              </div>
              {a.rating && (
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className={`w-4 h-4 ${i < a.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <Link href="/activity" className="block text-center mt-4 text-blue-600 hover:text-blue-800 font-medium text-sm">
          View all activity
        </Link>
      </div>
    </Card>
  );
} 