import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CalendarHeatmap from 'react-calendar-heatmap';
import { format, subYears, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Plus, Flame, Trophy, Dumbbell, TrendingUp, ChevronRight } from 'lucide-react';
import { api } from '../lib/api';
import type { Overview, HeatmapPoint } from '../types';
import 'react-calendar-heatmap/dist/styles.css';

export default function Dashboard() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [heatmap, setHeatmap] = useState<HeatmapPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.overview(), api.heatmap()])
      .then(([ov, hm]) => {
        setOverview(ov);
        setHeatmap(hm);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const today = new Date();
  const yearAgo = subYears(today, 1);
  const heatmapValues = heatmap.map((h) => ({
    date: h.date,
    count: h.count,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">仪表盘</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            {format(today, 'yyyy年M月d日 EEEE', { locale: zhCN })}
          </p>
        </div>
        <Link
          to="/workouts/new"
          className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-medium px-4 py-2.5 rounded-xl transition-colors text-sm shadow-sm"
        >
          <Plus className="w-4 h-4" />
          记录训练
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Dumbbell} label="总训练次数" value={overview?.total_workouts ?? 0} color="text-blue-500" bg="bg-blue-50 dark:bg-blue-900/20" />
        <StatCard icon={Flame} label="连续打卡" value={`${overview?.current_streak ?? 0} 天`} color="text-orange-500" bg="bg-orange-50 dark:bg-orange-900/20" />
        <StatCard icon={Trophy} label="最长连续" value={`${overview?.longest_streak ?? 0} 天`} color="text-yellow-500" bg="bg-yellow-50 dark:bg-yellow-900/20" />
        <StatCard icon={TrendingUp} label="动作 PR 数" value={overview?.exercise_prs.length ?? 0} color="text-green-500" bg="bg-green-50 dark:bg-green-900/20" />
      </div>

      {/* Heatmap */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">训练热力图</h3>
        <div className="overflow-x-auto">
          <CalendarHeatmap
            startDate={yearAgo}
            endDate={today}
            values={heatmapValues}
            classForValue={(value) => {
              if (!value || value.count === 0) return 'color-empty';
              if (value.count >= 3) return 'color-scale-4';
              if (value.count >= 2) return 'color-scale-3';
              if (value.count >= 1) return 'color-scale-2';
              return 'color-scale-1';
            }}
            titleForValue={(value) => {
              if (!value) return '无训练';
              return `${value.date}: ${value.count} 次训练`;
            }}
            showWeekdayLabels
          />
        </div>
        <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
          <span>少</span>
          <span className="w-3 h-3 rounded-sm bg-[#bbf7d0]" />
          <span className="w-3 h-3 rounded-sm bg-[#4ade80]" />
          <span className="w-3 h-3 rounded-sm bg-[#16a34a]" />
          <span className="w-3 h-3 rounded-sm bg-[#14532d]" />
          <span>多</span>
        </div>
      </div>

      {/* PR Cards */}
      {overview && overview.exercise_prs.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">个人最佳记录</h3>
            <Link to="/stats" className="text-xs text-primary-600 dark:text-primary-400 flex items-center gap-1 hover:underline">
              查看全部 <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {overview.exercise_prs.slice(0, 6).map((pr) => (
              <Link
                key={pr.exercise_id}
                to={`/stats?exercise=${pr.exercise_id}`}
                className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors group"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{pr.exercise_name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {pr.max_weight_date ? format(parseISO(pr.max_weight_date), 'M月d日') : ''}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-primary-600 dark:text-primary-400">{pr.max_weight}</span>
                  <span className="text-xs text-gray-400 ml-0.5">kg</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bg }: {
  icon: any;
  label: string;
  value: string | number;
  color: string;
  bg: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
      <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</p>
    </div>
  );
}
