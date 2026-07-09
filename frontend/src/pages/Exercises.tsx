import { useEffect, useState } from 'react';
import { Plus, Trash2, Search } from 'lucide-react';
import { api } from '../lib/api';
import type { Exercise } from '../types';

export default function Exercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const CATEGORIES = ['胸部', '背部', '腿部', '肩部', '手臂', '核心', '其他'];

  async function loadExercises() {
    try {
      const data = await api.listExercises();
      setExercises(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadExercises(); }, []);

  async function handleCreate() {
    if (!newName || !newCategory) return;
    try {
      await api.createExercise({ name: newName, category: newCategory, description: newDesc || undefined });
      setNewName('');
      setNewCategory('');
      setNewDesc('');
      setShowCreate(false);
      await loadExercises();
    } catch (err: any) {
      alert(err.message || '创建失败');
    }
  }

  async function handleDelete(exercise: Exercise) {
    if (exercise.user_id === null) {
      alert('不能删除系统预设动作');
      return;
    }
    if (!confirm(`确定删除「${exercise.name}」吗？`)) return;
    try {
      await api.deleteExercise(exercise.id);
      await loadExercises();
    } catch (err: any) {
      alert(err.message || '删除失败');
    }
  }

  const filtered = exercises.filter(
    (e) =>
      e.name.includes(search) ||
      e.category.includes(search)
  );

  // group by category
  const grouped = filtered.reduce<Record<string, Exercise[]>>((acc, e) => {
    if (!acc[e.category]) acc[e.category] = [];
    acc[e.category].push(e);
    return acc;
  }, {});

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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">动作库</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{exercises.length} 个动作</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-medium px-4 py-2.5 rounded-xl transition-colors text-sm shadow-sm"
        >
          <Plus className="w-4 h-4" />
          自定义动作
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">新建自定义动作</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">动作名称 *</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="例如：上斜哑铃卧推"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">类别 *</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              >
                <option value="">选择类别...</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">描述（可选）</label>
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="简短描述这个动作"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCreate(false)}
              className="flex-1 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              取消
            </button>
            <button
              onClick={handleCreate}
              disabled={!newName || !newCategory}
              className="flex-1 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white font-semibold rounded-xl text-sm"
            >
              创建
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索动作名称或类别..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
        />
      </div>

      {/* Exercises by category */}
      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          没有找到匹配的动作
        </div>
      ) : (
        Object.entries(grouped).map(([category, exs]) => (
          <div key={category}>
            <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
              {category}
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {exs.map((ex) => (
                <div
                  key={ex.id}
                  className="flex items-center justify-between bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 px-4 py-3 group"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{ex.name}</p>
                    {ex.description && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{ex.description}</p>
                    )}
                  </div>
                  {ex.user_id !== null && (
                    <button
                      onClick={() => handleDelete(ex)}
                      className="p-1.5 rounded-lg text-gray-300 dark:text-gray-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  {ex.user_id === null && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500">
                      系统
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
