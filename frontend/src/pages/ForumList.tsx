import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Heart, Plus, Clock } from 'lucide-react';
import { api } from '../lib/api';
import type { ForumPostListItem } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function ForumList() {
  const [posts, setPosts] = useState<ForumPostListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.listForumPosts({ page, per_page: 20 })
      .then((data: ForumPostListItem[]) => {
        setPosts(prev => page === 1 ? data : [...prev, ...data]);
        setHasMore(data.length === 20);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">论坛</h1>
        <Link
          to="/forum/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          发布帖子
        </Link>
      </div>

      {loading && posts.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20">
          <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">暂无帖子，快来发布第一条吧</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(post => (
            <Link
              key={post.id}
              to={`/forum/${post.id}`}
              className="block p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{post.title}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{post.content_preview}</p>
              <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
                <span className="font-medium text-primary-600 dark:text-primary-400">{post.author.username}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: zhCN })}</span>
                <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{post.comment_count}</span>
                <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{post.like_count}</span>
              </div>
            </Link>
          ))}
          {hasMore && (
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={loading}
              className="w-full py-3 text-sm text-primary-500 hover:text-primary-600 font-medium"
            >
              {loading ? '加载中...' : '加载更多'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
