'use client';
import Link from 'next/link';
import Badge from '../ui/Badge';
import Card from '../ui/Card';

export default function DiscussionCard({ discussion, showModel = true }) {
  // console.log('Rendering DiscussionCard for:', typeof(discussion));
  // console.log(discussion.id);
  return (
    <Card hover className="h-full">
      <Link 
              href={`/discussions/${discussion.id}`}
              className="hover:text-blue-600"
      >
      <div className="px-2 py-1 flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 line-clamp-2">
            
            
            {discussion.title}
          </h3>
          {showModel && discussion.model && (
            <Link 
              href={`/models/${discussion.model.id}`}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {discussion.model.name}
            </Link>
          )}
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span>{discussion.likes || 0} likes</span>
          <span>{discussion.comment_count || 0} replies</span>
        </div>
      </div>

      <p className="text-gray-700 text-sm mb-4 line-clamp-3">
        {discussion.content}
      </p>

      <div className="px-2 py-1 flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-2 ">
          <span>By {discussion.user.username}</span>
          {discussion.views > 0 && (
            <Badge variant="info" size="sm">
              {discussion.views} views
            </Badge>
          )}
        </div>
        <span>{new Date(discussion.created_at).toLocaleDateString()}</span>
      </div>
      </Link>
    </Card>
  );
}
