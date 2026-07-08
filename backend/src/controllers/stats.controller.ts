import { Request, Response } from 'express';
import pool from '../config/database';

// 获取总体统计概览
export const getSummary = async (req: Request, res: Response) => {
  try {
    // 总训练次数
    const [trainingCount] = await pool.query(
      'SELECT COUNT(DISTINCT training_date) as total FROM training_logs'
    );

    // 总组数
    const [setsCount] = await pool.query(
      'SELECT COUNT(*) as total FROM sets'
    );

    // 总训练项目数（有记录的项目）
    const [exerciseCount] = await pool.query(
      'SELECT COUNT(DISTINCT exercise_id) as total FROM sets'
    );

    // 最近一次训练日期
    const [lastTraining] = await pool.query(
      'SELECT MAX(training_date) as last_date FROM training_logs'
    );

    res.json({
      total_trainings: (trainingCount as any)[0].total || 0,
      total_sets: (setsCount as any)[0].total || 0,
      total_exercises: (exerciseCount as any)[0].total || 0,
      last_training_date: (lastTraining as any)[0].last_date || null
    });
  } catch (error) {
    console.error('获取统计概览失败:', error);
    res.status(500).json({ error: '获取统计概览失败' });
  }
};

// 获取指定项目的进步数据
export const getProgress = async (req: Request, res: Response) => {
  try {
    const { exerciseId } = req.params;
    const { type } = req.query; // 'weight' 或 'reps'

    if (!exerciseId || isNaN(parseInt(String(exerciseId)))) {
      return res.status(400).json({ error: '无效的训练项目ID' });
    }

    // 获取项目信息
    const [exerciseInfo] = await pool.query(
      'SELECT name, body_part_id FROM exercises WHERE id = ?',
      [exerciseId]
    );

    if (!Array.isArray(exerciseInfo) || exerciseInfo.length === 0) {
      return res.status(404).json({ error: '训练项目不存在' });
    }

    // 获取该项目的所有训练记录
    const [records] = await pool.query(`
      SELECT
        s.set_number,
        s.reps,
        s.weight,
        t.training_date,
        t.created_at
      FROM sets s
      JOIN training_logs t ON s.log_id = t.id
      WHERE s.exercise_id = ?
      ORDER BY t.training_date, s.set_number
    `, [exerciseId]);

    // 按训练日期分组
    const grouped = (records as any[]).reduce((acc, record) => {
      const date = record.training_date;
      if (!acc[date]) {
        acc[date] = {
          date: date,
          sets: []
        };
      }
      acc[date].sets.push({
        set_number: record.set_number,
        reps: record.reps,
        weight: record.weight
      });
      return acc;
    }, {});

    // 计算每次训练的最大重量和最大次数
    const progressData = Object.values(grouped).map((session: any) => {
      const maxWeight = Math.max(...session.sets.filter((s: any) => s.weight !== null).map((s: any) => s.weight), 0);
      const maxReps = Math.max(...session.sets.map((s: any) => s.reps), 0);
      const avgWeight = session.sets.filter((s: any) => s.weight !== null)
        .reduce((sum: number, s: any) => sum + s.weight, 0) / session.sets.filter((s: any) => s.weight !== null).length || 0;

      return {
        date: session.date,
        maxWeight: Math.round(maxWeight * 10) / 10,
        maxReps,
        avgWeight: Math.round(avgWeight * 10) / 10,
        setCount: session.sets.length
      };
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    res.json({
      exercise: exerciseInfo[0],
      progress: progressData
    });
  } catch (error) {
    console.error('获取进步数据失败:', error);
    res.status(500).json({ error: '获取进步数据失败' });
  }
};

// 获取最近训练记录（用于首页展示）
export const getRecentTrainings = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;

    const [logs] = await pool.query(`
      SELECT
        id,
        training_date,
        notes,
        created_at
      FROM training_logs
      ORDER BY training_date DESC, created_at DESC
      LIMIT ?
    `, [limit]);

    // 为每个记录获取简要信息
    const results = await Promise.all(
      (logs as any[]).map(async (log) => {
        const [stats] = await pool.query(`
          SELECT
            COUNT(DISTINCT exercise_id) as exercise_count,
            COUNT(*) as total_sets
          FROM sets
          WHERE log_id = ?
        `, [log.id]);

        // 获取本次训练涉及的部位
        const [bodyPartsResult] = await pool.query(`
          SELECT GROUP_CONCAT(DISTINCT b.name SEPARATOR ', ') as body_parts
          FROM sets s
          JOIN exercises e ON s.exercise_id = e.id
          JOIN body_parts b ON e.body_part_id = b.id
          WHERE s.log_id = ?
        `, [log.id]);

        return {
          id: log.id,
          training_date: log.training_date,
          notes: log.notes,
          exercise_count: (stats as any)[0].exercise_count,
          total_sets: (stats as any)[0].total_sets,
          body_parts: (bodyPartsResult as any)[0]?.body_parts || ''
        };
      })
    );

    res.json(results);
  } catch (error) {
    console.error('获取最近训练记录失败:', error);
    res.status(500).json({ error: '获取最近训练记录失败' });
  }
};

// 获取指定日期范围的统计数据
export const getDateRangeStats = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: '开始日期和结束日期不能为空' });
    }

    // 指定日期范围的训练次数
    const [trainingCount] = await pool.query(
      'SELECT COUNT(DISTINCT training_date) as total FROM training_logs WHERE training_date BETWEEN ? AND ?',
      [startDate, endDate]
    );

    // 指定日期范围的总组数
    const [setsCount] = await pool.query(`
      SELECT COUNT(*) as total
      FROM sets s
      JOIN training_logs t ON s.log_id = t.id
      WHERE t.training_date BETWEEN ? AND ?
    `, [startDate, endDate]);

    // 指定日期范围的总体积（重量×次数）
    const [volume] = await pool.query(`
      SELECT SUM(s.weight * s.reps) as total
      FROM sets s
      JOIN training_logs t ON s.log_id = t.id
      WHERE t.training_date BETWEEN ? AND ? AND s.weight IS NOT NULL
    `, [startDate, endDate]);

    // 按日期统计的训练量
    const [dailyStats] = await pool.query(`
      SELECT
        t.training_date,
        COUNT(DISTINCT t.id) as training_count,
        SUM(s.weight * s.reps) as daily_volume
      FROM training_logs t
      LEFT JOIN sets s ON t.id = s.log_id
      WHERE t.training_date BETWEEN ? AND ?
      GROUP BY t.training_date
      ORDER BY t.training_date
    `, [startDate, endDate]);

    res.json({
      training_count: (trainingCount as any)[0].total || 0,
      total_sets: (setsCount as any)[0].total || 0,
      total_volume: Math.round((volume as any)[0].total || 0),
      daily_stats: dailyStats
    });
  } catch (error) {
    console.error('获取日期范围统计失败:', error);
    res.status(500).json({ error: '获取日期范围统计失败' });
  }
};
