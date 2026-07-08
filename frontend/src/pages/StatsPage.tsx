import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { statsAPI, trainingAPI } from '../services/api';
import NeuCard from '../components/common/NeuCard';
import NeuButton from '../components/common/NeuButton';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ProgressChart from '../components/charts/ProgressChart';
import './StatsPage.css';

interface SummaryStats {
  total_trainings: number;
  total_sets: number;
  total_exercises: number;
  last_training_date: string | null;
}

interface Exercise {
  id: number;
  name: string;
  body_part_id?: number;
  body_part_name?: string;
}

interface ProgressData {
  exercise: {
    name: string;
    body_part_id: number;
  };
  progress: Array<{
    date: string;
    maxWeight: number;
    maxReps: number;
    avgWeight: number;
    setCount: number;
  }>;
}

const StatsPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SummaryStats | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<number | null>(null);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [summaryData, exercisesData] = await Promise.all([
        statsAPI.getSummary(),
        trainingAPI.getAllExercises()
      ]);
      setStats(summaryData);
      setExercises(exercisesData);
    } catch (error) {
      console.error('获取统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async (exerciseId: number) => {
    try {
      setLoadingProgress(true);
      const data = await statsAPI.getProgress(exerciseId);
      setProgressData(data);
    } catch (error) {
      console.error('获取进步数据失败:', error);
      alert('获取进步数据失败');
    } finally {
      setLoadingProgress(false);
    }
  };

  const handleExerciseChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const exerciseId = parseInt(event.target.value);
    if (!isNaN(exerciseId)) {
      setSelectedExercise(exerciseId);
      fetchProgress(exerciseId);
    }
  };

  if (loading) {
    return (
      <div className="stats-page">
        <div className="loading-container">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="stats-page">
      <header className="page-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← 返回首页
        </button>
        <h1 className="page-title">统计分析</h1>
      </header>

      <div className="page-content">
        {/* 总体统计 */}
        <div className="stats-overview">
          <h2 className="section-title">总体统计</h2>

          <div className="stats-grid">
            <NeuCard className="stat-card">
              <div className="stat-icon">🏋️</div>
              <div className="stat-value">{stats?.total_trainings || 0}</div>
              <div className="stat-label">训练次数</div>
            </NeuCard>

            <NeuCard className="stat-card">
              <div className="stat-icon">💪</div>
              <div className="stat-value">{stats?.total_sets || 0}</div>
              <div className="stat-label">总组数</div>
            </NeuCard>

            <NeuCard className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-value">{stats?.total_exercises || 0}</div>
              <div className="stat-label">训练项目</div>
            </NeuCard>
          </div>
        </div>

        {/* 进步曲线 */}
        <div className="progress-section">
          <h2 className="section-title">进步曲线</h2>

          <div className="exercise-selector">
            <label htmlFor="exercise-select">选择训练项目：</label>
            <select
              id="exercise-select"
              value={selectedExercise || ''}
              onChange={handleExerciseChange}
              className="exercise-select"
            >
              <option value="">-- 请选择 --</option>
              {exercises.map(exercise => (
                <option key={exercise.id} value={exercise.id}>
                  {exercise.body_part_name} - {exercise.name}
                </option>
              ))}
            </select>
          </div>

          {loadingProgress ? (
            <div className="chart-loading">
              <LoadingSpinner size="md" />
            </div>
          ) : progressData ? (
            <ProgressChart
              data={progressData.progress}
              title={`${progressData.exercise.name} - 进步曲线`}
              height={350}
            />
          ) : selectedExercise ? (
            <NeuCard className="empty-chart">
              <p>该项目暂无训练记录</p>
            </NeuCard>
          ) : (
            <NeuCard className="empty-chart">
              <p>请选择一个训练项目查看进步曲线</p>
            </NeuCard>
          )}
        </div>

        {/* 统计信息 */}
        {stats?.last_training_date && (
          <div className="last-training-section">
            <h2 className="section-title">最近训练</h2>
            <NeuCard className="last-training-card">
              <div className="last-training-date">
                上次训练：{stats.last_training_date}
              </div>
              <NeuButton
                onClick={() => navigate('/history')}
                className="view-history-btn"
              >
                查看详细记录
              </NeuButton>
            </NeuCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsPage;
