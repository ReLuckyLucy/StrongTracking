import React, { useState } from 'react';
import './SetInput.css';

interface Set {
  set_number: number;
  reps: number;
  weight?: number;
}

interface SetInputProps {
  exerciseName: string;
  sets: Set[];
  onChange: (sets: Set[]) => void;
  onRemove?: () => void;
  canRemove?: boolean;
}

const SetInput: React.FC<SetInputProps> = ({
  exerciseName,
  sets,
  onChange,
  onRemove,
  canRemove = true
}) => {
  const [newSet, setNewSet] = useState<Set>({
    set_number: sets.length + 1,
    reps: 0,
    weight: undefined
  });

  const handleAddSet = () => {
    if (newSet.reps > 0) {
      const updatedSets = [...sets, { ...newSet, set_number: sets.length + 1 }];
      onChange(updatedSets);
      setNewSet({
        set_number: sets.length + 2,
        reps: 0,
        weight: undefined
      });
    }
  };

  const handleRemoveSet = (index: number) => {
    const updatedSets = sets.filter((_, i) => i !== index)
      .map((set, i) => ({ ...set, set_number: i + 1 }));
    onChange(updatedSets);
  };

  const handleSetChange = (index: number, field: keyof Set, value: number | undefined) => {
    const updatedSets = [...sets];
    updatedSets[index] = { ...updatedSets[index], [field]: value };
    onChange(updatedSets);
  };

  return (
    <div className="set-input-container">
      <div className="set-input-header">
        <h4 className="exercise-title">{exerciseName}</h4>
        {canRemove && onRemove && (
          <button
            className="remove-exercise-btn"
            onClick={onRemove}
          >
            删除
          </button>
        )}
      </div>

      <div className="sets-list">
        {sets.map((set, index) => (
          <div key={index} className="set-row">
            <div className="set-number">第{set.set_number}组</div>
            <div className="set-inputs">
              <div className="input-group">
                <label>次数</label>
                <input
                  type="number"
                  min="0"
                  value={set.reps}
                  onChange={(e) => handleSetChange(index, 'reps', parseInt(e.target.value) || 0)}
                  className="neu-input-sm"
                />
              </div>
              <div className="input-group">
                <label>重量(kg)</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={set.weight || ''}
                  onChange={(e) => handleSetChange(index, 'weight', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="neu-input-sm"
                />
              </div>
            </div>
            <button
              className="remove-set-btn"
              onClick={() => handleRemoveSet(index)}
            >
              ×
            </button>
          </div>
        ))}

        {/* 新增组输入 */}
        <div className="set-row add-set-row">
          <div className="set-number">第{sets.length + 1}组</div>
          <div className="set-inputs">
            <div className="input-group">
              <label>次数</label>
              <input
                type="number"
                min="0"
                value={newSet.reps || ''}
                onChange={(e) => setNewSet({ ...newSet, reps: parseInt(e.target.value) || 0 })}
                className="neu-input-sm"
                placeholder="次数"
              />
            </div>
            <div className="input-group">
              <label>重量(kg)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={newSet.weight || ''}
                onChange={(e) => setNewSet({ ...newSet, weight: e.target.value ? parseFloat(e.target.value) : undefined })}
                className="neu-input-sm"
                placeholder="重量"
              />
            </div>
          </div>
          <button
            className="add-set-btn"
            onClick={handleAddSet}
            disabled={!newSet.reps || newSet.reps <= 0}
          >
            +
          </button>
        </div>
      </div>

      {sets.length > 0 && (
        <div className="sets-summary">
          已记录 {sets.length} 组
        </div>
      )}
    </div>
  );
};

export default SetInput;
