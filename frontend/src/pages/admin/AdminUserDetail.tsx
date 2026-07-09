import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, Dumbbell, Library, Calendar, Trash2, KeyRound } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import type { UserAdmin } from '../../types';

export default function AdminUserDetail() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<UserAdmin | null>(null);
  const [loading, setLoading] = useState(true);
  const [newPassword, setNewPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.adminUserDetail(id)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setPwdMsg('密码至少 6 位');
      return;
    }
    setPwdLoading(true);
    setPwdMsg('');
    try {
      await api.resetUserPassword(data!.id, newPassword);
      setNewPassword('');
      setPwdMsg('密码已更新');
    } catch (err: any) {
      setPwdMsg(err.message || '修改失败');
    } finally {
      setPwdLoading(false);
    }
  }
  async function handleDelete() {
    if (!data) return;
    if (!window.confirm(`确定要删除用户 "${data.username}" 吗？此操作不可撤销。`)) return;
    try {
      await api.deleteUser(data.id);
      navigate('/admin/users');
    } catch (err: any) {
      alert(err.message || '删除失败');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">用户不存在</p>
        <Link to="/admin/users" className="text-sm text-primary-600 dark:text-primary-400 hover:underline mt-2 inline-block">
          返回用户列表
        </Link>
      </div>
    );
  }

  const isSelf = data.id === currentUser?.id;

  return (
    <div className="space-y-6">
      <Link
        to="/admin/users"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回用户列表
      </Link>

      {/* User info card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xl font-bold">
            {data.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{data.username}</h2>
              {data.is_admin && (
                <span className="px-2 py-0.5 text-xs font-medium rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                  管理员
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{data.email}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {format(parseISO(data.created_at), 'yyyy年M月d日')} 注册
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-3">
            <Dumbbell className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.workout_count}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">训练次数</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="w-9 h-9 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center mb-3">
            <Library className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.exercise_count}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">动作数</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center mb-3">
            <Calendar className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {data.last_workout_date ? format(parseISO(data.last_workout_date), 'M月d日') : '—'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">最后训练</p>
        </div>
      </div>

      {/* Reset password */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-amber-500" />
          重置密码
        </h3>
        <form onSubmit={handleResetPassword} className="flex items-end gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">新密码</label>
            <input
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="至少 6 位新密码"
              minLength={6}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
            />
          </div>
          <button
            type="submit"
            disabled={pwdLoading || !newPassword}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-medium rounded-xl transition-colors text-sm whitespace-nowrap"
          >
            {pwdLoading ? '更新中...' : '修改密码'}
          </button>
        </form>
        {pwdMsg && (
          <p className={`text-xs mt-2 ${pwdMsg === '密码已更新' ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
            {pwdMsg}
          </p>
        )}
      </div>

      {/* Danger zone */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-red-200 dark:border-red-900 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-red-600 dark:text-red-400">危险操作</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              删除此用户及其所有训练数据，此操作不可撤销。
            </p>
          </div>
          <button
            onClick={handleDelete}
            disabled={isSelf}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white text-sm font-medium transition-colors"
            title={isSelf ? '不能删除自己' : undefined}
          >
            <Trash2 className="w-4 h-4" />
            删除用户
          </button>
        </div>
      </div>
    </div>
  );
}
