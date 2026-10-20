import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy, Medal, Dumbbell, Flame, Weight, Layers, Users, Crown,
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import type {
  Exercise, Leaderboard, LeaderboardEntry, LeaderboardMetric, LeaderboardPeriod,
} from '../types';

const METRICS: { value: LeaderboardMetric; label: string; icon: any }[] = [
  { value: 'workouts', label: '训练次数', icon: Dumbbell },
  { value: 'volume', label: '训练容量', icon: Layers },
  { value: 'streak', label: '连续打卡', icon: Flame },
  { value: 'weight', label: '最大重量', icon: Weight },
];

const PERIODS: { value: LeaderboardPeriod; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'month', label: '本月' },
  { value: 'week', label: '近 7 天' },
];

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [metric, setMetric] = useState<LeaderboardMetric>('workouts');
  const [period, setPeriod] = useState<LeaderboardPeriod>('all');
  const [exerciseId, setExerciseId] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [data, setData] = useState<Leaderboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.listExercises()
      .then(setExercises)
      .catch(() => setExercises([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    api.leaderboard({ metric, period, exercise_id: exerciseId || undefined })
      .then((res: Leaderboard) => setData(res))
      .catch((e: Error) => setError(e.message || '加载失败'))
      .finally(() => setLoading(false));
  }, [metric, period, exerciseId]);

  const myEntry = data?.my_entry ?? null;
  const isTop3 = myEntry != null && myEntry.rank <= 3;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">排行榜</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
          和社区里的其他训练者一起比较，看看你的位置
        </p>
      </div>

      {/* Metric tabs */}
      <div className="flex flex-wrap gap-2">
        {METRICS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setMetric(value)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              metric === value
                ? 'bg-primary-500 text-white shadow-sm'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-800">
          {PERIODS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setPeriod(value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                period === value
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <select
          value={exerciseId}
          onChange={(e) => setExerciseId(e.target.value)}
          className="px-3 py-2 rounded-xl text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">全部动作</option>
          {exercises.map((ex) => (
            <option key={ex.id} value={ex.id}>{ex.name}</option>
          ))}
        </select>

        {data && (
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Users className="w-3.5 h-3.5" />
            {data.total_participants} 人参与
          </span>
        )}
      </div>

      {/* My rank card */}
      {myEntry && !isTop3 && (
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
          <div className="w-12 h-12 rounded-xl bg-primary-500 flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-bold text-white">#{myEntry.rank}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white">我的排名</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {metricLabel(metric)} {formatMetricValue(metric, myEntry)}
            </p>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full" />
        </div>
      ) : error ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      ) : !data || data.entries.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center">
          <Trophy className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {exerciseId ? '还没有人在这个动作上榜' : '还没有人上榜'}
          </p>
          <Link
            to="/workouts/new"
            className="inline-block mt-3 text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline"
          >
            记录一次训练来上榜
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {data.entries.map((entry) => (
            <RankRow
              key={entry.user_id}
              entry={entry}
              metric={metric}
              isMe={entry.user_id === user?.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RankRow({
  entry, metric, isMe,
}: {
  entry: LeaderboardEntry;
  metric: LeaderboardMetric;
  isMe: boolean;
}) {
  const rankStyle = rankBadge(entry.rank);

  return (
    <div
      className={`flex items-center gap-3 sm:gap-4 p-4 rounded-2xl border transition-colors ${
        isMe
          ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700'
          : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800'
      }`}
    >
      {/* Rank */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm ${rankStyle}`}>
        {entry.rank <= 3 ? <MedalIcon rank={entry.rank} /> : entry.rank}
      </div>

      {/* Avatar + name */}
      <div className="flex-1 min-w-0 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 flex items-center justify-center text-sm font-bold flex-shrink-0">
          {entry.username?.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 dark:text-white truncate">
            {entry.username}
            {isMe && <span className="ml-2 text-xs font-normal text-primary-600 dark:text-primary-400">(我)</span>}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {metricLabel(metric)} {formatMetricValue(metric, entry)}
          </p>
        </div>
      </div>

      {/* Secondary stat */}
      <div className="hidden sm:flex flex-col items-end text-right flex-shrink-0">
        <span className="text-sm font-semibold text-gray-900 dark:text-white">
          {entry.workout_count} 次训练
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          连续 {entry.current_streak} 天
        </span>
      </div>
    </div>
  );
}

function MedalIcon({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="flex items-center gap-0.5">
        <Crown className="w-4 h-4 text-yellow-500" />
      </span>
    );
  }
  const color = rank === 2 ? 'text-gray-400' : 'text-amber-700';
  return <Medal className={`w-5 h-5 ${color}`} />;
}

function rankBadge(rank: number) {
  if (rank === 1) return 'bg-yellow-50 dark:bg-yellow-900/20';
  if (rank === 2) return 'bg-gray-100 dark:bg-gray-800';
  if (rank === 3) return 'bg-amber-50 dark:bg-amber-900/20';
  return 'bg-gray-50 dark:bg-gray-800';
}

function metricLabel(metric: LeaderboardMetric) {
  switch (metric) {
    case 'volume': return '训练容量';
    case 'streak': return '连续打卡';
    case 'weight': return '最大重量';
    default: return '训练次数';
  }
}

function formatMetricValue(metric: LeaderboardMetric, entry: LeaderboardEntry) {
  switch (metric) {
    case 'volume': return `${entry.total_volume.toLocaleString()} kg`;
    case 'streak': return `${entry.current_streak} 天`;
    case 'weight': return `${entry.max_weight} kg`;
    default: return `${entry.workout_count} 次`;
  }
}
