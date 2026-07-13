# Strong Tracking

一个全栈健身追踪应用，帮助用户记录训练、追踪进度、查看个人最佳记录。

---

## 技术栈

| 层级 | 技术 |
|------|------|
| **后端框架** | Spring Boot 3.4.1 (Java 21) |
| **数据库** | SQLite (via Hibernate + SQLiteDialect) |
| **ORM** | Spring Data JPA (Hibernate) |
| **认证** | JWT (jjwt 0.12.6) + BCrypt |
| **构建工具** | Maven |
| **前端框架** | React 18 + TypeScript |
| **构建工具** | Vite 5 |
| **样式** | Tailwind CSS 3 |
| **图表** | Recharts + react-calendar-heatmap |
| **图标** | Lucide React |
| **容器化** | Docker + Docker Compose |

---

## 项目结构

```
StrongTracking/
├── backend/                          # Java Spring Boot 后端
│   ├── src/main/java/com/strongtracking/
│   │   ├── StrongTrackingApplication.java   # 应用入口
│   │   ├── config/
│   │   │   ├── AppConfig.java               # PasswordEncoder Bean
│   │   │   ├── SecurityConfig.java          # Spring Security 配置
│   │   │   └── JwtConfig.java               # JWT 配置属性
│   │   ├── model/
│   │   │   ├── User.java                    # 用户实体
│   │   │   ├── Workout.java                 # 训练记录实体
│   │   │   ├── Exercise.java                # 动作实体
│   │   │   └── WorkoutSet.java              # 训练组实体
│   │   ├── repository/                      # Spring Data JPA 仓库
│   │   ├── service/
│   │   │   ├── AuthService.java             # 认证逻辑
│   │   │   ├── WorkoutService.java          # 训练 CRUD
│   │   │   ├── ExerciseService.java         # 动作管理 + 预设种子
│   │   │   ├── StatsService.java            # 统计数据
│   │   │   ├── AdminService.java            # 管理功能
│   │   │   └── AdminSeedService.java        # 管理员自动提升
│   │   ├── controller/                      # REST 控制器
│   │   ├── dto/                             # 请求/响应 DTO
│   │   ├── security/
│   │   │   ├── JwtTokenProvider.java        # JWT 令牌生成与验证
│   │   │   ├── JwtAuthenticationFilter.java # 认证过滤器
│   │   │   └── UserPrincipal.java           # UserDetails 实现
│   │   └── exception/
│   │       ├── ErrorResponse.java
│   │       └── GlobalExceptionHandler.java
│   ├── src/main/resources/
│   │   └── application.yml                  # 应用配置
│   ├── pom.xml
│   ├── mvnw / mvnw.cmd                      # Maven Wrapper
│   └── Dockerfile
├── frontend/                               # React + TypeScript 前端
│   ├── src/
│   │   ├── App.tsx                          # 路由定义
│   │   ├── main.tsx                         # 入口
│   │   ├── components/
│   │   │   └── Layout.tsx                   # 侧边栏导航 + 移动端底部导航
│   │   ├── pages/
│   │   │   ├── Login.tsx                    # 登录页
│   │   │   ├── Register.tsx                 # 注册页
│   │   │   ├── Dashboard.tsx                # 仪表盘
│   │   │   ├── WorkoutList.tsx              # 训练列表
│   │   │   ├── WorkoutForm.tsx              # 新建/编辑训练
│   │   │   ├── WorkoutDetail.tsx            # 训练详情
│   │   │   ├── Exercises.tsx                # 动作库
│   │   │   ├── ProgressPage.tsx             # 进度图表
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.tsx       # 管理后台统计
│   │   │       ├── AdminUsers.tsx           # 用户管理
│   │   │       └── AdminUserDetail.tsx      # 用户详情
│   │   ├── hooks/
│   │   │   ├── useAuth.tsx                  # 认证上下文
│   │   │   └── useTheme.tsx                 # 暗色/亮色主题
│   │   ├── lib/
│   │   │   └── api.ts                       # API 客户端
│   │   └── types/
│   │       └── index.ts                     # TypeScript 类型
│   ├── package.json
│   ├── vite.config.ts                       # Vite + API 代理
│   ├── tailwind.config.js
│   └── Dockerfile
├── data/                                   # SQLite 数据库文件
│   └── strongtracking.db
├── docker-compose.yml                      # 开发环境
├── docker-compose.prod.yml                 # 生产环境
└── .env.example                            # 环境变量模板
```

