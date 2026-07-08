import React from 'react';
import NeuCard from '../common/NeuCard';
import './BodyPartSelector.css';

interface BodyPart {
  id: number;
  name: string;
  icon?: string;
}

interface BodyPartSelectorProps {
  bodyParts: BodyPart[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

const BodyPartSelector: React.FC<BodyPartSelectorProps> = ({
  bodyParts,
  selectedId,
  onSelect
}) => {
  const getIconEmoji = (icon?: string): string => {
    const iconMap: { [key: string]: string } = {
      chest: '💪',
      back: '🏋️',
      shoulder: '🎯',
      arm: '💪',
      leg: '🦵',
      core: '🎯'
    };
    return iconMap[icon || ''] || '🏋️';
  };

  return (
    <div className="body-part-selector">
      <h3 className="selector-title">选择训练部位</h3>
      <div className="body-part-grid">
        {bodyParts.map((part) => (
          <NeuCard
            key={part.id}
            className={`body-part-card ${selectedId === part.id ? 'selected' : ''}`}
            onClick={() => onSelect(part.id)}
          >
            <div className="body-part-icon">
              {getIconEmoji(part.icon)}
            </div>
            <div className="body-part-name">
              {part.name}
            </div>
          </NeuCard>
        ))}
      </div>
    </div>
  );
};

export default BodyPartSelector;
