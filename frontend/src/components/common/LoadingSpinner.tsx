import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = ''
}) => {
  const classes = [
    'loading-spinner',
    `loading-spinner-${size}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} />
  );
};

export default LoadingSpinner;
