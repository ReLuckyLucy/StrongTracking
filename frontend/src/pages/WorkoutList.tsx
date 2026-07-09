import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Plus, ChevronRight, Dumbbell, Calendar } from 'lucide-react';
import { api } from '../lib/api';
import type { WorkoutListItem } from '../types';

export default function WorkoutList() {
  const [workouts, setWorkouts] = useState<WorkoutListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    api.listWorkouts({ page })
      .then(setWorkouts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page]);

  // Group by month
  const grouped = workouts.reduce<Record<string, WorkoutListItem[]>>((acc, w) => {
    const month = format(parseISO(w.date), 'yyyy年M月');
    if (!acc[month]) acc[month] = [];
    acc[month].push(w);
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">训练记录</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{workouts.length} 次训练</p>
        </div>
        <Link
          to="/workouts/new"
          className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-medium px-4 py-2.5 rounded-xl transition-colors text-sm shadow-sm"
        >
          <Plus className="w-4 h-4" />
          新建训练
        </Link>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center">
          <Dumbbell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">还没有训练记录</p>
          <Link to="/workouts/new" className="inline-block mt-3 text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline">
            开始第一次训练
          </Link>
        </div>
      ) : (
        Object.entries(grouped).map(([month, items]) => (
          <div key={month}>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              {month}
            </h3>
            <div className="space-y-2">
              {items.map((w) => (
                <Link
                  key={w.id}
                  to={`/workouts/${w.id}`}
                  className="flex items-center gap-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 hover:border-primary-200 dark:hover:border-primary-800 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-primary-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {format(parseISO(w.date), 'M月d日 EEEE', { locale: zhCN })}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {w.exercise_count} 个动作{w.duration_minutes ? ` · ${w.duration_minutes} 分钟` : ''}
                      {w.notes ? ` · ${w.notes.slice(0, 30)}${w.notes.length > 30 ? '...' : ''}` : ''}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-primary-400 transition-colors flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        ))
      )}

      {workouts.length >= 20 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            上一页
          </button>
          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}
