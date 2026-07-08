import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { statsAPI, authAPI } from '../services/api';
import NeuCard from '../components/common/NeuCard';
import NeuButton from '../components/common/NeuButton';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getTodayDate, formatDisplayDate } from '../utils/dateHelper';
import './HomePage.css';

interface SummaryStats {
  total_trainings: number;
  total_sets: number;
  total_exercises: number;
  last_training_date: string | null;
}

interface RecentTraining {
  id: number;
  training_date: string;
  notes: string | null;
  exercise_count: number;
  total_sets: number;
  body_parts: string;
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SummaryStats | null>(null);
  const [recentTrainings, setRecentTrainings] = useState<RecentTraining[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [summaryData, recentData] = await Promise.all([
        statsAPI.getSummary(),
        statsAPI.getRecentTrainings(5)
      ]);
      setStats(summaryData);
      setRecentTrainings(recentData);
    } catch (error) {
      console.error('获取数据失败:', error);
      if (error instanceof Error && error.message.includes('未授权')) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      navigate('/login');
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

  if (loading) {
    return (
      <div className="home-page">
        <div className="loading-container">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <header className="home-header">
        <h1 className="page-title">健身记录</h1>
        <button className="logout-btn" onClick={handleLogout}>
          退出
        </button>
      </header>

      <div className="home-content">
        {/* 统计概览 */}
        <div className="stats-grid">
          <NeuCard className="stat-card">
            <div className="stat-value">{stats?.total_trainings || 0}</div>
            <div className="stat-label">训练次数</div>
          </NeuCard>

          <NeuCard className="stat-card">
            <div className="stat-value">{stats?.total_sets || 0}</div>
            <div className="stat-label">总组数</div>
          </NeuCard>

          <NeuCard className="stat-card">
            <div className="stat-value">{stats?.total_exercises || 0}</div>
            <div className="stat-label">训练项目</div>
          </NeuCard>
        </div>

        {/* 快捷操作 */}
        <div className="quick-actions">
          <NeuButton
            onClick={() => navigate('/training/new')}
            className="action-button"
          >
            + 新建训练
          </NeuButton>

          <NeuButton
            onClick={() => navigate('/history')}
            className="action-button"
          >
            📋 历史记录
          </NeuButton>

          <NeuButton
            onClick={() => navigate('/stats')}
            className="action-button"
          >
            📊 统计分析
          </NeuButton>
        </div>

        {/* 最近训练 */}
        <div className="recent-trainings">
          <h2 className="section-title">最近训练</h2>

          {recentTrainings.length === 0 ? (
            <NeuCard className="empty-state">
              <p>还没有训练记录</p>
              <p className="empty-hint">点击"新建训练"开始记录你的第一次训练</p>
            </NeuCard>
          ) : (
            <div className="recent-list">
              {recentTrainings.map((training) => (
                <NeuCard
                  key={training.id}
                  className="recent-item"
                  onClick={() => navigate(`/history/detail/${training.id}`)}
                >
                  <div className="recent-date">
                    {formatDisplayDate(training.training_date)}
                  </div>
                  <div className="recent-info">
                    <span>{training.exercise_count} 个项目</span>
                    <span>{training.total_sets} 组</span>
                  </div>
                  {training.body_parts && (
                    <div className="recent-body-parts">
                      🏋️ {training.body_parts}
                    </div>
                  )}
                  {training.notes && (
                    <div className="recent-notes">
                      备注: {training.notes}
                    </div>
                  )}
                </NeuCard>
              ))}
            </div>
          )}

          {recentTrainings.length > 0 && (
            <NeuButton
              onClick={() => navigate('/history')}
              className="view-all-btn"
            >
              查看全部
            </NeuButton>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
