import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import './ProgressChart.css';

interface DataPoint {
  date: string;
  maxWeight: number;
  maxReps: number;
  avgWeight: number;
}

interface ProgressChartProps {
  data: DataPoint[];
  title?: string;
  height?: number;
}

const ProgressChart: React.FC<ProgressChartProps> = ({
  data,
  title = '进步曲线',
  height = 300
}) => {
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-date">{formatDate(label)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="tooltip-item" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <div className="progress-chart-empty">
        <p>暂无数据</p>
        <p className="empty-hint">开始记录训练后，进步曲线将显示在这里</p>
      </div>
    );
  }

  return (
    <div className="progress-chart">
      {title && <h3 className="chart-title">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e5ec" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            stroke="#4a5568"
            style={{ fontSize: '12px' }}
          />
          <YAxis stroke="#4a5568" style={{ fontSize: '12px' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="maxWeight"
            stroke="#667eea"
            strokeWidth={2}
            dot={{ fill: '#667eea', r: 4 }}
            activeDot={{ r: 6 }}
            name="最大重量(kg)"
          />
          <Line
            type="monotone"
            dataKey="avgWeight"
            stroke="#48bb78"
            strokeWidth={2}
            dot={{ fill: '#48bb78', r: 4 }}
            activeDot={{ r: 6 }}
            name="平均重量(kg)"
          />
          <Line
            type="monotone"
            dataKey="maxReps"
            stroke="#ed8936"
            strokeWidth={2}
            dot={{ fill: '#ed8936', r: 4 }}
            activeDot={{ r: 6 }}
            name="最大次数"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProgressChart;
