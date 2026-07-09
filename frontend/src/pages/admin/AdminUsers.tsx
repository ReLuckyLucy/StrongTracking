import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { Search, Users, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import type { UserAdmin } from '../../types';

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserAdmin[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const pageSize = 20;

  useEffect(() => {
    setLoading(true);
    api.listUsers({ page, page_size: pageSize, search: search || undefined })
      .then((data) => {
        setUsers(data.users);
        setTotal(data.total);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, search]);

  async function handleDelete(u: UserAdmin) {
    if (!window.confirm(`确定要删除用户 "${u.username}" (${u.email}) 吗？此操作不可撤销。`)) return;
    try {
      await api.deleteUser(u.id);
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
      setTotal((t) => t - 1);
    } catch (err: any) {
      alert(err.message || '删除失败');
    }
  }

  const totalPages = Math.ceil(total / pageSize);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">用户管理</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">共 {total} 个用户</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {/* Search */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="搜索用户名或邮箱..."
              className="w-full pl-10 pr-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {users.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">没有找到用户</p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">用户</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">邮箱</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">训练次数</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">注册时间</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {users.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  return (
                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <Link to={`/admin/users/${u.id}`} className="flex items-center gap-3 group">
                          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs font-bold">
                            {u.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">{u.username}</span>
                            {u.is_admin && (
                              <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-medium rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">管理员</span>
                            )}
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 hidden sm:table-cell">{u.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center hidden md:table-cell">{u.workout_count}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center hidden md:table-cell">{format(parseISO(u.created_at), 'yyyy-MM-dd')}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(u)}
                          disabled={isSelf}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title={isSelf ? '不能删除自己' : '删除用户'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          删除
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-800">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  第 {page} / {totalPages} 页
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    上一页
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= totalPages}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    下一页
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
