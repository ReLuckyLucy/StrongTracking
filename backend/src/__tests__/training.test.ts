import request from 'supertest';
import app from '../app';

// Mock the database pool
jest.mock('../config/database', () => {
  const mockPool = {
    query: jest.fn(),
    getConnection: jest.fn(),
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

describe('Training API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication required', () => {
    it('GET /api/training/body-parts returns 401 without auth', async () => {
      const res = await request(app).get('/api/training/body-parts');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', '未授权，请先登录');
    });

    it('GET /api/training/exercises returns 401 without auth', async () => {
      const res = await request(app).get('/api/training/exercises');
      expect(res.status).toBe(401);
    });

    it('POST /api/training/save returns 401 without auth', async () => {
      const res = await request(app).post('/api/training/save').send({});
      expect(res.status).toBe(401);
    });

    it('GET /api/training/date/2024-01-01 returns 401 without auth', async () => {
      const res = await request(app).get('/api/training/date/2024-01-01');
      expect(res.status).toBe(401);
    });

    it('GET /api/training/history returns 401 without auth', async () => {
      const res = await request(app).get('/api/training/history');
      expect(res.status).toBe(401);
    });

    it('GET /api/training/detail/1 returns 401 without auth', async () => {
      const res = await request(app).get('/api/training/detail/1');
      expect(res.status).toBe(401);
    });

    it('DELETE /api/training/1 returns 401 without auth', async () => {
      const res = await request(app).delete('/api/training/1');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/training/body-parts', () => {
    it('returns body parts list', async () => {
      const mockBodyParts = [
        { id: 1, name: '胸部', icon: 'chest.png' },
        { id: 2, name: '背部', icon: 'back.png' },
      ];
      (pool.query as jest.Mock).mockResolvedValueOnce([mockBodyParts]);

      const agent = await createAuthAgent();
      const res = await agent.get('/api/training/body-parts');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockBodyParts);
    });

    it('returns 500 on database error', async () => {
      (pool.query as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const agent = await createAuthAgent();
      const res = await agent.get('/api/training/body-parts');

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('error', '获取训练部位失败');
    });
  });

  describe('GET /api/training/exercises/:bodyPartId', () => {
    it('returns 400 for invalid bodyPartId', async () => {
      const agent = await createAuthAgent();
      const res = await agent.get('/api/training/exercises/abc');

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', '无效的训练部位ID');
    });

    it('returns exercises for a body part', async () => {
      const mockExercises = [
        { id: 1, body_part_id: 1, name: '卧推' },
        { id: 2, body_part_id: 1, name: '哑铃飞鸟' },
      ];
      (pool.query as jest.Mock).mockResolvedValueOnce([mockExercises]);

      const agent = await createAuthAgent();
      const res = await agent.get('/api/training/exercises/1');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockExercises);
    });
  });

  describe('GET /api/training/exercises', () => {
    it('returns all exercises with body part names', async () => {
      const mockAll = [
        { id: 1, body_part_id: 1, name: '卧推', body_part_name: '胸部' },
      ];
      (pool.query as jest.Mock).mockResolvedValueOnce([mockAll]);

      const agent = await createAuthAgent();
      const res = await agent.get('/api/training/exercises');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockAll);
    });
  });

  describe('POST /api/training/save', () => {
    it('returns 400 when training_date is missing', async () => {
      const agent = await createAuthAgent();
      const res = await agent.post('/api/training/save').send({
        exercises: [{ exercise_id: 1, sets: [{ set_number: 1, reps: 10, weight: 50 }] }],
      });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', '训练日期不能为空');
    });

    it('returns 400 when exercises is missing', async () => {
      const agent = await createAuthAgent();
      const res = await agent.post('/api/training/save').send({
        training_date: '2024-01-01',
      });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', '训练项目不能为空');
    });

    it('returns 400 when exercises is empty array', async () => {
      const agent = await createAuthAgent();
      const res = await agent.post('/api/training/save').send({
        training_date: '2024-01-01',
        exercises: [],
      });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', '训练项目不能为空');
    });

    it('successfully saves training record', async () => {
      const mockConnection = {
        query: jest.fn(),
        beginTransaction: jest.fn(),
        commit: jest.fn(),
        rollback: jest.fn(),
        release: jest.fn(),
      };
      (pool.getConnection as jest.Mock).mockResolvedValue(mockConnection);
      mockConnection.query
        .mockResolvedValueOnce([{ insertId: 1 }]) // INSERT training_logs
        .mockResolvedValueOnce([{ insertId: 1 }]) // INSERT sets (first exercise)
        .mockResolvedValueOnce([{ insertId: 2 }]) // INSERT sets (second set)
        .mockResolvedValueOnce([{ insertId: 3 }]); // INSERT sets (third set)

      const agent = await createAuthAgent();
      const res = await agent.post('/api/training/save').send({
        training_date: '2024-01-01',
        notes: 'Test note',
        exercises: [
          {
            exercise_id: 1,
            sets: [
              { set_number: 1, reps: 10, weight: 50 },
              { set_number: 2, reps: 8, weight: 55 },
              { set_number: 3, reps: 6, weight: 60 },
            ],
          },
        ],
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('log_id', 1);
      expect(mockConnection.beginTransaction).toHaveBeenCalled();
      expect(mockConnection.commit).toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalled();
    });
  });

  describe('GET /api/training/date/:date', () => {
    it('returns empty array when no records found', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce([[]]);

      const agent = await createAuthAgent();
      const res = await agent.get('/api/training/date/2024-01-01');

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  describe('GET /api/training/history', () => {
    it('returns paginated history', async () => {
      (pool.query as jest.Mock)
        .mockResolvedValueOnce([[{ total: 1 }]]) // COUNT
        .mockResolvedValueOnce([[{ id: 1, training_date: '2024-01-01', notes: null }]]) // SELECT logs
        .mockResolvedValueOnce([[{ exercise_count: 3, total_sets: 9 }]]); // stats

      const agent = await createAuthAgent();
      const res = await agent.get('/api/training/history');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('pagination');
      expect(res.body.pagination).toMatchObject({
        page: 1,
        pageSize: 20,
        total: 1,
        totalPages: 1,
      });
    });
  });

  describe('GET /api/training/detail/:logId', () => {
    it('returns 400 for invalid logId', async () => {
      const agent = await createAuthAgent();
      const res = await agent.get('/api/training/detail/abc');

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', '无效的训练记录ID');
    });

    it('returns 404 when log not found', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce([[]]);

      const agent = await createAuthAgent();
      const res = await agent.get('/api/training/detail/999');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', '训练记录不存在');
    });
  });

  describe('DELETE /api/training/:logId', () => {
    it('returns 400 for invalid logId', async () => {
      const agent = await createAuthAgent();
      const res = await agent.delete('/api/training/abc');

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', '无效的训练记录ID');
    });

    it('deletes training record', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce([{}]);

      const agent = await createAuthAgent();
      const res = await agent.delete('/api/training/1');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('message', '训练记录删除成功');
    });
  });
});
