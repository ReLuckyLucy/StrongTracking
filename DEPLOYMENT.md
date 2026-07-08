# 健身记录应用 - 部署指南

## 服务器部署步骤

### 1. 服务器准备

确保您的服务器满足以下要求：
- 4核 CPU
- 4GB 内存
- 已安装 Docker 和 Docker Compose
- 已开放 80 端口（HTTP）

### 2. 上传代码到服务器

```bash
# 在本地打包代码
tar -czf fitness-app.tar.gz \
  frontend/ \
  backend/ \
  docker/ \
  docker-compose.yml \
  .env.example \
  README.md

# 上传到服务器（使用scp）
scp fitness-app.tar.gz user@your-server:/tmp/

# 在服务器上解压
ssh user@your-server
cd /opt/fitness
tar -xzf /tmp/fitness-app.tar.gz
```

### 3. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量
nano .env
```

设置以下变量：
- `DB_PASSWORD`: MySQL数据库密码（建议使用强密码）
- `SESSION_SECRET`: Session密钥（建议使用随机字符串）
- `APP_PASSWORD`: 应用登录密码
- `FRONTEND_URL`: 您的域名（如 http://your-domain.com）

### 4. 启动服务

```bash
# 构建并启动所有容器
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 5. 验证部署

```bash
# 检查前端
curl http://localhost/

# 检查后端健康状态
curl http://localhost:3001/health

# 检查数据库连接
docker-compose exec backend npm run test
```

### 6. 配置域名（可选）

如果您有域名，可以配置反向代理：

#### 使用Nginx：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### 配置HTTPS（使用Let's Encrypt）：

```bash
# 安装certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

### 7. 数据备份

#### 创建备份脚本：

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backup/fitness"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# 备份MySQL
docker-compose exec -T mysql mysqldump -u root -p${DB_PASSWORD} fitness_db > $BACKUP_DIR/fitness_db_$DATE.sql

# 备份Docker volumes
docker run --rm --volumes-from fitness_mysql -v $BACKUP_DIR:/backup alpine tar czf /backup/mysql_volume_$DATE.tar.gz /var/lib/mysql

# 保留最近7天的备份
find $BACKUP_DIR -name "fitness_db_*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "mysql_volume_*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

#### 设置定时备份：

```bash
# 编辑crontab
crontab -e

# 每天凌晨2点执行备份
0 2 * * * /opt/fitness/backup.sh
```

### 8. 监控和维护

#### 查看服务状态：

```bash
# 检查容器状态
docker-compose ps

# 查看资源使用
docker stats

# 查看日志
docker-compose logs --tail=100 -f
```

#### 重启服务：

```bash
# 重启所有服务
docker-compose restart

# 重启单个服务
docker-compose restart backend
```

#### 更新应用：

```bash
# 拉取最新代码
git pull

# 重新构建并启动
docker-compose up -d --build

# 清理旧镜像
docker image prune -f
```

### 9. 故障排除

#### 数据库连接问题：

```bash
# 检查MySQL日志
docker-compose logs mysql

# 进入MySQL容器
docker-compose exec mysql bash

# 测试连接
mysql -u root -p
```

#### 后端API问题：

```bash
# 检查后端日志
docker-compose logs backend

# 进入后端容器
docker-compose exec backend sh

# 检查环境变量
env | grep DB_
```

#### 前端问题：

```bash
# 检查nginx日志
docker-compose logs frontend

# 进入nginx容器
docker-compose exec frontend sh

# 检查nginx配置
cat /etc/nginx/conf.d/default.conf
```

### 10. 性能优化

#### MySQL优化：

编辑 `docker-compose.yml` 添加MySQL配置：

```yaml
mysql:
  command: [
    "--max-connections=100",
    "--innodb-buffer-pool-size=256M",
    "--innodb-log-file-size=64M"
  ]
```

#### 应用优化：

```bash
# 限制日志大小
docker-compose logs --tail=1000

# 清理未使用的资源
docker system prune -a

# 监控资源使用
docker stats --no-stream
```

### 11. 安全建议

1. **防火墙配置**：
```bash
# 只开放必要端口
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

2. **定期更新**：
```bash
# 更新系统
sudo apt-get update && sudo apt-get upgrade

# 更新Docker
sudo apt-get install docker-ce docker-ce-cli containerd.io
```

3. **密码策略**：
- 使用强密码
- 定期更换密码
- 不使用默认密码

### 12. 资源限制

如需限制容器资源使用，编辑 `docker-compose.yml`：

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

## 快速参考

### 常用命令

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看日志
docker-compose logs -f

# 进入容器
docker-compose exec backend sh

# 备份数据库
docker-compose exec mysql mysqldump -u root -p fitness_db > backup.sql

# 恢复数据库
docker-compose exec -T mysql mysql -u root -p fitness_db < backup.sql
```

### 环境变量

| 变量 | 说明 | 示例 |
|------|------|------|
| DB_PASSWORD | MySQL密码 | MyStr0ngP@ssw0rd |
| SESSION_SECRET | Session密钥 | random-secret-key-123 |
| APP_PASSWORD | 登录密码 | MyLoginP@ss |
| FRONTEND_URL | 前端URL | http://example.com |

### 默认端口

| 服务 | 端口 |
|------|------|
| 前端 | 80 |
| 后端API | 3001 |
| MySQL | 3306 |

## 支持

如有问题，请查看：
- 项目README.md
- Docker日志：`docker-compose logs`
- 应用日志：容器内 `/app/logs/`

祝您使用愉快！
