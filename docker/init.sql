-- 健身记录应用数据库初始化脚本

-- 确保使用 UTF-8 字符集
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- 创建训练部位表
CREATE TABLE IF NOT EXISTS body_parts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL COMMENT '训练部位名称',
    icon VARCHAR(100) COMMENT '图标类名',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='训练部位表';

-- 创建训练项目表
CREATE TABLE IF NOT EXISTS exercises (
    id INT PRIMARY KEY AUTO_INCREMENT,
    body_part_id INT NOT NULL COMMENT '所属训练部位ID',
    name VARCHAR(100) NOT NULL COMMENT '训练项目名称',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (body_part_id) REFERENCES body_parts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='训练项目表';

-- 创建训练记录表
CREATE TABLE IF NOT EXISTS training_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    training_date DATE NOT NULL COMMENT '训练日期',
    notes TEXT COMMENT '训练备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='训练记录表';

-- 创建组数记录表
CREATE TABLE IF NOT EXISTS sets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    log_id INT NOT NULL COMMENT '所属训练记录ID',
    exercise_id INT NOT NULL COMMENT '训练项目ID',
    set_number INT NOT NULL COMMENT '组数序号',
    reps INT NOT NULL COMMENT '次数',
    weight DECIMAL(5,2) COMMENT '重量(kg)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (log_id) REFERENCES training_logs(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='组数记录表';

-- 创建索引以提高查询性能
CREATE INDEX idx_training_date ON training_logs(training_date);
CREATE INDEX idx_sets_log ON sets(log_id);
CREATE INDEX idx_sets_exercise ON sets(exercise_id);

-- 插入初始训练部位数据
INSERT INTO body_parts (name, icon) VALUES
('胸部', 'chest'),
('背部', 'back'),
('肩部', 'shoulder'),
('手臂', 'arm'),
('腿部', 'leg'),
('核心', 'core');

-- 插入常见训练项目数据
INSERT INTO exercises (body_part_id, name) VALUES
-- 胸部训练
(1, '平板卧推'),
(1, '上斜卧推'),
(1, '下斜卧推'),
(1, '哑铃飞鸟'),
(1, '俯卧撑'),

-- 背部训练
(2, '引体向上'),
(2, '高位下拉'),
(2, '杠铃划船'),
(2, '单臂划船'),
(2, '硬拉'),

-- 肩部训练
(3, '杠铃推举'),
(3, '哑铃侧平举'),
(3, '哑铃前平举'),
(3, '反向飞鸟'),
(3, '耸肩'),

-- 手臂训练
(4, '杠铃弯举'),
(4, '哑铃弯举'),
(4, '锤式弯举'),
(4, '三头下压'),
(4, '仰卧臂屈伸'),

-- 腿部训练
(5, '深蹲'),
(5, '腿举'),
(5, '腿弯举'),
(5, '腿屈伸'),
(5, '小腿提踵'),

-- 核心训练
(6, '平板支撑'),
(6, '仰卧起坐'),
(6, '卷腹'),
(6, '俄罗斯转体'),
(6, '登山者');
