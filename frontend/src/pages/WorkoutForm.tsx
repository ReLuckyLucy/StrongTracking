import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { api } from '../lib/api';
import type { Exercise } from '../types';

interface SetEntry {
  key: string; // unique key for React
  exercise_id: string;
  set_number: number;
  weight_kg: string;
  reps: string;
}

export default function WorkoutForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');
  const [duration, setDuration] = useState('');
  const [sets, setSets] = useState<SetEntry[]>([
    { key: crypto.randomUUID(), exercise_id: '', set_number: 1, weight_kg: '', reps: '' },
  ]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    api.listExercises()
      .then((exs: Exercise[]) => {
        setExercises(exs);
      })
      .catch(console.error);

    if (isEdit && id) {
      api.getWorkout(id)
        .then((w) => {
          setDate(w.date);
          setNotes(w.notes || '');
          setDuration(w.duration_minutes ? String(w.duration_minutes) : '');
          setSets(w.sets.map((s: any) => ({
            key: crypto.randomUUID(),
            exercise_id: s.exercise_id,
            set_number: s.set_number,
            weight_kg: String(s.weight_kg),
            reps: String(s.reps),
          })));
        })
        .catch(() => setError('加载训练记录失败'))
        .finally(() => setFetching(false));
    } else {
      setFetching(false);
    }
  }, [id]);

  function addSet() {
    const lastExercise = sets.length > 0 ? sets[sets.length - 1].exercise_id : '';
    setSets((prev) => [
      ...prev,
      {
        key: crypto.randomUUID(),
        exercise_id: lastExercise,
        set_number: prev.length + 1,
        weight_kg: '',
        reps: '',
      },
    ]);
  }

  function updateSet(key: string, field: keyof SetEntry, value: string) {
    setSets((prev) => prev.map((s) => (s.key === key ? { ...s, [field]: value } : s)));
  }

  function removeSet(key: string) {
    setSets((prev) => {
      if (prev.length <= 1) return prev;
      const filtered = prev.filter((s) => s.key !== key);
      // re-number
      return filtered.map((s, i) => ({ ...s, set_number: i + 1 }));
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    // Validate
    const invalid = sets.some((s) => !s.exercise_id || s.weight_kg === '' || s.reps === '');
    if (invalid) {
      setError('请填写所有必填字段');
      return;
    }

    const payload = {
      date,
      notes: notes || undefined,
      duration_minutes: duration ? parseInt(duration) : undefined,
      sets: sets.map((s) => ({
        exercise_id: s.exercise_id,
        set_number: s.set_number,
        weight_kg: parseFloat(s.weight_kg),
        reps: parseInt(s.reps),
      })),
    };

    setLoading(true);
    try {
      if (isEdit && id) {
        await api.updateWorkout(id, payload);
      } else {
        await api.createWorkout(payload);
      }
      navigate('/workouts');
    } catch (err: any) {
      setError(err.message || '保存失败');
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEdit ? '编辑训练' : '新建训练'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {/* Meta fields */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">日期 *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">时长 (分钟)</label>
              <input
                type="number"
                min="0"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="60"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">训练笔记</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="今天感觉如何？有什么想记录的..."
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
            />
          </div>
        </div>

        {/* Sets */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">训练组</h3>
            <button
              type="button"
              onClick={addSet}
              className="inline-flex items-center gap-1.5 text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline"
            >
              <Plus className="w-4 h-4" />
              添加组
            </button>
          </div>

          <div className="space-y-3">
            {sets.map((s, idx) => (
              <div key={s.key} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 group">
                <GripVertical className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                <span className="text-xs font-mono text-gray-400 w-6 text-center flex-shrink-0">
                  #{s.set_number}
                </span>

                <select
                  value={s.exercise_id}
                  onChange={(e) => updateSet(s.key, 'exercise_id', e.target.value)}
                  className="flex-1 min-w-0 px-2.5 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                >
                  <option value="">选择动作...</option>
                  {exercises.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name} ({ex.category})
                    </option>
                  ))}
                </select>

                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={s.weight_kg}
                    onChange={(e) => updateSet(s.key, 'weight_kg', e.target.value)}
                    placeholder="0"
                    className="w-20 px-2.5 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-center focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                  <span className="text-xs text-gray-400 ml-1">kg</span>
                </div>

                <span className="text-xs text-gray-400">×</span>

                <input
                  type="number"
                  min="0"
                  value={s.reps}
                  onChange={(e) => updateSet(s.key, 'reps', e.target.value)}
                  placeholder="0"
                  className="w-16 px-2.5 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-center focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />

                <button
                  type="button"
                  onClick={() => removeSet(s.key)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/workouts')}
            className="flex-1 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            {loading ? '保存中...' : '保存训练'}
          </button>
        </div>
      </form>
    </div>
  );
}
