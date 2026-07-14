import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { api } from '../lib/api';

export default function ForumNewPost() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const post = await api.createForumPost({ title: title.trim(), content: content.trim() }) as any;
      navigate(`/forum/${post.id}`);
    } catch (e: any) {
      setError(e.message || '发布失败');
    }
    setSubmitting(false);
  };

  return (
    <div>
      <button
        onClick={() => navigate('/forum')}
        className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回论坛
      </button>

      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-6">发布新帖</h1>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">标题</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="输入帖子标题..."
              maxLength={200}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">内容</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="写下你想分享的内容..."
              rows={10}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y"
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={!title.trim() || !content.trim() || submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
              {submitting ? '发布中...' : '发布帖子'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
