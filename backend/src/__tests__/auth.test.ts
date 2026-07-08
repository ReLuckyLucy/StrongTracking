import request from 'supertest';
import app from '../app';

describe('Auth API', () => {
  describe('POST /api/auth/login', () => {
    it('returns 400 when password is empty', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', '密码不能为空');
    });

    it('returns 401 when password is wrong', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: 'wrong' });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', '密码错误');
    });

    it('returns 200 when password is correct', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: '123456' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('message', '登录成功');
    });
  });

  describe('GET /api/auth/check', () => {
    it('returns authenticated false without session', async () => {
      const res = await request(app).get('/api/auth/check');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('authenticated', false);
    });

    it('returns authenticated true with active session', async () => {
      const agent = request.agent(app);

      // Login first
      await agent
        .post('/api/auth/login')
        .send({ password: '123456' });

      // Then check auth
      const res = await agent.get('/api/auth/check');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('authenticated', true);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('returns success on logout', async () => {
      const agent = request.agent(app);

      // Login first
      await agent
        .post('/api/auth/login')
        .send({ password: '123456' });

      // Then logout
      const res = await agent.post('/api/auth/logout');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('message', '登出成功');
    });

    it('clears authentication after logout', async () => {
      const agent = request.agent(app);

      // Login
      await agent
        .post('/api/auth/login')
        .send({ password: '123456' });

      // Logout
      await agent.post('/api/auth/logout');

      // Check auth should be false
      const res = await agent.get('/api/auth/check');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('authenticated', false);
    });
  });
});
