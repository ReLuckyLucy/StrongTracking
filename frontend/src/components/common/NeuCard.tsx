import React from 'react';
import './NeuCard.css';

interface NeuCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const NeuCard: React.FC<NeuCardProps> = ({
  children,
  className = '',
  onClick,
  style
}) => {
  return (
    <div
      className={`neu-card ${className}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
};

export default NeuCard;
