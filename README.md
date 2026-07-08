# 💪 StrongeCode — 健身记录应用

一个简洁、好用的健身训练记录 Web 应用。支持按部位记录每组训练的重量与次数，查看历史记录和可视化进步曲线。

<p align="center">
  <img src="https://img.shields.io/badge/react-19-blue?logo=react" alt="React">
  <img src="https://img.shields.io/badge/express-5-green?logo=express" alt="Express">
  <img src="https://img.shields.io/badge/typescript-5-blue?logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/mysql-8.0-orange?logo=mysql" alt="MySQL">
  <img src="https://img.shields.io/badge/docker-ready-brightgreen?logo=docker" alt="Docker">
  <img src="https://img.shields.io/badge/license-MIT-lightgrey" alt="License">
</p>

## ✨ 功能特点

- 🔐 **密码保护** — Session 认证，保护你的训练数据
- 💪 **训练记录** — 按部位选择项目，记录每组次数与重量
- 📊 **进步曲线** — Recharts 可视化图表，直观展示训练进步
- 📱 **移动优先** — 专为手机使用设计的拟态（Neumorphism）风格 UI
- 📋 **历史回顾** — 按日期浏览、编辑历史训练记录
- 🚀 **一键部署** — Docker Compose 三容器编排，开箱即用

## 🧱 技术栈

| 层级 | 技术 |
|------|------|
| **前端** | React 19 · TypeScript · React Router 7 · Recharts · Sass · Axios |
| **后端** | Node.js · Express 5 · TypeScript · Session 认证 · bcryptjs |
| **数据库** | MySQL 8.0 · utf8mb4 |
| **部署** | Docker · Docker Compose · Nginx 反向代理 |

## 📁 项目结构

```
strongecode/
├── frontend/                  # React 前端
│   ├── src/
│   │   ├── components/
│   │   │   ├── charts/        #   图表组件 (ProgressChart)
│   │   │   ├── common/        #   通用组件 (NeuCard, NeuButton, LoadingSpinner)
│   │   │   └── training/      #   训练组件 (BodyPartSelector, ExerciseSelector, SetInput)
│   │   ├── pages/             # 页面 (Home, Login, NewTraining, History, Stats)
│   │   ├── services/          # API 封装 (Axios)
│   │   ├── styles/            # 全局样式 & 拟态主题
│   │   └── utils/             # 工具函数
│   ├── public/
│   ├── Dockerfile             # 多阶段构建 (Node build → Nginx serve)
│   └── nginx.conf             # Nginx 配置 + API 代理
├── backend/                   # Express 后端
│   ├── src/
│   │   ├── config/            # 配置 & 数据库连接池
│   │   ├── controllers/       # 控制器 (auth, training, stats)
│   │   ├── routes/            # 路由定义
│   │   ├── middleware/        # 中间件 (auth, error)
│   │   └── __tests__/         # Jest 测试 (73 个用例)
│   ├── Dockerfile
│   └── jest.config.js
├── docker/
│   └── init.sql               # 数据库初始化 (建表 + 种子数据)
├── docker-compose.yml         # 三容器编排
└── README.md
```

## 🚀 快速开始（Docker）

最简方式——只需 Docker 环境：

```bash
# 1. 克隆仓库
git clone <your-repo-url>.git
cd strongecode

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 填入你的密码

# 3. 一键启动
docker-compose up -d

# 4. 打开浏览器
# http://localhost
```

首次启动会自动创建数据库表并插入种子数据（6 个部位 + 30 个训练项目）。

## 🛠 本地开发

### 前置要求

- Node.js 18+
- MySQL 8.0
- npm

### 安装与运行

```bash
# 安装依赖
cd frontend && npm install
cd ../backend && npm install
cd ..

# 初始化数据库
mysql -u root -p < docker/init.sql

# 启动后端 (http://localhost:3001)
cd backend
cp .env.example .env   # 编辑填入数据库密码
npm run dev

# 启动前端 (http://localhost:3000)
cd ../frontend
cp .env.example .env   # 编辑填入 API 地址
npm start
```

### 运行测试

```bash
cd backend
npm test                 # 73 个测试用例全部通过
```

## 🔧 环境变量

### 根目录 `.env`（Docker Compose 使用）

| 变量 | 说明 | 示例 |
|------|------|------|
| `DB_PASSWORD` | MySQL root 密码 | `your_secure_password` |
| `SESSION_SECRET` | Session 加密密钥 | `random-secret-string` |
| `APP_PASSWORD` | 应用登录密码 | `your_login_password` |
| `FRONTEND_URL` | 前端访问地址 | `http://localhost` |

### 后端 `backend/.env`（本地开发使用）

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `PORT` | 服务端口 | `3001` |
| `NODE_ENV` | 运行环境 | `development` |
| `DB_HOST` | 数据库地址 | `localhost` |
| `DB_PORT` | 数据库端口 | `3306` |
| `DB_USER` | 数据库用户 | `root` |
| `DB_PASSWORD` | 数据库密码 | — |
| `DB_NAME` | 数据库名 | `fitness_db` |
| `SESSION_SECRET` | Session 密钥 | — |
| `APP_PASSWORD` | 登录密码 | — |

### 前端 `frontend/.env`（本地开发使用）

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `REACT_APP_API_URL` | 后端 API 地址 | `http://localhost:3001/api` |

## 🐳 Docker 服务

| 服务 | 容器名 | 端口 |
|------|--------|------|
| 前端 (Nginx) | `fitness_frontend` | `80` |
| 后端 (Express) | `fitness_backend` | `3001` |
| 数据库 (MySQL) | `fitness_mysql` | `3306` |

```bash
docker-compose up -d        # 启动
docker-compose down         # 停止
docker-compose logs -f      # 查看日志
docker-compose restart      # 重启
```

## 🩺 健康检查

```bash
curl http://localhost/health        # {"status":"ok"}
curl http://localhost:3001/health   # {"status":"ok"}
```

## 📈 数据备份

```bash
# 导出
docker-compose exec mysql mysqldump -u root -p fitness_db > backup.sql

# 恢复
docker-compose exec -T mysql mysql -u root -p fitness_db < backup.sql
```

## 🖼 界面预览

应用采用拟态（Neumorphism）设计风格，专为移动端优化：

- **登录页** — 简洁密码验证，支持密码可见切换
- **首页** — 快捷入口：新建训练 / 历史记录 / 统计图表
- **训练记录页** — 部位选择 → 项目选择 → 逐组输入重量次数
- **历史记录页** — 按日期查看、编辑历史训练
- **统计图表页** — 按项目查看重量/次数变化趋势

## 🔒 安全建议

- 部署前务必修改 `.env` 中的默认密码
- 生产环境建议配置 HTTPS（Nginx + Let's Encrypt）
- 限制服务器防火墙仅开放 80/443 端口
- MySQL 数据卷 `mysql_data` 定期备份

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源许可证。

---

**Made with 💪 and ❤️**
