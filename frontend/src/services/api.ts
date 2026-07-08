import axios, { AxiosRequestConfig } from 'axios';

// API基础URL
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      // 服务器返回错误状态码
      const message = error.response.data?.error || error.response.data?.message || '请求失败';
      console.error('API错误:', message);

      // 如果是401未授权，跳转到登录页
      if (error.response.status === 401 && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }

      return Promise.reject(new Error(message));
    } else if (error.request) {
      // 请求已发出但没有收到响应
      console.error('网络错误：请检查网络连接');
      return Promise.reject(new Error('网络错误：请检查网络连接'));
    } else {
      // 请求配置出错
      console.error('请求配置错误:', error.message);
      return Promise.reject(error);
    }
  }
);

// 响应拦截器已将返回值解包为 response.data，
// 因此这里断言实例的请求方法直接返回数据类型（而非 AxiosResponse）。
const request = api as unknown as {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
};

// 认证相关API
export const authAPI = {
  // 登录
  login: (password: string) => {
    return request.post('/auth/login', { password });
  },

  // 登出
  logout: () => {
    return request.post('/auth/logout');
  },

  // 检查登录状态
  checkAuth: () => {
    return request.get('/auth/check');
  }
};

// 训练相关API
export const trainingAPI = {
  // 获取所有训练部位
  getBodyParts: () => {
    return request.get('/training/body-parts');
  },

  // 获取指定部位的训练项目
  getExercises: (bodyPartId: number) => {
    return request.get(`/training/exercises/${bodyPartId}`);
  },

  // 获取所有训练项目
  getAllExercises: () => {
    return request.get('/training/exercises');
  },

  // 保存训练记录
  saveTraining: (data: {
    training_date: string;
    notes?: string;
    exercises: Array<{
      exercise_id?: number;
      custom_name?: string;
      exercise_name?: string;
      body_part_id?: number;
      sets: Array<{
        set_number: number;
        reps: number;
        weight?: number;
      }>;
    }>;
  }) => {
    return request.post('/training/save', data);
  },

  // 获取指定日期的训练记录
  getTrainingByDate: (date: string) => {
    return request.get(`/training/date/${date}`);
  },

  // 获取历史记录（分页）
  getHistory: (page: number = 1) => {
    return request.get('/training/history', { params: { page } });
  },

  // 获取训练记录详情
  getDetail: (logId: number) => {
    return request.get(`/training/detail/${logId}`);
  },

  // 删除训练记录
  deleteTraining: (logId: number) => {
    return request.delete(`/training/${logId}`);
  },

  // 删除训练项目（预设项目）
  deleteExercise: (exerciseId: number) => {
    return request.delete(`/training/exercises/${exerciseId}`);
  },

  // 更新训练记录
  updateTraining: (logId: number, data: {
    training_date: string;
    notes?: string;
    exercises: Array<{
      exercise_id?: number;
      custom_name?: string;
      exercise_name?: string;
      body_part_id?: number;
      sets: Array<{
        set_number: number;
        reps: number;
        weight?: number;
      }>;
    }>;
  }) => {
    return request.put(`/training/${logId}`, data);
  }
};

// 统计相关API
export const statsAPI = {
  // 获取统计概览
  getSummary: () => {
    return request.get('/stats/summary');
  },

  // 获取项目进步数据
  getProgress: (exerciseId: number) => {
    return request.get(`/stats/progress/${exerciseId}`);
  },

  // 获取最近训练记录
  getRecentTrainings: (limit: number = 5) => {
    return request.get('/stats/recent', { params: { limit } });
  },

  // 获取日期范围统计
  getDateRangeStats: (startDate: string, endDate: string) => {
    return request.get('/stats/date-range', {
      params: { startDate, endDate }
    });
  }
};

export default api;
