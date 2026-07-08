import { Request, Response } from 'express';
import pool from '../config/database';
import { ResultSetHeader } from 'mysql2';

// 获取所有训练部位
export const getBodyParts = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, icon FROM body_parts ORDER BY id'
    );
    res.json(rows);
  } catch (error) {
    console.error('获取训练部位失败:', error);
    res.status(500).json({ error: '获取训练部位失败' });
  }
};

// 获取指定部位的训练项目
export const getExercises = async (req: Request, res: Response) => {
  try {
    const { bodyPartId } = req.params;

    if (!bodyPartId || isNaN(parseInt(String(bodyPartId)))) {
      return res.status(400).json({ error: '无效的训练部位ID' });
    }

    const [rows] = await pool.query(
      'SELECT id, body_part_id, name FROM exercises WHERE body_part_id = ? ORDER BY id',
      [bodyPartId]
    );
    res.json(rows);
  } catch (error) {
    console.error('获取训练项目失败:', error);
    res.status(500).json({ error: '获取训练项目失败' });
  }
};

// 获取所有训练项目（按部位分组）
export const getAllExercises = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        e.id,
        e.body_part_id,
        e.name,
        b.name as body_part_name
      FROM exercises e
      JOIN body_parts b ON e.body_part_id = b.id
      ORDER BY b.id, e.id
    `);
    res.json(rows);
  } catch (error) {
    console.error('获取所有训练项目失败:', error);
    res.status(500).json({ error: '获取所有训练项目失败' });
  }
};

// 保存训练记录
export const saveTraining = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();

  try {
    const { training_date, notes, exercises } = req.body;

    if (!training_date) {
      return res.status(400).json({ error: '训练日期不能为空' });
    }

    if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
      return res.status(400).json({ error: '训练项目不能为空' });
    }

    await connection.beginTransaction();

    // 创建训练记录
    const [logResult] = await connection.query<ResultSetHeader>(
      'INSERT INTO training_logs (training_date, notes) VALUES (?, ?)',
      [training_date, notes || null]
    );

    const logId = logResult.insertId;

    // 插入所有组数记录
    for (const exercise of exercises) {
      let { exercise_id, custom_name, body_part_id, sets } = exercise;

      if (!sets || !Array.isArray(sets)) {
        await connection.rollback();
        return res.status(400).json({ error: '训练项目数据格式错误' });
      }

      // 处理自定义项目：先插入 exercises 表获取真实 ID
      if (custom_name && !exercise_id) {
        if (!body_part_id) {
          await connection.rollback();
          return res.status(400).json({ error: '自定义项目需要指定训练部位' });
        }

        const [exerciseResult] = await connection.query<ResultSetHeader>(
          'INSERT INTO exercises (body_part_id, name) VALUES (?, ?)',
          [body_part_id, custom_name]
        );
        exercise_id = exerciseResult.insertId;
      }

      if (!exercise_id) {
        await connection.rollback();
        return res.status(400).json({ error: '训练项目ID不能为空' });
      }

      for (const set of sets) {
        const { set_number, reps, weight } = set;

        if (set_number === undefined || !reps) {
          await connection.rollback();
          return res.status(400).json({ error: '组数数据不完整' });
        }

        await connection.query(
          'INSERT INTO sets (log_id, exercise_id, set_number, reps, weight) VALUES (?, ?, ?, ?, ?)',
          [logId, exercise_id, set_number, reps, weight || null]
        );
      }
    }

    await connection.commit();

    res.json({
      success: true,
      message: '训练记录保存成功',
      log_id: logId
    });
  } catch (error) {
    await connection.rollback();
    console.error('保存训练记录失败:', error);
    res.status(500).json({ error: '保存训练记录失败' });
  } finally {
    connection.release();
  }
};

// 获取指定日期的训练记录
export const getTrainingByDate = async (req: Request, res: Response) => {
  try {
    const { date } = req.params;

    if (!date) {
      return res.status(400).json({ error: '日期参数不能为空' });
    }

    // 获取训练记录
    const [logs] = await pool.query(
      'SELECT id, training_date, notes, created_at FROM training_logs WHERE training_date = ? ORDER BY created_at DESC',
      [date]
    );

    if (!Array.isArray(logs) || logs.length === 0) {
      return res.json([]);
    }

    // 为每个训练记录获取详细的组数信息
    const results = await Promise.all(
      (logs as any[]).map(async (log) => {
        const [sets] = await pool.query(`
          SELECT
            s.id,
            s.set_number,
            s.reps,
            s.weight,
            e.id as exercise_id,
            e.name as exercise_name,
            b.name as body_part_name
          FROM sets s
          JOIN exercises e ON s.exercise_id = e.id
          JOIN body_parts b ON e.body_part_id = b.id
          WHERE s.log_id = ?
          ORDER BY e.body_part_id, e.id, s.set_number
        `, [log.id]);

        return {
          ...log,
          sets: sets
        };
      })
    );

    res.json(results);
  } catch (error) {
    console.error('获取训练记录失败:', error);
    res.status(500).json({ error: '获取训练记录失败' });
  }
};

// 分页获取历史训练记录
export const getTrainingHistory = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = 20;
    const offset = (page - 1) * pageSize;

    // 获取总记录数
    const [countResult] = await pool.query(
      'SELECT COUNT(DISTINCT training_date) as total FROM training_logs'
    );
    const total = (countResult as any)[0].total;

    // 获取分页数据
    const [logs] = await pool.query(`
      SELECT
        id,
        training_date,
        notes,
        created_at
      FROM training_logs
      ORDER BY training_date DESC, created_at DESC
      LIMIT ? OFFSET ?
    `, [pageSize, offset]);

    // 为每个训练记录获取项目数量统计
    const results = await Promise.all(
      (logs as any[]).map(async (log) => {
        const [stats] = await pool.query(`
          SELECT
            COUNT(DISTINCT exercise_id) as exercise_count,
            COUNT(*) as total_sets
          FROM sets
          WHERE log_id = ?
        `, [log.id]);

        return {
          ...log,
          exercise_count: (stats as any)[0].exercise_count,
          total_sets: (stats as any)[0].total_sets
        };
      })
    );

    res.json({
      data: results,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    console.error('获取历史记录失败:', error);
    res.status(500).json({ error: '获取历史记录失败' });
  }
};

// 获取训练记录详情
export const getTrainingDetail = async (req: Request, res: Response) => {
  try {
    const { logId } = req.params;

    if (!logId || isNaN(parseInt(String(logId)))) {
      return res.status(400).json({ error: '无效的训练记录ID' });
    }

    // 获取训练记录基本信息
    const [logs] = await pool.query(
      'SELECT id, training_date, notes, created_at FROM training_logs WHERE id = ?',
      [logId]
    );

    if (!Array.isArray(logs) || logs.length === 0) {
      return res.status(404).json({ error: '训练记录不存在' });
    }

    const log = logs[0];

    // 获取详细的组数信息
    const [sets] = await pool.query(`
      SELECT
        s.id,
        s.set_number,
        s.reps,
        s.weight,
        e.id as exercise_id,
        e.name as exercise_name,
        e.body_part_id,
        b.name as body_part_name
      FROM sets s
      JOIN exercises e ON s.exercise_id = e.id
      JOIN body_parts b ON e.body_part_id = b.id
      WHERE s.log_id = ?
      ORDER BY b.id, e.id, s.set_number
    `, [logId]);

    // 按项目分组
    const grouped = (sets as any[]).reduce((acc, set) => {
      if (!acc[set.exercise_id]) {
        acc[set.exercise_id] = {
          exercise_id: set.exercise_id,
          exercise_name: set.exercise_name,
          body_part_id: set.body_part_id,
          body_part_name: set.body_part_name,
          sets: []
        };
      }
      acc[set.exercise_id].sets.push({
        id: set.id,
        set_number: set.set_number,
        reps: set.reps,
        weight: set.weight
      });
      return acc;
    }, {});

    res.json({
      ...log,
      exercises: Object.values(grouped)
    });
  } catch (error) {
    console.error('获取训练详情失败:', error);
    res.status(500).json({ error: '获取训练详情失败' });
  }
};

// 删除训练记录
export const deleteTraining = async (req: Request, res: Response) => {
  try {
    const { logId } = req.params;

    if (!logId || isNaN(parseInt(String(logId)))) {
      return res.status(400).json({ error: '无效的训练记录ID' });
    }

    await pool.query('DELETE FROM training_logs WHERE id = ?', [logId]);

    res.json({
      success: true,
      message: '训练记录删除成功'
    });
  } catch (error) {
    console.error('删除训练记录失败:', error);
    res.status(500).json({ error: '删除训练记录失败' });
  }
};

// 删除训练项目（预设项目）
export const deleteExercise = async (req: Request, res: Response) => {
  try {
    const { exerciseId } = req.params;

    if (!exerciseId || isNaN(parseInt(String(exerciseId)))) {
      return res.status(400).json({ error: '无效的训练项目ID' });
    }

    // 检查项目是否存在
    const [exercise] = await pool.query(
      'SELECT id FROM exercises WHERE id = ?',
      [exerciseId]
    );

    if (!Array.isArray(exercise) || exercise.length === 0) {
      return res.status(404).json({ error: '训练项目不存在' });
    }

    // 删除训练项目（sets 表有 ON DELETE CASCADE 自动删除关联组数）
    await pool.query('DELETE FROM exercises WHERE id = ?', [exerciseId]);

    // 清理没有剩余组数的孤儿训练记录
    await pool.query(`
      DELETE FROM training_logs
      WHERE id NOT IN (SELECT DISTINCT log_id FROM sets)
    `);

    res.json({
      success: true,
      message: '训练项目删除成功'
    });
  } catch (error) {
    console.error('删除训练项目失败:', error);
    res.status(500).json({ error: '删除训练项目失败' });
  }
};

// 更新训练记录
export const updateTraining = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();

  try {
    const { logId } = req.params;
    const { training_date, notes, exercises } = req.body;

    if (!logId || isNaN(parseInt(String(logId)))) {
      return res.status(400).json({ error: '无效的训练记录ID' });
    }

    if (!training_date) {
      return res.status(400).json({ error: '训练日期不能为空' });
    }

    if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
      return res.status(400).json({ error: '训练项目不能为空' });
    }

    // 检查训练记录是否存在
    const [existing] = await connection.query(
      'SELECT id FROM training_logs WHERE id = ?',
      [logId]
    );

    if (!Array.isArray(existing) || existing.length === 0) {
      return res.status(404).json({ error: '训练记录不存在' });
    }

    await connection.beginTransaction();

    // 更新训练记录基本信息
    await connection.query(
      'UPDATE training_logs SET training_date = ?, notes = ? WHERE id = ?',
      [training_date, notes || null, logId]
    );

    // 删除旧的组数记录
    await connection.query('DELETE FROM sets WHERE log_id = ?', [logId]);

    // 重新插入所有组数记录
    for (const exercise of exercises) {
      let { exercise_id, custom_name, body_part_id, sets } = exercise;

      if (!sets || !Array.isArray(sets)) {
        await connection.rollback();
        return res.status(400).json({ error: '训练项目数据格式错误' });
      }

      // 处理自定义项目：先插入 exercises 表获取真实 ID
      if (custom_name && !exercise_id) {
        if (!body_part_id) {
          await connection.rollback();
          return res.status(400).json({ error: '自定义项目需要指定训练部位' });
        }

        const [exerciseResult] = await connection.query<ResultSetHeader>(
          'INSERT INTO exercises (body_part_id, name) VALUES (?, ?)',
          [body_part_id, custom_name]
        );
        exercise_id = exerciseResult.insertId;
      }

      if (!exercise_id) {
        await connection.rollback();
        return res.status(400).json({ error: '训练项目ID不能为空' });
      }

      for (const set of sets) {
        const { set_number, reps, weight } = set;

        if (set_number === undefined || !reps) {
          await connection.rollback();
          return res.status(400).json({ error: '组数数据不完整' });
        }

        await connection.query(
          'INSERT INTO sets (log_id, exercise_id, set_number, reps, weight) VALUES (?, ?, ?, ?, ?)',
          [logId, exercise_id, set_number, reps, weight || null]
        );
      }
    }

    await connection.commit();

    res.json({
      success: true,
      message: '训练记录更新成功',
      log_id: parseInt(String(logId))
    });
  } catch (error) {
    await connection.rollback();
    console.error('更新训练记录失败:', error);
    res.status(500).json({ error: '更新训练记录失败' });
  } finally {
    connection.release();
  }
};
