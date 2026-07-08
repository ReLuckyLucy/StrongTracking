// 日期格式化
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 格式化日期显示
export const formatDisplayDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}年${month}月${day}日`;
};

// 获取今天的日期
export const getTodayDate = (): string => {
  return formatDate(new Date());
};

// 获取相对日期
export const getRelativeDate = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return formatDate(date);
};

// 获取本周的开始日期（周一）
export const getWeekStart = (): string => {
  const date = new Date();
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // 调整为周一
  date.setDate(diff);
  return formatDate(date);
};

// 获取本月开始日期
export const getMonthStart = (): string => {
  const date = new Date();
  date.setDate(1);
  return formatDate(date);
};

// 计算两个日期之间的天数差
export const getDaysDiff = (date1: string, date2: string): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// 获取日期数组（用于图表）
export const getDateRange = (startDate: string, endDate: string): string[] => {
  const dates: string[] = [];
  let current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    dates.push(formatDate(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
};

// 检查是否是今天
export const isToday = (date: string): boolean => {
  return formatDate(new Date()) === date;
};

// 检查是否是本周
export const isThisWeek = (date: string): boolean => {
  const d = new Date(date);
  const today = new Date();
  const weekStart = new Date(getWeekStart());

  return d >= weekStart && d <= today;
};

// 检查是否是本月
export const isThisMonth = (date: string): boolean => {
  const d = new Date(date);
  const today = new Date();

  return d.getMonth() === today.getMonth() &&
         d.getFullYear() === today.getFullYear();
};

// 获取星期几
export const getWeekday = (date: string): string => {
  const d = new Date(date);
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return weekdays[d.getDay()];
};

// 解析时间戳
export const parseDateTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  return formatDisplayDate(date);
};
