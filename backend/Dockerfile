FROM node:18-alpine

WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖（包括生产依赖和TypeScript）
RUN npm install --omit=dev && npm install -g typescript@6

# 复制源代码
COPY . .

# 构建TypeScript
RUN npm run build

# 暴露端口
EXPOSE 3001

# 启动应用
CMD ["node", "dist/server.js"]
