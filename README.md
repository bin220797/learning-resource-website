# 学习资源网站

一个用于展示和分享办公工具、AI工具、文档资料和视频教程的个人学习资源网站。支持后台管理、文件上传和资源管理功能。

## 功能特性

| 功能 | 状态 | 说明 |
|------|------|------|
| 前台网站 | ✅ | 响应式设计，四大分类展示 |
| 后台管理 | ✅ | 可视化管理，密码保护 |
| 文件上传 | ✅ | 拖拽上传，自动分类，真实进度显示 |
| 资源管理 | ✅ | 添加/编辑/删除资源 |
| 智能关联 | ✅ | 上传文件后自动添加到资源列表 |
| 搜索功能 | ✅ | 快速查找资源 |
| 暗色模式 | ✅ | 自动适配系统偏好 |

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动服务器

#### Windows
双击运行 `deploy.bat` 或直接打开 `index.html`

#### 使用Node.js服务器
```bash
npm start
# 或
node server.js
```

### 访问网站

- 前台网站：http://localhost:3000/
- 后台管理：http://localhost:3000/admin/ （密码：admin123）

## 项目结构

```
learning-resource-website/
├── index.html              # 网站首页
├── office-tools.html       # 办公工具
├── ai-tools.html        # AI工具
├── documents.html       # 文档资料
├── videos.html          # 视频教程
├── server.js            # Node.js服务器
├── package.json        # 项目依赖
├── css/                 # 样式文件
│   ├── style.css
│   └── responsive.css
├── js/                  # 前端脚本
│   ├── main.js
│   └── data-init.js
├── data/                 # 数据文件
│   ├── resources.json
│   └── categories.json
├── images/               # 图片资源
├── downloads/           # 下载文件目录
├── uploads/             # 上传文件目录
├── admin/               # 后台管理
│   ├── index.html
│   ├── admin.js
│   ├── admin.css
│   ├── admin-functions.js
│   └── README.md
└── README.md            # 项目文档
```

## 数据存储

### localStorage 结构

```javascript
{
  resources: [],     // 资源列表
  categories: {},    // 分类映射
  uploadedFiles: [], // 上传文件记录
  adminPassword: ""  // 管理密码
}
```

### 数据关联

1. **上传文件** → 保存到 `uploadedFiles` → 自动添加到 `resources`
2. **资源管理** → 保存到 `resources` → 前台动态显示

## API 接口

### 资源管理
- `GET /api/resources` - 获取所有资源
- `GET /api/resources/:category` - 获取指定分类
- `POST /api/resources` - 添加资源
- `PUT /api/resources/:id` - 更新资源
- `DELETE /api/resources/:id` - 删除资源

### 文件管理
- `POST /api/upload` - 上传文件
- `GET /api/uploads` - 获取文件列表

## 后台管理

### 功能
1. **资源管理** - 添加、编辑、删除资源
2. **文件上传** - 拖拽上传，显示真实进度
3. **分类管理** - 查看和修改分类

### 使用
1. 访问 `/admin/`
2. 输入密码 `admin123`
3. 进行资源管理

## 故障排除

### 无法连接服务器
- 检查Node.js是否安装
- 确认端口3000未被占用

### 上传文件后不显示
- 刷新后台页面
- 检查浏览器控制台错误

### 资源显示不正常
- 重启服务器：`node server.js`
- 清除浏览器localStorage后刷新

### 后台操作不同步
- 确保服务器正在运行
- 刷新前台页面

## 更新日志

### 2024-04-09
- 修复前后端数据关联
- 上传文件后自动添加到资源列表
- 优先从localStorage读取上传文件

## 许可证

MIT