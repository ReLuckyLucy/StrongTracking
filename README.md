


<h1 align="center">Strong Tracking </h1>
<h1 align="center">一个全栈健身追踪应用，帮助用户记录训练、追踪进度、查看个人最佳记录。</h1>

<p align="center">
    <img alt="GitHub" src="https://img.shields.io/github/license/ReLuckyLucy/StrongTracking">
    <img alt="GitHub top language" src="https://img.shields.io/github/languages/top/ReLuckyLucy/StrongTrackinge">
    <img alt="GitHub release (latest by date including pre-releases)" src="https://img.shields.io/github/v/release/ReLuckyLucy/StrongTracking?include_prereleases">
    <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/ReLuckyLucy/StrongTracking">
</p>
<p align="center">
    <img alt="GitHub code size in bytes" src="https://img.shields.io/github/languages/code-size/ReLuckyLucy/StrongTracking">
    <img alt="GitHub repo size" src="https://img.shields.io/github/repo-size/ReLuckyLucy/StrongTracking">
    <img alt="GitHub stars" src="https://img.shields.io/github/stars/ReLuckyLucy/StrongTracking?style=social">
</p>

## 🧱 项目架构

```
strong-tracking/
├── backend/                  # Python FastAPI 后端
│   ├── app/
│   │   ├── main.py           # 应用入口，CORS 配置，路由注册，管理员种子
│   │   ├── config.py         # 环境变量配置
│   │   ├── database.py       # 异步 SQLAlchemy 引擎
│   │   ├── models/
│   │   │   └── models.py     # User / Exercise / Workout / WorkoutSet ORM 模型
│   │   ├── schemas/
│   │   │   └── schemas.py    # Pydantic 请求/响应模型
│   │   ├── services/
│   │   │   └── auth.py       # bcrypt 密码哈希、JWT 令牌、认证依赖
│   │   └── api/
│   │       ├── auth.py       # 注册 / 登录 / 获取当前用户
│   │       ├── exercises.py  # 动作库 CRUD
│   │       ├── workouts.py   # 训练记录 CRUD
│   │       ├── stats.py      # 进度图表、热力图、概览统计
│   │       └── admin.py      # 管理员：用户管理、统计、密码重置
│   ├── alembic/              # 数据库迁移
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                 # React + TypeScript + Tailwind CSS 前端
│   ├── src/
│   │   ├── main.tsx          # 入口
│   │   ├── App.tsx           # 路由定义
│   │   ├── components/
│   │   │   └── Layout.tsx    # 侧边栏导航 + 移动端底部导航
│   │   ├── pages/
│   │   │   ├── Login.tsx         # 登录页
│   │   │   ├── Register.tsx      # 注册页
│   │   │   ├── Dashboard.tsx     # 仪表盘（热力图、PR 卡片、统计）
│   │   │   ├── WorkoutList.tsx   # 训练记录列表
│   │   │   ├── WorkoutForm.tsx   # 新建/编辑训练
│   │   │   ├── WorkoutDetail.tsx # 训练详情
│   │   │   ├── Exercises.tsx     # 动作库
│   │   │   ├── ProgressPage.tsx  # 进度图表（折线图）
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.tsx  # 管理后台统计
│   │   │       ├── AdminUsers.tsx      # 用户管理列表
│   │   │       └── AdminUserDetail.tsx # 用户详情 + 重置密码
│   │   ├── hooks/
│   │   │   ├── useAuth.tsx   # 认证上下文
│   │   │   └── useTheme.tsx  # 暗色/亮色主题
│   │   ├── lib/
│   │   │   └── api.ts        # API 客户端封装
│   │   └── types/
│   │       └── index.ts      # TypeScript 类型定义
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── Dockerfile
├── docker-compose.yml        # 一键启动：db + backend + frontend
└── .env.example              # 环境变量模板
```

---

## 🚀 快速启动

### 前置条件

