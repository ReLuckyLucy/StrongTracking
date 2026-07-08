import request from 'supertest';
import app from '../app';

// Mock the database pool
jest.mock('../config/database', () => {
  const mockPool = {
    query: jest.fn(),
  };
  return {
    __esModule: true,
    default: mockPool,
    testConnection: jest.fn(),
  };
});

import pool from '../config/database';

// Helper: create an authenticated agent
async function createAuthAgent() {
  const agent = request.agent(app);
  await agent.post('/api/auth/login').send({ password: '123456' });
  return agent;
}

describe('Stats API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication required', () => {
    it('GET /api/stats/summary returns 401 without auth', async () => {
      const res = await request(app).get('/api/stats/summary');
      expect(res.status).toBe(401);
    });

    it('GET /api/stats/progress/1 returns 401 without auth', async () => {
      const res = await request(app).get('/api/stats/progress/1');
      expect(res.status).toBe(401);
    });

    it('GET /api/stats/recent returns 401 without auth', async () => {
      const res = await request(app).get('/api/stats/recent');
      expect(res.status).toBe(401);
    });

    it('GET /api/stats/date-range returns 401 without auth', async () => {
      const res = await request(app).get('/api/stats/date-range');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/stats/summary', () => {
    it('returns summary statistics', async () => {
      (pool.query as jest.Mock)
        .mockResolvedValueOnce([[{ total: 30 }]])       // training count
        .mockResolvedValueOnce([[{ total: 150 }]])       // sets count
        .mockResolvedValueOnce([[{ total: 12 }]])        // exercises count
        .mockResolvedValueOnce([[{ last_date: '2024-12-31' }]]) // last training
        .mockResolvedValueOnce([[{ total: 50000 }]]);     // total weight

      const agent = await createAuthAgent();
      const res = await agent.get('/api/stats/summary');

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        total_trainings: 30,
        total_sets: 150,
        total_exercises: 12,
        last_training_date: '2024-12-31',
        total_weight: 50000,
      });
    });
  });

  describe('GET /api/stats/progress/:exerciseId', () => {
    it('returns 400 for invalid exerciseId', async () => {
      const agent = await createAuthAgent();
      const res = await agent.get('/api/stats/progress/abc');

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', '无效的训练项目ID');
    });

    it('returns 404 when exercise not found', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce([[]]); // exercise lookup

      const agent = await createAuthAgent();
      const res = await agent.get('/api/stats/progress/999');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', '训练项目不存在');
    });

    it('returns progress data', async () => {
      (pool.query as jest.Mock)
        .mockResolvedValueOnce([[{ name: '卧推', body_part_id: 1 }]]) // exercise info
        .mockResolvedValueOnce([[
          { set_number: 1, reps: 10, weight: 50, training_date: '2024-01-01' },
          { set_number: 2, reps: 8, weight: 55, training_date: '2024-01-01' },
          { set_number: 1, reps: 10, weight: 60, training_date: '2024-01-08' },
        ]]);

      const agent = await createAuthAgent();
      const res = await agent.get('/api/stats/progress/1');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('exercise');
      expect(res.body.exercise).toMatchObject({ name: '卧推', body_part_id: 1 });
      expect(res.body).toHaveProperty('progress');
      expect(res.body.progress).toHaveLength(2); // two dates
      expect(res.body.progress[0]).toHaveProperty('date', '2024-01-01');
      expect(res.body.progress[0]).toHaveProperty('maxWeight');
      expect(res.body.progress[0]).toHaveProperty('maxReps');
    });
  });

  describe('GET /api/stats/recent', () => {
    it('returns recent trainings', async () => {
      (pool.query as jest.Mock)
        .mockResolvedValueOnce([[
          { id: 1, training_date: '2024-12-31', notes: null, created_at: '2024-12-31T10:00:00Z' },
        ]])
        .mockResolvedValueOnce([[{ exercise_count: 5, total_sets: 15, total_volume: 5000 }]]);

      const agent = await createAuthAgent();
      const res = await agent.get('/api/stats/recent');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toMatchObject({
        id: 1,
        training_date: '2024-12-31',
        exercise_count: 5,
        total_sets: 15,
        total_volume: 5000,
      });
    });

    it('uses default limit of 5', async () => {
      (pool.query as jest.Mock)
        .mockResolvedValueOnce([[]]);

      const agent = await createAuthAgent();
      await agent.get('/api/stats/recent');

      // Verifies the LIMIT parameter in the query
      const queryCall = (pool.query as jest.Mock).mock.calls[0];
      expect(queryCall[1]).toEqual([5]); // default limit
    });

    it('accepts custom limit', async () => {
      (pool.query as jest.Mock)
        .mockResolvedValueOnce([[]]);

      const agent = await createAuthAgent();
      await agent.get('/api/stats/recent?limit=10');

      const queryCall = (pool.query as jest.Mock).mock.calls[0];
      expect(queryCall[1]).toEqual([10]);
    });
  });

  describe('GET /api/stats/date-range', () => {
    it('returns 400 when dates are missing', async () => {
      const agent = await createAuthAgent();
      const res = await agent.get('/api/stats/date-range');

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', '开始日期和结束日期不能为空');
    });

    it('returns date range statistics', async () => {
      (pool.query as jest.Mock)
        .mockResolvedValueOnce([[{ total: 5 }]])   // training count
        .mockResolvedValueOnce([[{ total: 25 }]])   // sets count
        .mockResolvedValueOnce([[{ total: 8000 }]]) // total volume
        .mockResolvedValueOnce([[
          { training_date: '2024-01-01', training_count: 1, daily_volume: 2000 },
          { training_date: '2024-01-03', training_count: 1, daily_volume: 3000 },
        ]]);

      const agent = await createAuthAgent();
      const res = await agent.get('/api/stats/date-range')
        .query({ startDate: '2024-01-01', endDate: '2024-01-31' });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        training_count: 5,
        total_sets: 25,
        total_volume: 8000,
      });
      expect(res.body.daily_stats).toHaveLength(2);
    });
  });
});
