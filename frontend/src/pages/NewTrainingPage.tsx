import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { trainingAPI } from '../services/api';
import { getTodayDate } from '../utils/dateHelper';
import BodyPartSelector from '../components/training/BodyPartSelector';
import ExerciseSelector from '../components/training/ExerciseSelector';
import SetInput from '../components/training/SetInput';
import NeuButton from '../components/common/NeuButton';
import NeuCard from '../components/common/NeuCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './NewTrainingPage.css';

interface BodyPart {
  id: number;
  name: string;
  icon?: string;
}

interface Exercise {
  id: number;
  name: string;
  body_part_id: number;
}

interface CustomExercise {
  tempId: number;
  name: string;
}

interface ExerciseSets {
  exercise_id: number;
  exercise_name: string;
  sets: Array<{
    set_number: number;
    reps: number;
    weight?: number;
  }>;
  custom_name?: string;
}

const NewTrainingPage: React.FC = () => {
  const navigate = useNavigate();
  const { logId } = useParams<{ logId?: string }>();
  const isEditMode = !!logId;

  const [step, setStep] = useState<'date' | 'body-part' | 'exercises' | 'sets'>(isEditMode ? 'sets' : 'date');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // 表单数据
  const [trainingDate, setTrainingDate] = useState(getTodayDate());
  const [bodyParts, setBodyParts] = useState<BodyPart[]>([]);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [selectedBodyPart, setSelectedBodyPart] = useState<number | null>(null);
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<number[]>([]);
  const [exerciseSets, setExerciseSets] = useState<ExerciseSets[]>([]);
  const [notes, setNotes] = useState('');

  // 自定义训练项目
  const [customExercises, setCustomExercises] = useState<CustomExercise[]>([]);
  const tempIdCounter = useRef(-1);

  useEffect(() => {
    if (isEditMode) {
      fetchExistingData();
    } else {
      fetchInitialData();
    }
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [bodyPartsData, exercisesData] = await Promise.all([
        trainingAPI.getBodyParts(),
        trainingAPI.getAllExercises()
      ]);
      setBodyParts(bodyPartsData);
      setAllExercises(exercisesData);
    } catch (error) {
      console.error('获取数据失败:', error);
      alert('获取数据失败，请重试');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  // 编辑模式：加载已有训练数据
  const fetchExistingData = async () => {
    try {
      setLoading(true);
      const [bodyPartsData, exercisesData, trainingDetail] = await Promise.all([
        trainingAPI.getBodyParts(),
        trainingAPI.getAllExercises(),
        trainingAPI.getDetail(Number(logId))
      ]);

      setBodyParts(bodyPartsData);
      setAllExercises(exercisesData);

      // 预填表单数据
      const detail = trainingDetail as any;
      setTrainingDate(detail.training_date?.split('T')[0] || getTodayDate());
      setNotes(detail.notes || '');

      // 从已有数据构造 exerciseSets
      const sets: ExerciseSets[] = detail.exercises.map((ex: any) => ({
        exercise_id: ex.exercise_id,
        exercise_name: ex.exercise_name,
        sets: ex.sets.map((s: any) => ({
          set_number: s.set_number,
          reps: s.reps,
          weight: s.weight || undefined
        })),
        // 如果 exercise_id 不在预设列表中，标记为自定义
        custom_name: undefined
      }));

      setExerciseSets(sets);

      // 推断训练部位（取第一个 exercise 的 body_part_id）
      if (detail.exercises.length > 0) {
        setSelectedBodyPart(detail.exercises[0].body_part_id);
      }

    } catch (error) {
      console.error('获取训练数据失败:', error);
      alert('获取训练数据失败');
      navigate('/history');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredExercises = () => {
    if (!selectedBodyPart) return [];
    return allExercises.filter(ex => ex.body_part_id === selectedBodyPart);
  };

  const handleExerciseToggle = (exerciseId: number) => {
    setSelectedExerciseIds(prev => {
      if (prev.includes(exerciseId)) {
        return prev.filter(id => id !== exerciseId);
      } else {
        return [...prev, exerciseId];
      }
    });
  };

  // 添加自定义项目
  const handleAddCustom = (name: string) => {
    const exists = customExercises.some(ce => ce.name === name);
    if (exists) {
      alert('该项目已存在');
      return;
    }
    const tempId = tempIdCounter.current;
    tempIdCounter.current -= 1;
    setCustomExercises(prev => [...prev, { tempId, name }]);
  };

  // 移除自定义项目
  const handleRemoveCustom = (tempId: number) => {
    setCustomExercises(prev => prev.filter(ce => ce.tempId !== tempId));
  };

  // 删除预设训练项目
  const handleDeletePreset = async (exerciseId: number) => {
    if (!window.confirm('确定要删除这个训练项目吗？此操作不可恢复。')) {
      return;
    }

    try {
      await trainingAPI.deleteExercise(exerciseId);
      setAllExercises(prev => prev.filter(ex => ex.id !== exerciseId));
      setSelectedExerciseIds(prev => prev.filter(id => id !== exerciseId));
    } catch (error) {
      console.error('删除训练项目失败:', error);
      alert(error instanceof Error ? error.message : '删除失败，请重试');
    }
  };

  const handleConfirmExercises = () => {
    const selectedExercises = allExercises.filter(ex =>
      selectedExerciseIds.includes(ex.id)
    );

    const presetExerciseSets: ExerciseSets[] = selectedExercises.map(ex => ({
      exercise_id: ex.id,
      exercise_name: ex.name,
      sets: []
    }));

    const customExerciseSets: ExerciseSets[] = customExercises.map(ce => ({
      exercise_id: ce.tempId,
      exercise_name: ce.name,
      custom_name: ce.name,
      sets: []
    }));

    const allSets = [...presetExerciseSets, ...customExerciseSets];

    if (allSets.length === 0) {
      alert('请至少选择一个训练项目');
      return;
    }

    setExerciseSets(allSets);
    setStep('sets');
  };

  const handleUpdateSets = (index: number, sets: ExerciseSets['sets']) => {
    const updated = [...exerciseSets];
    updated[index].sets = sets;
    setExerciseSets(updated);
  };

  const handleRemoveExercise = (index: number) => {
    const removed = exerciseSets[index];
    const updated = exerciseSets.filter((_, i) => i !== index);

    if (!removed.custom_name) {
      setSelectedExerciseIds(prev => prev.filter(id => id !== removed.exercise_id));
    } else {
      setCustomExercises(prev => prev.filter(ce => ce.tempId !== removed.exercise_id));
    }
    setExerciseSets(updated);
  };

  const handleSubmit = async () => {
    const validSets = exerciseSets.filter(ex => ex.sets.length > 0);

    if (validSets.length === 0) {
      alert('请至少为一个项目记录组数');
      return;
    }

    try {
      setSaving(true);

      const trainingData = {
        training_date: trainingDate,
        notes: notes.trim() || undefined,
        exercises: validSets.map(ex => ({
          exercise_id: ex.custom_name ? undefined : ex.exercise_id,
          exercise_name: ex.exercise_name,
          custom_name: ex.custom_name || undefined,
          body_part_id: selectedBodyPart || undefined,
          sets: ex.sets
        }))
      };

      if (isEditMode) {
        await trainingAPI.updateTraining(Number(logId), trainingData);
        alert('训练记录更新成功！');
      } else {
        await trainingAPI.saveTraining(trainingData);
        alert('训练记录保存成功！');
      }
      navigate('/history');
    } catch (error) {
      console.error('保存失败:', error);
      alert(error instanceof Error ? error.message : '保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="new-training-page">
        <div className="loading-container">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="new-training-page">
      <header className="page-header">
        <button className="back-btn" onClick={() => navigate(isEditMode ? `/history/detail/${logId}` : '/')}>
          ← {isEditMode ? '返回详情' : '返回'}
        </button>
        <h1 className="page-title">{isEditMode ? '编辑训练' : '新建训练'}</h1>
      </header>

      <div className="page-content">
        {/* 步骤1：选择日期 */}
        {(step === 'date' || isEditMode) && (
          <div className="step-section">
            <h2 className="step-title">训练日期</h2>
            <NeuCard className="date-card">
              <input
                type="date"
                id="training-date"
                value={trainingDate}
                onChange={(e) => setTrainingDate(e.target.value)}
                className="date-input"
                max={getTodayDate()}
              />
            </NeuCard>
            {!isEditMode && (
              <NeuButton onClick={() => setStep('body-part')}>
                下一步
              </NeuButton>
            )}
          </div>
        )}

        {/* 步骤2：选择训练部位 */}
        {step === 'body-part' && !isEditMode && (
          <div className="step-section">
            <h2 className="step-title">选择训练部位</h2>
            <BodyPartSelector
              bodyParts={bodyParts}
              selectedId={selectedBodyPart}
              onSelect={(id) => {
                setSelectedBodyPart(id);
                setSelectedExerciseIds([]);
                setCustomExercises([]);
              }}
            />
            <div className="step-actions">
              <NeuButton
                onClick={() => setStep('date')}
                variant="warning"
              >
                上一步
              </NeuButton>
              <NeuButton
                onClick={() => selectedBodyPart && setStep('exercises')}
                disabled={!selectedBodyPart}
              >
                下一步
              </NeuButton>
            </div>
          </div>
        )}

        {/* 步骤3：选择训练项目 */}
        {step === 'exercises' && !isEditMode && (
          <div className="step-section">
            <h2 className="step-title">选择训练项目</h2>
            <p className="step-hint">从预设项目选择，或手动输入自定义项目</p>
            <ExerciseSelector
              exercises={getFilteredExercises()}
              selectedIds={selectedExerciseIds}
              onToggle={handleExerciseToggle}
              customExercises={customExercises}
              onAddCustom={handleAddCustom}
              onRemoveCustom={handleRemoveCustom}
              onDeletePreset={handleDeletePreset}
            />
            <div className="step-actions">
              <NeuButton
                onClick={() => {
                  setStep('body-part');
                  setCustomExercises([]);
                }}
                variant="warning"
              >
                上一步
              </NeuButton>
              <NeuButton
                onClick={handleConfirmExercises}
                disabled={selectedExerciseIds.length === 0 && customExercises.length === 0}
              >
                下一步 ({selectedExerciseIds.length + customExercises.length})
              </NeuButton>
            </div>
          </div>
        )}

        {/* 步骤4：输入组数 */}
        {(step === 'sets' || isEditMode) && (
          <div className="step-section">
            <h2 className="step-title">记录组数</h2>
            <p className="step-hint">为每个训练项目输入组数、次数和重量</p>

            {exerciseSets.length === 0 ? (
              <NeuCard className="empty-state">
                <p>没有训练项目</p>
                {!isEditMode && (
                  <NeuButton onClick={() => setStep('exercises')}>
                    返回选择项目
                  </NeuButton>
                )}
              </NeuCard>
            ) : (
              <>
                {exerciseSets.map((item, index) => (
                  <SetInput
                    key={item.custom_name ? `custom-${item.exercise_id}` : item.exercise_id}
                    exerciseName={item.exercise_name}
                    sets={item.sets}
                    onChange={(sets) => handleUpdateSets(index, sets)}
                    onRemove={() => handleRemoveExercise(index)}
                    canRemove={exerciseSets.length > 1}
                  />
                ))}

                {/* 备注 */}
                <NeuCard className="notes-card">
                  <label htmlFor="notes">训练备注（可选）</label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="notes-textarea"
                    placeholder="记录今天的感受、状态等..."
                    rows={3}
                  />
                </NeuCard>

                {/* 日期选择（编辑模式下可见） */}
                {isEditMode && (
                  <div className="date-card-wrapper">
                    <label>训练日期</label>
                    <NeuCard className="date-card">
                      <input
                        type="date"
                        value={trainingDate}
                        onChange={(e) => setTrainingDate(e.target.value)}
                        className="date-input"
                        max={getTodayDate()}
                      />
                    </NeuCard>
                  </div>
                )}

                <div className="step-actions">
                  {!isEditMode && (
                    <NeuButton
                      onClick={() => setStep('exercises')}
                      variant="warning"
                    >
                      上一步
                    </NeuButton>
                  )}
                  <NeuButton
                    onClick={handleSubmit}
                    disabled={saving}
                  >
                    {saving ? '保存中...' : isEditMode ? '保存修改' : '保存训练记录'}
                  </NeuButton>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewTrainingPage;