- [Docker](https://www.docker.com/) 和 Docker Compose 已安装

### 一键启动

```bash
# 1. 克隆项目
git clone <repo-url>
cd strong-tracking

# 2. 复制环境变量文件并修改配置
cp .env.example .env
# 编辑 .env，设置 SECRET_KEY 和 ADMIN_EMAIL

# 3. 启动所有服务
docker compose up -d --build
```

启动后，三个服务会自动运行：

| 服务 | 地址 | 说明 |
|------|------|------|
| 前端 | `http://localhost:3000` | React 开发服务器 (Vite HMR) |
| 后端 API | `http://localhost:8000` | FastAPI 服务 |
| 数据库 | `localhost:5432` | PostgreSQL 15 |

### 停止项目

```bash
# 停止容器（保留数据）
docker compose down

# 停止并删除所有数据
docker compose down -v
```

### API 文档

启动后端后，FastAPI 自动生成的交互式文档：

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

## 👤 管理员配置

系统通过环境变量 `ADMIN_EMAIL` 自动将指定邮箱的用户提升为管理员。

### 配置方式

在 `.env` 文件中设置（从 `.env.example` 复制）：

```env
ADMIN_EMAIL=your@email.com   # ← 改为你的邮箱
```

### 成为管理员

1. 用配置的邮箱在前端注册账号（`http://localhost:3000/register`）
2. **重启 backend 容器**（启动时会自动检测并设置 `is_admin = true`）：

```bash
docker compose restart backend
```

3. 重新登录后，侧边栏会出现 🛡️ **「管理后台」** 入口

---

## 📖 功能模块

### 👤 用户认证

- **注册** — 邮箱 + 用户名 + 密码注册
- **登录** — 邮箱 + 密码登录，返回 JWT Token
- **Token** — 默认有效期 24 小时（可在 `.env` 中配置）

### 📊 仪表盘

首页提供：
- 📅 **训练热力图** — 类似 GitHub 的一整年训练日历
- 🔥 **连续打卡天数** / 最长连续记录
- 🏆 **个人最佳记录** — 每个动作的最大重量，按日期展示

### 🏋️ 训练记录

- **新建训练** — 选择动作 + 组数 + 重量 + 次数 + 备注
- **训练列表** — 按月份分组展示，支持分页
- **训练详情** — 查看每组数据，支持编辑/删除

### 📈 进度图表

- 按动作选择，查看重量变化**折线图**
- 显示最大重量（实线）和平均重量（虚线）
- 数据摘要：训练次数、最大重量、最新重量、起步重量

### 📚 动作库

- 内置系统预设动作（按类别分组：胸部、背部、腿部、肩部、手臂、核心）
- 支持**自定义动作**（添加/删除）
- 搜索过滤器

### 🛡️ 管理后台（仅管理员可见）

- **系统概览** — 总用户数、总训练次数、本周新用户、本周活跃用户
- **用户管理** — 分页列表，搜索，查看用户详情
- **重置密码** — 管理员可修改任何用户的密码
- **删除用户** — 删除用户及其所有训练数据（不能删自己）

---

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| **后端框架** | FastAPI (Python 3.12) |
| **数据库** | PostgreSQL 15 |
| **ORM** | SQLAlchemy 2.0 (异步) |
| **数据库迁移** | Alembic |
| **认证** | JWT (python-jose) + bcrypt |
| **前端框架** | React 18 + TypeScript |
| **构建工具** | Vite 5 |
| **样式** | Tailwind CSS |
| **图表** | Recharts (进度折线图) + react-calendar-heatmap (热力图) |
| **日期处理** | date-fns |
| **图标** | Lucide React |
| **容器化** | Docker + Docker Compose |

---

## 📡 API 接口一览

### 认证 (`/api/auth`)

| 方法 | 路径 | 说明 | 需登录 |
|------|------|------|--------|
| POST | `/register` | 注册 | ❌ |
| POST | `/login` | 登录 | ❌ |
| GET | `/me` | 当前用户信息 | ✅ |

### 训练 (`/api/workouts`)

| 方法 | 路径 | 说明 | 需登录 |
|------|------|------|--------|
| GET | `/` | 训练列表（分页） | ✅ |
| GET | `/{id}` | 训练详情（含组数据） | ✅ |
| POST | `/` | 创建训练 | ✅ |
| PUT | `/{id}` | 更新训练 | ✅ |
| DELETE | `/{id}` | 删除训练 | ✅ |

### 动作 (`/api/exercises`)

| 方法 | 路径 | 说明 | 需登录 |
|------|------|------|--------|
| GET | `/` | 动作列表 | ✅ |
| POST | `/` | 创建自定义动作 | ✅ |
| DELETE | `/{id}` | 删除自定义动作 | ✅ |

### 统计 (`/api/stats`)

| 方法 | 路径 | 说明 | 需登录 |
|------|------|------|--------|
| GET | `/progress/{exercise_id}` | 动作进度数据 | ✅ |
| GET | `/heatmap` | 热力图数据 | ✅ |
| GET | `/overview` | 概览统计 + PR | ✅ |

### 管理 (`/api/admin`) — **仅管理员**

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/stats` | 系统统计 |
| GET | `/users` | 用户列表（分页） |
| GET | `/users/{id}` | 用户详情 |
| PUT | `/users/{id}/password` | 重置用户密码 |
| DELETE | `/users/{id}` | 删除用户 |

### 健康检查

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | `{"status": "ok"}` |

---

## 🔧 开发

### 本地开发（不使用 Docker）

**后端：**
```bash
cd backend
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

**前端：**
```bash
cd frontend
npm install
npm run dev
```

### 数据库迁移

```bash
# 进入后端容器
docker compose exec backend sh

# 创建新迁移
alembic revision --autogenerate -m "describe change"

# 应用迁移
alembic upgrade head
```

---

## 🔑 环境变量

参考 `.env.example`：

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `DATABASE_URL` | PostgreSQL 连接串 | `postgresql+asyncpg://fituser:fitpass@localhost:5432/fitdb` |
| `SECRET_KEY` | JWT 签名密钥 | `change-me` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token 过期时间（分钟） | `1440`（24 小时） |
| `ADMIN_EMAIL` | 自动提升为管理员的邮箱 | 空 |

---

欢迎各位进行品评指正