import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, BarChart3 } from 'lucide-react';
import { api } from '../lib/api';
import type { Exercise, ProgressPoint } from '../types';

export default function ProgressPage() {
  const [searchParams] = useSearchParams();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedId, setSelectedId] = useState(searchParams.get('exercise') || '');
  const [progress, setProgress] = useState<ProgressPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);

  useEffect(() => {
    api.listExercises()
      .then((exs) => {
        setExercises(exs);
        if (!selectedId && exs.length > 0) {
          setSelectedId(exs[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setChartLoading(true);
    api.progress(selectedId)
      .then(setProgress)
      .catch(console.error)
      .finally(() => setChartLoading(false));
  }, [selectedId]);

  // Sync searchParams -> selectedId
  useEffect(() => {
    const paramId = searchParams.get('exercise');
    if (paramId && paramId !== selectedId) {
      setSelectedId(paramId);
    }
  }, [searchParams]);

  const selectedExercise = exercises.find((e) => e.id === selectedId);

  const chartData = useMemo(() => {
    return progress.map((p) => ({
      ...p,
      dateLabel: format(parseISO(p.date), 'M/d'),
    }));
  }, [progress]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">进度图表</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">追踪每个动作的重量变化趋势</p>
      </div>

      {/* Exercise selector */}
      <div className="flex flex-wrap gap-2">
        {exercises.map((ex) => (
          <button
            key={ex.id}
            onClick={() => setSelectedId(ex.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedId === ex.id
                ? 'bg-primary-500 text-white shadow-sm'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
            }`}
          >
            {ex.name}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary-500" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {selectedExercise?.name || '选择动作'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {selectedExercise?.category}
            </p>
          </div>
        </div>

        {chartLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-6 w-6 border-2 border-primary-500 border-t-transparent rounded-full" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <BarChart3 className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">还没有 {selectedExercise?.name} 的训练数据</p>
            <Link to="/workouts/new" className="text-sm text-primary-600 dark:text-primary-400 font-medium mt-2 hover:underline">
              开始训练记录
            </Link>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="dateLabel"
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                label={{ value: 'kg', position: 'insideLeft', style: { fontSize: 12, fill: '#9ca3af' } }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '13px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                }}
                labelFormatter={(label) => `日期: ${label}`}
                formatter={(value: number, name: string) => [`${value} kg`, name === 'max_weight' ? '最大重量' : '平均重量']}
              />
              <Line
                type="monotone"
                dataKey="max_weight"
                stroke="#22c55e"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#22c55e', strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#22c55e', strokeWidth: 0 }}
                name="最大重量"
              />
              <Line
                type="monotone"
                dataKey="avg_weight"
                stroke="#86efac"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 3, fill: '#86efac', strokeWidth: 0 }}
                name="平均重量"
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {/* Legend */}
        {chartData.length > 0 && (
          <div className="flex items-center gap-6 mt-4 justify-center">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="w-3 h-3 rounded-full bg-[#22c55e]" />
              最大重量
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="w-3 h-3 rounded-full bg-[#86efac]" />
              平均重量
            </div>
          </div>
        )}
      </div>

      {/* Summary stats */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <MiniStat label="训练次数" value={`${chartData.length} 次`} />
          <MiniStat
            label="最大重量"
            value={`${Math.max(...progress.map((p) => p.max_weight))} kg`}
          />
          <MiniStat
            label="最新重量"
            value={`${progress[progress.length - 1].max_weight} kg`}
          />
          <MiniStat
            label="起步重量"
            value={`${progress[0].max_weight} kg`}
          />
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 text-center">
      <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</p>
    </div>
  );
}
