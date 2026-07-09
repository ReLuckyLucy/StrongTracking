import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Pencil, Trash2, Clock, FileText } from 'lucide-react';
import { api } from '../lib/api';
import type { Workout } from '../types';

export default function WorkoutDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      api.getWorkout(id)
        .then(setWorkout)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  async function handleDelete() {
    if (!confirm('确定要删除这条训练记录吗？此操作不可撤销。')) return;
    setDeleting(true);
    try {
      await api.deleteWorkout(id!);
      navigate('/workouts');
    } catch (err) {
      alert('删除失败');
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">训练记录不存在</p>
        <Link to="/workouts" className="text-primary-500 hover:underline text-sm mt-2 inline-block">返回列表</Link>
      </div>
    );
  }

  // Group sets by exercise
  const grouped = workout.sets.reduce<Record<string, typeof workout.sets>>((acc, s) => {
    const name = s.exercise_name || s.exercise_id;
    if (!acc[name]) acc[name] = [];
    acc[name].push(s);
    return acc;
  }, {});

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <button onClick={() => navigate('/workouts')} className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-1">
            ← 返回
          </button>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {format(parseISO(workout.date), 'M月d日 EEEE', { locale: zhCN })}
          </h2>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/workouts/${workout.id}/edit`}
            className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2.5 rounded-xl border border-red-200 dark:border-red-900 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Meta */}
      <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
        {workout.duration_minutes && (
          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {workout.duration_minutes} 分钟</span>
        )}
        <span className="flex items-center gap-1.5"><FileText className="w-4 h-4" /> {Object.keys(grouped).length} 个动作</span>
      </div>

      {workout.notes && (
        <div className="bg-primary-50 dark:bg-primary-900/10 rounded-2xl p-4 text-sm text-primary-700 dark:text-primary-300">
          {workout.notes}
        </div>
      )}

      {/* Sets by exercise */}
      <div className="space-y-4">
        {Object.entries(grouped).map(([exName, exSets]) => (
          <div key={exName} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 font-semibold text-gray-900 dark:text-white text-sm">
              {exName}
            </div>
            <div className="p-4">
              {/* Table header */}
              <div className="flex text-xs font-medium text-gray-400 uppercase tracking-wider pb-2 border-b border-gray-100 dark:border-gray-800 mb-2">
                <span className="w-12">组</span>
                <span className="flex-1">重量</span>
                <span className="flex-1">次数</span>
              </div>
              {exSets.map((s) => (
                <div key={s.id} className="flex py-1.5 text-sm">
                  <span className="w-12 text-gray-400 font-mono">{s.set_number}</span>
                  <span className="flex-1 font-medium text-gray-900 dark:text-white">{s.weight_kg} kg</span>
                  <span className="flex-1 text-gray-600 dark:text-gray-300">{s.reps} reps</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
