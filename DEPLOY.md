# 部署到 Render + 七牛云

## 架构说明

- **Render** (免费): 运行 Node.js + Express 后端，处理 API 和后台管理
- **七牛云** (免费 10GB): 存储上传的文件（.exe, .mp4, .rar, .pdf 等）和 JSON 数据
- **数据持久化**: 后台增删改资源后，JSON 数据自动同步到七牛云；重新部署时自动从七牛云恢复

---

## 部署前准备

### 1. 本地安装依赖

```bash
npm install
```

### 2. 配置七牛云环境变量

复制 `.env.example` 为 `.env`，填入你的七牛云密钥：

```bash
cp .env.example .env
```

编辑 `.env`：
```
QINIU_ACCESS_KEY=你的七牛云AccessKey
QINIU_SECRET_KEY=你的七牛云SecretKey
QINIU_BUCKET=th6uj1etn
QINIU_DOMAIN=th6uj1etn.hd-bkt.clouddn.com
QINIU_ZONE=z0
```

> **获取密钥**: 登录 [七牛云控制台](https://portal.qiniu.com) → 个人中心 → 密钥管理

### 3. 批量上传现有文件到七牛云

```bash
node scripts/migrate-to-qiniu.js
```

这个脚本会：
1. 把 `uploads/` 文件夹里的所有文件上传到七牛云
2. 把 `resources.json` 里的下载链接替换为七牛云 URL
3. 把 `uploads.json` 里的链接替换为七牛云 URL
4. 把 JSON 文件同步到七牛云

### 4. 推送到 GitHub

```bash
git init
git add .
git commit -m "init project with qiniu storage"
git remote add origin https://github.com/你的用户名/你的仓库名.git
git push -u origin main
```

**注意**: `uploads/` 文件夹里的大文件不需要推 GitHub（已在 .gitignore 中排除或手动删除），文件都在七牛云上。

---

## Render 部署步骤

### 1. 创建 Web Service

1. 登录 [Render Dashboard](https://dashboard.render.com)
2. 点击 **+ 新的** → **新的网络服务**
3. 连接你的 GitHub 仓库
4. 填写配置：

| 配置项 | 值 |
|--------|-----|
| 名称 | learning-resource-website |
| 区域 | Singapore (离国内近) |
| 分支 | main |
| 构建命令 | `npm install` |
| 启动命令 | `node server.js` |
| 计划 | Free |

### 2. 配置环境变量

在 Render 的 **Environment** 标签页添加：

| 变量名 | 值 |
|--------|-----|
| `QINIU_ACCESS_KEY` | 你的七牛云 AccessKey |
| `QINIU_SECRET_KEY` | 你的七牛云 SecretKey |
| `QINIU_BUCKET` | `th6uj1etn` |
| `QINIU_DOMAIN` | `th6uj1etn.hd-bkt.clouddn.com` |
| `QINIU_ZONE` | `z0` |

### 3. 部署

点击 **部署**，等待完成。部署成功后你会获得一个 `https://xxx.onrender.com` 的地址。

---

## 后续更新网站

### 场景 1: 后台增删改资源（无需重新部署）

直接在后台管理界面操作，数据会自动同步到七牛云，**不需要重新部署**。

### 场景 2: 修改代码后重新部署

```bash
git add .
git commit -m "update something"
git push origin main
```

Render 会自动重新部署。部署后数据会自动从七牛云恢复，**不会丢失**。

---

## 常见问题

**Q: 七牛云测试域名过期怎么办？**
A: 绑定你自己的备案域名到七牛云 Bucket，然后修改 `QINIU_DOMAIN` 环境变量。

**Q: 文件超过 10GB 免费额度怎么办？**
A: 七牛云存储费用约 0.0099 元/GB/月，3.35GB 每月约 3 分钱，基本免费。

**Q: 下载流量超过 10GB/月怎么办？**
A: 超出部分按量计费，约 0.29 元/GB。小流量网站通常不会超。

**Q: 本地开发还需要七牛云吗？**
A: 不需要。如果 `.env` 里没有配置七牛云密钥，文件会存在本地 `uploads/` 目录，和原来一样。
