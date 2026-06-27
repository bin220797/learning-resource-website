# 部署到 Railway + CSTCloud

## 架构说明

- **Railway** (Docker): 运行 Node.js + Express 后端，通过 Linux 版 rclone 操作 S3
- **CSTCloud** (中国科技云数据胶囊): 存储上传的文件和 JSON 数据
- **数据持久化**: 后台增删改资源后，JSON 数据自动同步到 CSTCloud；重新部署时自动从 CSTCloud 恢复

> **重要**: CSTCloud 的 S3 代理对非 Windows 网络栈有限制，Railway 部署后 rclone 是否能连通**需要实际测试**。如果 Railway 也被拦截，建议切换到 **Cloudflare R2**。

---

## 本地开发（Windows）

### 1. 安装依赖

```bash
npm install
```

### 2. 放置 rclone

将 `rclone.exe` 和 `rclone.conf` 放到项目 `rclone/` 文件夹下。

`rclone.conf` 示例：
```ini
[mycloud]
type = s3
provider = Other
access_key_id = AKIATNXVV4W1M5B7B1D9
secret_access_key = M=YXXKMQMXRUL1CTSPPTB97ZS1254EPGV0ZAQW5L
region =
endpoint = s3.cstcloud.cn
acl = private
force_path_style = true
```

> **获取密钥**: 登录 [中国科技云数据胶囊](https://www.cstcloud.cn/) → 我的数据 → S3 访问管理 → 新增 AccessKey

### 3. 配置环境变量

复制 `.env.example` 为 `.env`（或直接创建）：

```bash
# CSTCloud 配置
QINIU_ACCESS_KEY=AKIATNXVV4W1M5B7B1D9
QINIU_SECRET_KEY=M=YXXKMQMXRUL1CTSPPTB97ZS1254EPGV0ZAQW5L
QINIU_BUCKET=bin220797
QINIU_ENDPOINT=https://s3.cstcloud.cn
QINIU_ZONE=

# 本地端口
PORT=8080
```

### 4. 启动本地服务器

```bash
npm start
```

---

## Railway 部署步骤

### 1. 推送到 GitHub

```bash
git add .
git commit -m "add Railway Dockerfile with rclone"
git push origin main
```

> **注意**: `rclone.exe` 和 `uploads/` 大文件已在 `.gitignore` 中排除，不会推送到 GitHub。

### 2. 在 Railway 创建项目

1. 登录 [Railway Dashboard](https://railway.app/)
2. 点击 **New Project** → **Deploy from GitHub repo**
3. 选择你的仓库，Railway 会自动识别 `Dockerfile`

### 3. 配置环境变量

在 Railway 的 **Variables** 标签页添加：

| 变量名 | 值 |
|--------|-----|
| `QINIU_ACCESS_KEY` | `AKIATNXVV4W1M5B7B1D9` |
| `QINIU_SECRET_KEY` | `M=YXXKMQMXRUL1CTSPPTB97ZS1254EPGV0ZAQW5L` |
| `QINIU_BUCKET` | `bin220797` |
| `QINIU_ENDPOINT` | `https://s3.cstcloud.cn` |
| `QINIU_ZONE` | （留空） |
| `RAILWAY_ENVIRONMENT` | `production` |

### 4. 部署

Railway 会自动构建 Docker 镜像并部署。部署成功后你会获得一个 `https://xxx.up.railway.app` 的地址。

---

## 验证 Railway 连通性

部署后，打开 Railway 的 **Logs** 查看启动日志：

- 如果看到 `✅ CSTCloud 存储已启用 (rclone 模式) 环境: Cloud (Railway/Linux)` → rclone 安装成功
- 如果看到 `已从CSTCloud恢复: data/resources.json` → 数据恢复成功
- 如果看到 rclone 报错或 401 → CSTCloud 拦截了 Railway 的网络，需要换存储

快速验证 API：
```bash
curl https://xxx.up.railway.app/api/resources
```

---

## 如果 Railway 被 CSTCloud 拦截

如果 Railway 无法连通 CSTCloud，建议切换到 **Cloudflare R2**：

1. 注册/登录 [Cloudflare R2](https://dash.cloudflare.com/)
2. 创建 R2 Bucket，生成 S3 兼容的 Access Key
3. 修改 `rclone.conf` 和 `.env` 中的 endpoint、ak、sk
4. R2 没有网络限制，AWS SDK 和 rclone 都能正常工作

---

## 常见问题

**Q: rclone 在 Railway 上怎么安装？**  
A: 已写在 `Dockerfile` 中，构建时会自动下载 Linux 版 rclone 并安装到 `/usr/local/bin/rclone`。

**Q: 为什么本地用 rclone.exe，Railway 用系统 rclone？**  
A: `config/cstcloud.js` 会自动检测平台：Windows 用项目目录的 `rclone.exe`，Linux/Railway 用系统 PATH 中的 `rclone`。

**Q: 文件上传大小限制？**  
A: Express 配置为 5GB，`rclone copyto` 支持大文件上传。

**Q: 数据库在 Railway 上怎么办？**  
A: Railway 有免费的 PostgreSQL/MySQL 插件，或继续使用文件存储模式（`data/resources.json` 自动同步到 CSTCloud）。
