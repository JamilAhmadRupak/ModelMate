import socketio
from Backend.modelmate.models import Discussion, Comment
from asgiref.sync import sync_to_async

sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')

@sio.event
def connect(sid, environ):
    print(f"Client connected: {sid}")

@sio.event
def disconnect(sid):
    print(f"Client disconnected: {sid}")

@sync_to_async
def increment_discussion_like(discussion_id):
    try:
        discussion = Discussion.objects.get(id=discussion_id)
        discussion.likes += 1
        discussion.save(update_fields=['likes'])
        return discussion.likes
    except Discussion.DoesNotExist:
        return None

@sync_to_async
def increment_comment_like(comment_id):
    try:
        comment = Comment.objects.get(id=comment_id)
        comment.likes += 1
        comment.save(update_fields=['likes'])
        return comment.likes
    except Comment.DoesNotExist:
        return None

@sio.event
async def like_discussion(sid, data):
    discussion_id = data.get('discussionId')
    if discussion_id is None:
        return
    likes = await increment_discussion_like(discussion_id)
    if likes is not None:
        await sio.emit('discussion-like', {'discussionId': discussion_id, 'likes': likes})

@sio.event
async def like_comment(sid, data):
    comment_id = data.get('commentId')
    if comment_id is None:
        return
    likes = await increment_comment_like(comment_id)
    if likes is not None:
        await sio.emit('comment-like', {'commentId': comment_id, 'likes': likes}) 