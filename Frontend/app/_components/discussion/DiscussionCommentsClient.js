'use client';
import { useState } from 'react';
import CommentThread from '@/app/_components/discussion/CommentThread';

export default function DiscussionCommentsClient({ initialComments, discussionId }) {
  const [comments, setComments] = useState(initialComments);

  async function handleAddComment(content, parentId) {
    // Replace with your actual API endpoint and logic
    const res = await fetch(
      `/api/discussions/${discussionId}/comments/`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, parent: parentId }),
      }
    );
    if (!res.ok) throw new Error('Failed to add comment');
    const newComment = await res.json();
    // Update comments state (you may want to refetch or insert more robustly for nested replies)
    setComments(prev => [newComment, ...prev]);
  }

  return (
    <CommentThread
      comments={comments}
      discussionId={discussionId}
      onAddComment={handleAddComment}
    />
  );
}
