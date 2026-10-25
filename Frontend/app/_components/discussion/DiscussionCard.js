'use client';
import Link from 'next/link';
import Badge from '../ui/Badge';
import Card from '../ui/Card';
import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000');

export default function DiscussionCard({ discussion, showModel = true }) {
  const [likes, setLikes] = useState(discussion.likes || 0);

  useEffect(() => {
    socket.on('discussion-like', ({ discussionId, likes }) => {
      if (discussionId === discussion.id) setLikes(likes);
    });
    return () => {
      socket.off('discussion-like');
    };
  }, [discussion.id]);

  const handleLike = (e) => {
    e.preventDefault();
    socket.emit('like-discussion', { discussionId: discussion.id });
  };

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
          <button onClick={handleLike} className="text-purple-600 hover:underline">
            👍 Like
          </button>
          <span>{likes} likes</span>
          <Link href={`/discussions/${discussion.id}#comments`} className="text-blue-600 hover:underline">
            �� Reply
          </Link>
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
