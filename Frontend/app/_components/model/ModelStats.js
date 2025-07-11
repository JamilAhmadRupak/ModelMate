import Card from '../ui/Card';
import Badge from '../ui/Badge';

export default function ModelStats({ model }) {
  const stats = [
    {
      label: 'Total Views',
      value: model.views || 0,
      icon: '👁️'
    },
    {
      label: 'Reviews',
      value: model.review_count || 0,
      icon: '⭐'
    },
    {
      label: 'Discussions',
      value: model.discussion_count || 0,
      icon: '💬'
    },
    {
      label: 'Average Rating',
      value: model.average_rating?.toFixed(1) || 'N/A',
      icon: '📊'
    }
  ];

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4">Model Statistics</h3>
      <div className="space-y-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{stat.icon}</span>
              <span className="text-sm text-gray-600">{stat.label}</span>
            </div>
            <Badge variant="secondary" size="sm">
              {stat.value}
            </Badge>
          </div>
        ))}
      </div>
      
      {model.created_at && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Added {new Date(model.created_at).toLocaleDateString()}
          </p>
        </div>
      )}
    </Card>
  );
}
