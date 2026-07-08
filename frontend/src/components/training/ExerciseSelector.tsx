import React, { useState } from 'react';
import './ExerciseSelector.css';

interface Exercise {
  id: number;
  name: string;
  body_part_id?: number;
}

interface CustomExercise {
  tempId: number;
  name: string;
}

interface ExerciseSelectorProps {
  exercises: Exercise[];
  selectedIds: number[];
  onToggle: (id: number) => void;
  className?: string;
  customExercises?: CustomExercise[];
  onAddCustom?: (name: string) => void;
  onRemoveCustom?: (tempId: number) => void;
  onDeletePreset?: (id: number) => void;
}

const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({
  exercises,
  selectedIds,
  onToggle,
  className = '',
  customExercises = [],
  onAddCustom,
  onRemoveCustom,
  onDeletePreset
}) => {
  const [customName, setCustomName] = useState('');

  const handleAddCustom = () => {
    const trimmed = customName.trim();
    if (trimmed && onAddCustom) {
      onAddCustom(trimmed);
      setCustomName('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustom();
    }
  };

  const totalSelected = selectedIds.length + customExercises.length;

  return (
    <div className={`exercise-selector ${className}`}>
      <h3 className="selector-title">选择训练项目</h3>

      {/* 自定义项目输入 */}
      {onAddCustom && (
        <div className="custom-exercise-input">
          <input
            type="text"
            className="custom-input"
            placeholder="输入自定义训练项目..."
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            type="button"
            className="custom-add-btn"
            onClick={handleAddCustom}
            disabled={!customName.trim()}
          >
            添加
          </button>
        </div>
      )}

      <div className="exercise-list">
        {/* 自定义项目列表 */}
        {customExercises.map((item) => (
          <label
            key={`custom-${item.tempId}`}
            className="exercise-item custom-item selected"
          >
            <span className="exercise-name">
              {item.name}
              <span className="custom-tag">自定义</span>
            </span>
            <button
              type="button"
              className="custom-remove-btn"
              onClick={(e) => {
                e.preventDefault();
                onRemoveCustom?.(item.tempId);
              }}
            >
              ×
            </button>
          </label>
        ))}

        {/* 预设项目列表 */}
        {exercises.map((exercise) => (
          <label
            key={exercise.id}
            className={`exercise-item ${selectedIds.includes(exercise.id) ? 'selected' : ''}`}
          >
            <input
              type="checkbox"
              checked={selectedIds.includes(exercise.id)}
              onChange={() => onToggle(exercise.id)}
              className="exercise-checkbox"
            />
            <span className="exercise-name">
              {exercise.name}
            </span>
            <span className="exercise-checkmark">
              {selectedIds.includes(exercise.id) && '✓'}
            </span>
            {onDeletePreset && (
              <button
                type="button"
                className="preset-remove-btn"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDeletePreset(exercise.id);
                }}
                title="删除训练项目"
              >
                ×
              </button>
            )}
          </label>
        ))}
      </div>

      {exercises.length === 0 && customExercises.length === 0 && (
        <p className="empty-hint">请先选择训练部位</p>
      )}

      {totalSelected > 0 && (
        <div className="selected-count">
          已选择 {totalSelected} 个项目
          {customExercises.length > 0 && `（含 ${customExercises.length} 个自定义）`}
        </div>
      )}
    </div>
  );
};

export default ExerciseSelector;
