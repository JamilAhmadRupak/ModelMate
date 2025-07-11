import Rating from '../ui/Rating';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Card from '../ui/Card';

export default function ModelCompare({ models, onRemoveModel }) {
  const compareFields = [
    { key: 'category.name', label: 'Category' },
    { key: 'version', label: 'Version' },
    { key: 'creator', label: 'Creator' },
    { key: 'license', label: 'License' },
    { key: 'size', label: 'Size' },
    { key: 'architecture', label: 'Architecture' },
    { key: 'release_date', label: 'Release Date', type: 'date' },
    { key: 'average_rating', label: 'Average Rating', type: 'rating' },
    { key: 'review_count', label: 'Reviews' },
    { key: 'discussion_count', label: 'Discussions' }
  ];

  const getValue = (model, key) => {
    if (key.includes('.')) {
      const keys = key.split('.');
      let value = model;
      for (const k of keys) {
        value = value?.[k];
      }
      return value;
    }
    return model[key];
  };

  const formatValue = (value, type) => {
    if (!value) return 'N/A';
    
    switch (type) {
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'rating':
        return (
          <div className="flex items-center space-x-1">
            <Rating value={value} readonly size="sm" />
            <span className="text-sm">{value.toFixed(1)}</span>
          </div>
        );
      default:
        return value;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {models.map((model) => (
          <Card key={model.id}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 mb-1">
                  {model.name}
                </h3>
                <Badge variant="primary" size="sm">
                  {model.category.name}
                </Badge>
              </div>
              <button
                onClick={() => onRemoveModel(model.id)}
                className="text-gray-400 hover:text-red-500 p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex items-center space-x-2 mb-4">
              <Rating value={model.average_rating || 0} readonly size="sm" />
              <span className="text-sm text-gray-600">
                {model.average_rating?.toFixed(1) || 'N/A'}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-4 line-clamp-3">
              {model.description}
            </p>
            
            <div className="space-y-2">
              <Button size="sm" className="w-full">
                <a href={`/models/${model.id}`}>View Details</a>
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="text-xl font-semibold mb-6">Detailed Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  Feature
                </th>
                {models.map((model) => (
                  <th key={model.id} className="text-left py-3 px-4 font-medium text-gray-900">
                    {model.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {compareFields.map((field) => (
                <tr key={field.key} className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-700">
                    {field.label}
                  </td>
                  {models.map((model) => (
                    <td key={model.id} className="py-3 px-4 text-gray-600">
                      {formatValue(getValue(model, field.key), field.type)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
