import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, MessageSquare, Trash2, ArrowLeft, Send, Clock } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import type { ForumPost } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function ForumPostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<ForumPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;
    api.getForumPost(id)
      .then(setPost)
      .catch(() => navigate('/forum'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleToggleLike = async () => {
    if (!id || !post) return;
    try {
      const result = await api.toggleForumLike(id) as { liked: boolean };
      setPost({
        ...post,
        liked_by_current_user: result.liked,
        like_count: result.liked ? post.like_count + 1 : post.like_count - 1,
      });
    } catch (e) {}
  };

  const handleComment = async () => {
    if (!id || !commentText.trim()) return;
    setSubmitting(true);
    try {
      const newComment = await api.addForumComment(id, { content: commentText.trim() });
      setPost({
        ...post!,
        comments: [...post!.comments, newComment as any],
        comment_count: post!.comment_count + 1,
      });
      setCommentText('');
    } catch (e) {}
    setSubmitting(false);
  };

  const handleDeletePost = async () => {
    if (!id || !confirm('确定要删除这个帖子吗？')) return;
    try {
      await api.deleteForumPost(id);
      navigate('/forum');
    } catch (e) {}
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('确定要删除这条评论吗？')) return;
    try {
      await api.deleteForumComment(commentId);
      setPost({
        ...post!,
        comments: post!.comments.filter(c => c.id !== commentId),
        comment_count: post!.comment_count - 1,
      });
    } catch (e) {}
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!post) return null;

  return (
    <div>
      <button
        onClick={() => navigate('/forum')}
        className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回论坛
      </button>

      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 mb-4">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{post.title}</h1>
          {user?.id === post.author.id && (
            <button
              onClick={handleDeletePost}
              className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 mb-4 text-sm">
          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 flex items-center justify-center text-sm font-bold">
            {post.author.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">{post.author.username}</span>
            <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: zhCN })}
            </span>
          </div>
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-6">
          {post.content}
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={handleToggleLike}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              post.liked_by_current_user
                ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
            }`}
          >
            <Heart className={`w-4 h-4 ${post.liked_by_current_user ? 'fill-current' : ''}`} />
            {post.like_count}
          </button>
          <button
            onClick={() => inputRef.current?.focus()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            {post.comment_count}
          </button>
        </div>
      </div>

      {/* Comments */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          评论 ({post.comment_count})
        </h2>

        {post.comments.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">暂无评论，来说两句吧</p>
        ) : (
          <div className="space-y-4 mb-6">
            {post.comments.map(comment => (
              <div key={comment.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 flex items-center justify-center text-sm font-bold shrink-0">
                  {comment.author.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{comment.author.username}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: zhCN })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{comment.content}</p>
                  {user?.id === comment.author.id && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="mt-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
                    >
                      删除
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <input
            ref={inputRef}
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleComment()}
            placeholder="写下你的评论..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={handleComment}
            disabled={!commentText.trim() || submitting}
            className="px-4 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
