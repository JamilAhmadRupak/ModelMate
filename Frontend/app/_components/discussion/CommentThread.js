'use client';
import { useEffect, useState } from 'react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import io from 'socket.io-client';

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000');

export default function CommentThread({ comments, onAddComment, discussionId }) {
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentLikes, setCommentLikes] = useState({});

  useEffect(() => {
    socket.on('comment-like', ({ commentId, likes }) => {
      setCommentLikes(prev => ({ ...prev, [commentId]: likes }));
    });
    return () => {
      socket.off('comment-like');
    };
  }, []);

  const handleLike = (commentId) => {
    socket.emit('like-comment', { commentId });
  };

  const handleSubmit = async (e, parentId = null) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setIsSubmitting(true);
    try {
      await onAddComment(replyText, parentId);
      setReplyText('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderComment = (comment, depth = 0) => (
    <div key={comment.id} style={{ marginLeft: depth * 20, marginTop: 12 }}>
      <div>{comment.content}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
        <Button onClick={() => setReplyingTo(comment.id)} size="sm" variant="ghost">Reply</Button>
        <Button onClick={() => handleLike(comment.id)} size="sm" variant="ghost">👍 Like</Button>
        <span>{commentLikes[comment.id] ?? comment.likes ?? 0} likes</span>
      </div>
      {replyingTo === comment.id && (
        <form onSubmit={e => handleSubmit(e, comment.id)} style={{ marginTop: 8 }}>
          <textarea
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            placeholder="Write your reply..."
            rows={3}
            style={{ width: '100%', marginBottom: 8 }}
          />
          <div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Posting...' : 'Reply'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setReplyingTo(null)}
              style={{ marginLeft: 8 }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
      {comment.replies && comment.replies.length > 0 && (
        <div style={{ marginTop: 8 }}>
          {comment.replies.map(reply => renderComment(reply, depth + 1))}
        </div>
      )}
    </div>
  );

  return (
    <div>
      {comments && comments.length > 0 ? (
        comments.map(comment => renderComment(comment))
      ) : (
        <div>No comments yet.</div>
      )}
      {replyingTo === null && (
        <form onSubmit={e => handleSubmit(e, null)} style={{ marginTop: 16 }}>
          <textarea
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            placeholder="Write a comment..."
            rows={3}
            style={{ width: '100%', marginBottom: 8 }}
          />
          <div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Posting...' : 'Comment'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