---

### 服务地址

| 服务 | 地址 | 说明 |
|------|------|------|
| 前端 | `http://localhost:3000` | Vite 开发服务器 |
| 后端 API | `http://localhost:18735` | Spring Boot 服务 |
| API 文档 | `http://localhost:18735/api/health` | 健康检查 |

---

## 功能模块

### 用户认证

- **注册** — 邮箱 + 用户名 + 密码注册
- **登录** — 邮箱 + 密码登录，返回 JWT Token
- **Token** — 默认有效期 24 小时（可在 `.env` 中配置）

### 仪表盘

首页展示:
- 训练热力图（类似 GitHub 贡献日历）
- 连续打卡天数 / 最长连续记录
- 各动作个人最佳记录

### 训练记录

- 新建训练 — 选择动作、组数、重量、次数、备注
- 训练列表 — 按月份分组展示，支持分页和日期筛选
- 训练详情 — 查看每组数据，支持编辑/删除

### 进度图表

- 按动作查看重量变化折线图
- 显示最大重量和平均重量
- 数据摘要: 训练次数、最大重量、最新重量、起步重量

### 动作库

- 内置 10 个系统预设动作（胸部、背部、腿部、肩部、手臂、核心）
- 支持添加自定义动作
- 支持删除自定义动作（预设动作不可删除）

### 管理后台（仅管理员可见）

- 系统概览 — 总用户数、总训练次数、本周新用户、本周活跃用户
- 用户管理 — 分页列表，搜索，查看用户详情
- 重置密码 — 管理员可修改任何用户的密码
- 删除用户 — 删除用户及其所有训练数据

---

## API 接口

### 认证 `/api/auth`

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/auth/register` | 注册 | 无 |
| POST | `/api/auth/login` | 登录 | 无 |
| GET | `/api/auth/me` | 获取当前用户 | Bearer Token |

### 训练 `/api/workouts`

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/workouts` | 训练列表（分页、日期筛选） | Bearer Token |
| GET | `/api/workouts/{id}` | 训练详情 | Bearer Token |
| POST | `/api/workouts` | 创建训练 | Bearer Token |
| PUT | `/api/workouts/{id}` | 更新训练 | Bearer Token |
| DELETE | `/api/workouts/{id}` | 删除训练 | Bearer Token |

### 动作 `/api/exercises`

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/exercises` | 动作列表（预设 + 自定义） | Bearer Token |
| POST | `/api/exercises` | 创建自定义动作 | Bearer Token |
| DELETE | `/api/exercises/{id}` | 删除自定义动作 | Bearer Token |

### 统计 `/api/stats`

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/stats/progress/{exerciseId}` | 动作进度数据 | Bearer Token |
| GET | `/api/stats/heatmap` | 热力图数据 | Bearer Token |
| GET | `/api/stats/overview` | 概览统计 + PR | Bearer Token |

### 管理 `/api/admin`（仅管理员）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/stats` | 系统统计 |
| GET | `/api/admin/users` | 用户列表（分页、搜索） |
| GET | `/api/admin/users/{id}` | 用户详情 |
| PUT | `/api/admin/users/{id}/password` | 重置密码 |
| DELETE | `/api/admin/users/{id}` | 删除用户 |

### 健康检查

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | `{"status": "ok"}` |

---

## 本地开发与调试

### 后端

```bash
cd backend

# 使用 Maven Wrapper 启动
# 使用maven3.0版本以上的都可以，settings里下载源换成阿里云或者其他都可以
./mvnw spring-boot:run

# 或先编译再运行 jdk用21的 
./mvnw clean package -DskipTests
java -jar target/strongtracking-3.0.0.jar
```

后端默认运行在 `http://localhost:18735`。

### 前端 node版本用20.1以上

```bash
cd frontend
npm install
npm run dev
```

前端开发服务器默认运行在 `http://localhost:3000`，API 请求会自动代理到 `http://localhost:18735`。
为啥是18735，我随便设置的，可以在application.yml里改下就行

### 数据库

我直接使用了sqllite，这边直接把data目录下的db文件打开即是库了，也没有几个表说是。

## 总结
需要开发 则下载maven、jdk、node这些，最好搭一个数据库工具来编辑db文件，或者idea内也可以打开db文件。
需要运行服务 下载jdk即可，jdk11后我记得不分jre了，所以直接安排jdk就行。