import { useEffect, useState } from 'react';
import { Users, Dumbbell, UserPlus, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import type { AdminStats } from '../../types';

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

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.adminStats()
      .then(setStats)
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">管理后台</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">系统概览</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard icon={Users} label="总用户数" value={stats?.total_users ?? 0} color="text-blue-500" bg="bg-blue-50 dark:bg-blue-900/20" />
        <StatCard icon={Dumbbell} label="总训练次数" value={stats?.total_workouts ?? 0} color="text-green-500" bg="bg-green-50 dark:bg-green-900/20" />
        <StatCard icon={Dumbbell} label="总动作数" value={stats?.total_exercises ?? 0} color="text-purple-500" bg="bg-purple-50 dark:bg-purple-900/20" />
        <StatCard icon={UserPlus} label="本周新用户" value={stats?.new_users_this_week ?? 0} color="text-orange-500" bg="bg-orange-50 dark:bg-orange-900/20" />
        <StatCard icon={Activity} label="本周活跃用户" value={stats?.active_users_this_week ?? 0} color="text-yellow-500" bg="bg-yellow-50 dark:bg-yellow-900/20" />
      </div>

      {/* Quick links */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">快捷入口</h3>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/users"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
          >
            <Users className="w-4 h-4" />
            用户管理
          </Link>
        </div>
      </div>
    </div>
  );
}
