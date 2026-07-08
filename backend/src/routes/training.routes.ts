import { Router } from 'express';
import {
  getBodyParts,
  getExercises,
  getAllExercises,
  saveTraining,
  getTrainingByDate,
  getTrainingHistory,
  getTrainingDetail,
  deleteTraining,
  deleteExercise,
  updateTraining
} from '../controllers/training.controller';
import { authenticateSession } from '../middleware/auth.middleware';

const router = Router();

// 所有训练路由都需要认证
router.use(authenticateSession);

// 获取训练部位
router.get('/body-parts', getBodyParts);

// 获取指定部位的训练项目
router.get('/exercises/:bodyPartId', getExercises);

// 获取所有训练项目
router.get('/exercises', getAllExercises);

// 保存训练记录
router.post('/save', saveTraining);

// 获取指定日期的训练记录
router.get('/date/:date', getTrainingByDate);

// 获取历史记录（分页）
router.get('/history', getTrainingHistory);

// 获取训练记录详情
router.get('/detail/:logId', getTrainingDetail);

// 删除训练项目（预设项目）—— 必须在 DELETE /:logId 之前
router.delete('/exercises/:exerciseId', deleteExercise);

// 更新训练记录
router.put('/:logId', updateTraining);

// 删除训练记录
router.delete('/:logId', deleteTraining);

export default router;
