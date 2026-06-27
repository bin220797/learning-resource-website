FROM node:20-slim

# 安装系统依赖 + rclone
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    unzip \
    ca-certificates \
    && curl -fsSL -o /tmp/rclone.zip https://downloads.rclone.org/rclone-current-linux-amd64.zip \
    && unzip -q /tmp/rclone.zip -d /tmp \
    && cp /tmp/rclone-*-linux-amd64/rclone /usr/local/bin/rclone \
    && chmod +x /usr/local/bin/rclone \
    && rm -rf /tmp/rclone.zip /tmp/rclone-*-linux-amd64 \
    && apt-get purge -y curl unzip \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 先复制依赖文件并安装（利用 Docker 缓存层）
COPY package*.json ./
RUN npm install --production

# 复制项目代码
COPY . .

# Railway 会自动提供 PORT 环境变量
EXPOSE 8080

CMD ["node", "server.js"]
