import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { trainingAPI } from '../services/api';
import { formatDisplayDate, getWeekday } from '../utils/dateHelper';
import NeuCard from '../components/common/NeuCard';
import NeuButton from '../components/common/NeuButton';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './HistoryPage.css';

interface HistoryItem {
  id: number;
  training_date: string;
  notes: string | null;
  exercise_count: number;
  total_sets: number;
  created_at: string;
}

interface TrainingDetail {
  id: number;
  training_date: string;
  notes: string | null;
  exercises: Array<{
    exercise_id: number;
    exercise_name: string;
    body_part_name: string;
    sets: Array<{
      id: number;
      set_number: number;
      reps: number;
      weight: number | null;
    }>;
  }>;
}

interface HistoryResponse {
  data: HistoryItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { logId } = useParams();

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [history, setHistory] = useState<HistoryResponse | null>(null);
  const [detail, setDetail] = useState<TrainingDetail | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const isDetailMode = !!logId;

  useEffect(() => {
    if (isDetailMode) {
      fetchDetail();
    } else {
      fetchHistory();
    }
  }, [isDetailMode, currentPage, logId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await trainingAPI.getHistory(currentPage);
      setHistory(data);
    } catch (error) {
      console.error('获取历史记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const data = await trainingAPI.getDetail(Number(logId));
      setDetail(data);
    } catch (error) {
      console.error('获取训练详情失败:', error);
      alert('获取训练详情失败');
      navigate('/history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!detail) return;

    if (!window.confirm('确定要删除这条训练记录吗？此操作不可恢复。')) {
      return;
    }

    try {
      setDeleting(true);
      await trainingAPI.deleteTraining(detail.id);
      alert('删除成功');
      navigate('/history');
    } catch (error) {
      console.error('删除失败:', error);
      alert(error instanceof Error ? error.message : '删除失败');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="history-page">
        <div className="loading-container">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  // 详情视图
  if (isDetailMode && detail) {
    return (
      <div className="history-page">
        <header className="page-header">
          <button className="back-btn" onClick={() => navigate('/history')}>
            ← 返回列表
          </button>
          <h1 className="page-title">训练详情</h1>
        </header>

        <div className="page-content">
          <NeuCard className="detail-card">
            <div className="detail-header">
              <div className="detail-date">
                {formatDisplayDate(detail.training_date)}
              </div>
              <div className="detail-weekday">
                {getWeekday(detail.training_date)}
              </div>
            </div>

            {detail.notes && (
              <div className="detail-notes">
                <strong>备注：</strong>
                {detail.notes}
              </div>
            )}

            <div className="exercises-section">
              {detail.exercises.map((exercise) => (
                <div key={exercise.exercise_id} className="exercise-detail">
                  <div className="exercise-header">
                    <h3 className="exercise-name">{exercise.exercise_name}</h3>
                    <span className="body-part-tag">
                      {exercise.body_part_name}
                    </span>
                  </div>

                  <div className="sets-table">
                    <div className="table-header">
                      <span>组数</span>
                      <span>次数</span>
                      <span>重量(kg)</span>
                    </div>

                    {exercise.sets.map((set) => (
                      <div key={set.id} className="table-row">
                        <span>第{set.set_number}组</span>
                        <span>{set.reps}</span>
                        <span>{set.weight || '-'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="detail-actions">
              <NeuButton
                onClick={() => navigate(`/training/${detail.id}/edit`)}
              >
                编辑记录
              </NeuButton>
              <NeuButton
                onClick={handleDelete}
                variant="error"
                disabled={deleting}
              >
                {deleting ? '删除中...' : '删除记录'}
              </NeuButton>
            </div>
          </NeuCard>
        </div>
      </div>
    );
  }

  // 列表视图
  return (
    <div className="history-page">
      <header className="page-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← 返回首页
        </button>
        <h1 className="page-title">历史记录</h1>
      </header>

      <div className="page-content">
        {!history || history.data.length === 0 ? (
          <NeuCard className="empty-state">
            <p>还没有训练记录</p>
            <NeuButton onClick={() => navigate('/training/new')}>
              开始记录
            </NeuButton>
          </NeuCard>
        ) : (
          <>
            <div className="history-list">
              {history.data.map((item) => (
                <NeuCard
                  key={item.id}
                  className="history-item"
                  onClick={() => navigate(`/history/detail/${item.id}`)}
                >
                  <div className="history-date">
                    {formatDisplayDate(item.training_date)}
                    <span className="history-weekday">
                      {getWeekday(item.training_date)}
                    </span>
                  </div>

                  <div className="history-stats">
                    <div className="stat-item">
                      <span className="stat-label">项目</span>
                      <span className="stat-value">{item.exercise_count}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">组数</span>
                      <span className="stat-value">{item.total_sets}</span>
                    </div>
                  </div>

                  {item.notes && (
                    <div className="history-notes">
                      {item.notes}
                    </div>
                  )}
                </NeuCard>
              ))}
            </div>

            {/* 分页 */}
            {history.pagination.totalPages > 1 && (
              <div className="pagination">
                <NeuButton
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  size="sm"
                >
                  上一页
                </NeuButton>

                <span className="page-info">
                  第 {currentPage} / {history.pagination.totalPages} 页
                </span>

                <NeuButton
                  onClick={() => setCurrentPage(p => Math.min(history.pagination.totalPages, p + 1))}
                  disabled={currentPage === history.pagination.totalPages}
                  size="sm"
                >
                  下一页
                </NeuButton>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
