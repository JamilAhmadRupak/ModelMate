import Rating from '../ui/Rating';
import Card from '../ui/Card';

export default function ReviewStats({ stats }) {
  if (!stats) return null;

  const ratingBreakdown = [
    { rating: 5, count: stats.five_star || 0 },
    { rating: 4, count: stats.four_star || 0 },
    { rating: 3, count: stats.three_star || 0 },
    { rating: 2, count: stats.two_star || 0 },
    { rating: 1, count: stats.one_star || 0 }
  ];

  const total = ratingBreakdown.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4">Review Statistics</h3>
      
      <div className="flex items-center mb-6">
        <div className="text-center mr-8">
          <div className="text-4xl font-bold text-gray-900">
            {stats.average_rating?.toFixed(1) || '0.0'}
          </div>
          <Rating value={stats.average_rating || 0} readonly />
          <div className="text-sm text-gray-600 mt-1">
            {total} reviews
          </div>
        </div>
        
        <div className="flex-1">
          {ratingBreakdown.map((item) => {
            const percentage = total > 0 ? (item.count / total) * 100 : 0;
            
            return (
              <div key={item.rating} className="flex items-center mb-2">
                <span className="text-sm text-gray-600 w-12">
                  {item.rating} star
                </span>
                <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-8">
                  {item.count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {stats.breakdown && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Rating Breakdown</h4>
          {Object.entries(stats.breakdown).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-gray-600 capitalize">
                {key.replace('_', ' ')}
              </span>
              <Rating value={value} readonly size="sm" showValue />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
