require('dotenv').config();
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const mysql = require('mysql2/promise');
const cstcloudStorage = require('./config/cstcloud');

// 存储模式标志
let useFileStorage = true;

// 资源数据文件路径
const resourcesFilePath = path.join(__dirname, 'data/resources.json');
const uploadsFilePath = path.join(__dirname, 'data/uploads.json');

// 初始化文件存储
function initFileStorage() {
    // 创建必要的目录
    const directories = ['uploads', 'downloads', 'data'];
    directories.forEach(dir => {
        const dirPath = path.join(__dirname, dir);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    });
    
    // 初始化resources.json
    if (!fs.existsSync(resourcesFilePath)) {
        const defaultResources = [
            {
                "id": "001",
                "title": "Microsoft Office 365 Pro Plus 2024",
                "category": "office",
                "type": "software",
                "description": "最新版Office 365办公套件，包含Word、Excel、PowerPoint、Outlook、Teams等全套工具，支持多设备同步协作",
                "size": "3.2GB",
                "version": "2024",
                "downloadUrl": "https://download.microsoft.com/download/placeholder/Office365ProPlus2024.exe",
                "thumbnail": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300",
                "tags": ["办公", "文档", "表格", "演示", "Microsoft", "正版"],
                "rating": 4.8,
                "downloads": 2580,
                "uploadDate": "2024-01-15",
                "author": "Microsoft"
            }
        ];
        fs.writeFileSync(resourcesFilePath, JSON.stringify(defaultResources, null, 2));
    }
    
    // 初始化uploads.json
    if (!fs.existsSync(uploadsFilePath)) {
        fs.writeFileSync(uploadsFilePath, JSON.stringify([], null, 2));
    }
}

// 文件存储模式：读取资源数据
function getResourcesFromFile() {
    try {
        if (fs.existsSync(resourcesFilePath)) {
            // 明确指定编码为utf8，确保正确读取UTF-8文件
            const data = fs.readFileSync(resourcesFilePath, { encoding: 'utf8' });
            // 检查是否有BOM标记并移除
            const cleanData = data.replace(/^\uFEFF/, '');
            return JSON.parse(cleanData);
        }
    } catch (error) {
        console.error('Error reading resources:', error);
    }
    return [];
}

// 文件存储模式：保存资源数据
function saveResourcesToFile(resources) {
    try {
        fs.writeFileSync(resourcesFilePath, JSON.stringify(resources, null, 2));
    } catch (error) {
        console.error('Error saving resources:', error);
    }
}

// 文件存储模式：读取上传文件数据
function getUploadsFromFile() {
    try {
        if (fs.existsSync(uploadsFilePath)) {
            const data = fs.readFileSync(uploadsFilePath, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error reading uploads:', error);
    }
    return [];
}

// 文件存储模式：保存上传文件数据
function saveUploadsToFile(uploads) {
    try {
        fs.writeFileSync(uploadsFilePath, JSON.stringify(uploads, null, 2));
    } catch (error) {
        console.error('Error saving uploads:', error);
    }
}

// 同步 JSON 数据到CSTCloud
async function syncJsonToCstcloud() {
    if (!cstcloudStorage.isEnabled) return;

    const files = [
        { local: resourcesFilePath, key: 'data/resources.json' },
        { local: uploadsFilePath, key: 'data/uploads.json' }
    ];

    for (const file of files) {
        if (fs.existsSync(file.local)) {
            const buffer = fs.readFileSync(file.local);
            await cstcloudStorage.uploadBuffer(buffer, file.key, 'application/json');
            console.log(`已同步到CSTCloud: ${file.key}`);
        }
    }
}

// 从CSTCloud恢复 JSON 数据
async function restoreJsonFromCstcloud() {
    if (!cstcloudStorage.isEnabled) return;

    const files = [
        { local: resourcesFilePath, key: 'data/resources.json' },
        { local: uploadsFilePath, key: 'data/uploads.json' }
    ];

    for (const file of files) {
        try {
            const exists = await cstcloudStorage.fileExists(file.key);
            if (exists) {
                // 确保目录存在
                const dir = path.dirname(file.local);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                // 使用 rclone 下载（避免 fetch 被 S3 代理拦截）
                await cstcloudStorage.downloadFile(file.key, file.local);
                console.log(`已从CSTCloud恢复: ${file.key}`);
            }
        } catch (err) {
            console.error(`从CSTCloud恢复 ${file.key} 失败:`, err.message);
        }
    }
}

// 数据库配置
const dbConfig = {
    host: 'localhost',
    user: 'bin220797',
    password: 'bin220797',
    database: 'bin',
    port: 3306,
    charset: 'utf8mb4',
    connectTimeout: 10000,
    flags: ['--default-character-set=utf8mb4']
};

// 数据库连接池
let pool;

// 初始化数据库连接
async function initDatabase() {
    // 尝试不同的连接参数组合
    const connectionConfigs = [
        {
            host: 'localhost',
            user: 'root',
            password: 'bs568456',
            database: 'bin',
            port: 3306,
            charset: 'utf8mb4',
            flags: ['--default-character-set=utf8mb4']
        },
        {
            host: '127.0.0.1',
            user: 'root',
            password: 'bs568456',
            database: 'bin',
            port: 3306,
            charset: 'utf8mb4',
            flags: ['--default-character-set=utf8mb4']
        },
        {
            host: 'localhost',
            user: 'bin220797',
            password: 'bin20060415722',
            database: 'bin',
            port: 3306,
            charset: 'utf8mb4',
            flags: ['--default-character-set=utf8mb4']
        },
        {
            host: '127.0.0.1',
            user: 'bin220797',
            password: 'bin20060415722',
            database: 'bin',
            port: 3306,
            charset: 'utf8mb4',
            flags: ['--default-character-set=utf8mb4']
        },
        {
            host: 'localhost',
            user: 'root1',
            password: 'root10',
            database: 'bin',
            port: 3306,
            charset: 'utf8mb4',
            flags: ['--default-character-set=utf8mb4']
        },
        {
            host: '127.0.0.1',
            user: 'root1',
            password: 'root10',
            database: 'bin',
            port: 3306,
            charset: 'utf8mb4',
            flags: ['--default-character-set=utf8mb4']
        }
    ];
    
    for (const config of connectionConfigs) {
        try {
            console.log('🔧 正在尝试连接数据库...');
            console.log('🔧 连接参数:', {
                host: config.host,
                user: config.user,
                port: config.port
            });
            
            const testPool = mysql.createPool(config);
            const connection = await testPool.getConnection();
            console.log('✅ 数据库连接成功');
            
            // 创建数据库（如果不存在）
            console.log('🔧 正在创建数据库...');
            await connection.query('CREATE DATABASE IF NOT EXISTS bin CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
            await connection.query('USE bin');
            console.log('✅ 数据库创建成功');
            
            // 创建表结构
            console.log('🔧 正在创建表结构...');
            await createTables(connection);
            
            connection.release();
            testPool.end();
            
            // 更新连接池
            pool = mysql.createPool({
                ...config,
                database: 'bin',
                charset: 'utf8mb4',
                connectTimeout: 10000
            });
            console.log('✅ 数据库初始化完成');
            return;
        } catch (error) {
            console.error('❌ 连接失败:', error.message);
        }
    }
    
    // 所有连接尝试都失败
    console.error('❌ 所有连接参数都失败');
    console.log('⚠️  无法连接到数据库，将使用文件存储模式作为后备方案');
    
    // 回退到文件存储模式
    useFileStorage = true;
    console.log('✅ 已切换到文件存储模式');
}

// 创建表结构
async function createTables(connection) {
    // 先设置会话编码
    await connection.execute('SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci');
    
    // 创建categories表
    await connection.execute(`
        CREATE TABLE IF NOT EXISTS categories (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(50) NOT NULL UNIQUE,
            display_name VARCHAR(100) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // 创建resources表
    await connection.execute(`
        CREATE TABLE IF NOT EXISTS resources (
            id VARCHAR(50) PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            category VARCHAR(50) NOT NULL,
            type VARCHAR(50) NOT NULL,
            description TEXT,
            size VARCHAR(50),
            version VARCHAR(50),
            format VARCHAR(50),
            download_url VARCHAR(255),
            thumbnail VARCHAR(255),
            rating DECIMAL(3,2) DEFAULT 0,
            downloads INT DEFAULT 0,
            upload_date DATE,
            author VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // 创建resource_tags表
    await connection.execute(`
        CREATE TABLE IF NOT EXISTS resource_tags (
            id INT AUTO_INCREMENT PRIMARY KEY,
            resource_id VARCHAR(50) NOT NULL,
            tag VARCHAR(50) NOT NULL,
            FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
            INDEX idx_resource_id (resource_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // 创建uploads表
    await connection.execute(`
        CREATE TABLE IF NOT EXISTS uploads (
            id VARCHAR(100) PRIMARY KEY,
            original_name VARCHAR(255) NOT NULL,
            size BIGINT NOT NULL,
            mimetype VARCHAR(100) NOT NULL,
            upload_date DATETIME,
            url VARCHAR(255) NOT NULL,
            category VARCHAR(50) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // 插入默认分类
    const defaultCategories = [
        { name: 'office', display_name: '办公工具' },
        { name: 'ai', display_name: 'AI工具' },
        { name: 'documents', display_name: '文档资料' },
        { name: 'videos', display_name: '视频教程' }
    ];
    
    for (const cat of defaultCategories) {
        await connection.execute(
            'INSERT IGNORE INTO categories (name, display_name) VALUES (?, ?)',
            [cat.name, cat.display_name]
        );
    }
}

// 封装数据库查询函数
async function query(sql, params = []) {
    const connection = await pool.getConnection();
    try {
        const [results] = await connection.execute(sql, params);
        return results;
    } finally {
        connection.release();
    }
}

const app = express();
const PORT = process.env.PORT || 8080;

// 中间件
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json({
    limit: '10mb',
    strict: false,
    verify: function(req, res, buf, encoding) {
        try {
            JSON.parse(buf.toString());
        } catch (e) {
            console.error('JSON解析错误:', e);
            console.error('原始数据:', buf.toString());
        }
    }
}));
app.use(express.urlencoded({
    extended: true,
    limit: '10mb',
    parameterLimit: 10000
}));

// 移除默认编码设置，让静态文件服务中间件处理正确的Content-Type

// 安全中间件
app.use((req, res, next) => {
    // 防止XSS攻击
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    // 允许iframe嵌入，以便Microsoft Office Online查看器可以预览文档
    // res.setHeader('X-Frame-Options', 'DENY'); // 注释掉这行
    next();
});

// 静态文件服务 - 禁用缓存
app.use(express.static(__dirname, {
    dotfiles: 'deny',
    etag: false, // 禁用etag缓存
    lastModified: true,
    maxAge: 0, // 禁用缓存
    setHeaders: function(res, path) {
        if (path.endsWith('.html')) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
        } else if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        } else if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css; charset=utf-8');
        }
        // 强制禁用缓存
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Surrogate-Control', 'no-store');
    }
})); // 提供整个项目目录的静态文件
// uploads 文件服务：本地优先，本地没有则重定向到CSTCloud
app.use('/uploads', (req, res, next) => {
    const safePath = path.normalize(req.path).replace(/^(\.\.(\/|\\|$))+/, '');
    const localFile = path.join(__dirname, 'uploads', safePath);

    if (fs.existsSync(localFile) && fs.statSync(localFile).isFile()) {
        return res.sendFile(localFile);
    }

    if (cstcloudStorage.isEnabled) {
        const key = 'uploads/' + safePath.replace(/\\/g, '/');
        const mimeType = cstcloudStorage.getMimeType(key);
        res.setHeader('Content-Type', mimeType);
        cstcloudStorage.streamFile(key, res)
            .then(() => {
                // 流结束，响应会自动关闭
            })
            .catch(err => {
                console.error('rclone 流式下载失败:', err.message);
                if (!res.headersSent) {
                    res.status(500).send('文件下载失败');
                }
            });
        return;
    }

    res.status(404).send('文件不存在');
});

app.use('/downloads', express.static(path.join(__dirname, 'downloads'), {
    dotfiles: 'deny'
}));

// 添加首页路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 添加重定向路由，处理可能的旧链接
app.get('/ai.html', (req, res) => {
    res.redirect('/ai-tools.html');
});

// 添加所有HTML页面的路由（排除admin/demo.html，因为已删除）
const htmlFiles = [
    'index.html',
    'office-tools.html',
    'ai-tools.html',
    'documents.html',
    'videos.html',
    'admin/index.html'
];

htmlFiles.forEach(file => {
    app.get(`/${file}`, (req, res) => {
        // 强制禁用缓存
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Surrogate-Control', 'no-store');
        
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
            res.sendFile(filePath);
        } else {
            res.status(404).send('文件不存在');
        }
    });

    // 也支持 /admin/ 路径
    if (file.startsWith('admin/')) {
        const adminPath = file.replace('admin/', '');
        app.get(`/admin/${adminPath}`, (req, res) => {
            // 强制禁用缓存
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            res.setHeader('Surrogate-Control', 'no-store');
            
            const filePath = path.join(__dirname, file);
            if (fs.existsSync(filePath)) {
                res.sendFile(filePath);
            } else {
                res.status(404).send('文件不存在');
            }
        });
    }
});

// 创建必要的目录
const directories = ['uploads', 'downloads', 'data'];
directories.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
});

// 配置文件上传
const uploadsDir = path.join(__dirname, 'uploads');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // 确保uploads目录存在
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // 保持原始文件名，避免中文乱码
        const originalName = file.originalname;
        // 生成安全的文件名，同时保留原始文件名信息
        const safeFilename = uniqueSuffix + '-' + originalName.replace(/[^a-zA-Z0-9\u4e00-\u9fa5._-]/g, '_');
        cb(null, safeFilename);
    }
});

// 允许的文件类型
const allowedFileTypes = {
    // 图片类型
    'image/jpeg': true,
    'image/jpg': true,
    'image/png': true,
    'image/gif': true,
    'image/webp': true,
    'image/svg+xml': true,
    'image/bmp': true,
    'image/tiff': true,
    
    // 文档类型
    'application/pdf': true,
    'application/msword': true,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': true,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': true,
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': true,
    'application/vnd.ms-excel': true,
    'application/vnd.ms-powerpoint': true,
    'text/plain': true,
    'text/csv': true,
    'text/html': true,
    'text/markdown': true,
    'application/json': true,
    'application/xml': true,
    
    // 压缩文件
    'application/zip': true,
    'application/x-zip-compressed': true,
    'multipart/x-zip': true,
    'application/rar': true,
    'application/x-rar': true,
    'application/x-rar-compressed': true,
    'application/x-7z': true,
    'application/x-7z-compressed': true,
    'application/x-tar': true,
    'application/x-gzip': true,
    'application/gzip': true,
    'application/x-bzip2': true,
    'application/bzip2': true,
    'application/x-compress': true,
    'application/x-compressed': true,
    'application/x-archive': true,
    'application/octet-stream': true,
    
    // 视频文件
    'video/mp4': true,
    'video/avi': true,
    'video/mkv': true,
    'video/quicktime': true,
    'video/x-msvideo': true,
    'video/webm': true,
    'video/flv': true,
    'video/wmv': true,
    'video/ogg': true,
    
    // 音频文件
    'audio/mpeg': true,
    'audio/mp3': true,
    'audio/wav': true,
    'audio/ogg': true,
    'audio/m4a': true,
    
    // 软件安装包
    'application/x-msdownload': true,
    'application/x-apple-diskimage': true,
    'application/vnd.apple.installer+xml': true,
    'application/x-deb': true,
    'application/x-rpm': true,
    'application/octet-stream': true
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 * 1024 // 5GB限制
    },
    fileFilter: function (req, file, cb) {
        // 验证文件类型
        console.log('上传文件的MIME类型:', file.mimetype);
        console.log('上传文件的原始名称:', file.originalname);
        
        // 尝试通过文件扩展名进行验证
        const fileExtension = '.' + file.originalname.split('.').pop().toLowerCase();
        console.log('上传文件的扩展名:', fileExtension);
        
        // 允许的文件扩展名列表
        const allowedExtensions = [
            // 图片
            '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff',
            // 文档
            '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.csv', '.html', '.md', '.json', '.xml',
            // 压缩文件
            '.zip', '.rar', '.7z', '.tar', '.gz', '.bz2',
            // 视频
            '.mp4', '.avi', '.mkv', '.mov', '.webm', '.flv', '.wmv', '.ogg',
            // 音频
            '.mp3', '.wav', '.ogg', '.m4a',
            // 软件
            '.exe', '.dmg', '.deb', '.rpm', '.msi', '.pkg'
        ];
        
        // 检查MIME类型或文件扩展名
        if (allowedFileTypes[file.mimetype] || allowedExtensions.includes(fileExtension)) {
            console.log('文件类型验证通过:', file.mimetype);
            cb(null, true);
        } else {
            console.error('不支持的文件类型:', file.mimetype, '扩展名:', fileExtension);
            return cb(new Error('不支持的文件类型: ' + file.originalname), false);
        }
    }
});

// 初始化资源数据
async function initResources() {
    try {
        // 检查是否已有资源数据
        const existingResources = await query('SELECT COUNT(*) as count FROM resources');
        if (existingResources[0].count === 0) {
            // 插入默认资源
            const defaultResource = {
                id: '001',
                title: 'Microsoft Office 365 Pro Plus 2024',
                category: 'office',
                type: 'software',
                description: '最新版Office 365办公套件，包含Word、Excel、PowerPoint、Outlook、Teams等全套工具，支持多设备同步协作',
                size: '3.2GB',
                version: '2024',
                download_url: 'https://download.microsoft.com/download/placeholder/Office365ProPlus2024.exe',
                thumbnail: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300',
                tags: ['办公', '文档', '表格', '演示', 'Microsoft', '正版'],
                rating: 4.8,
                downloads: 2580,
                upload_date: '2024-01-15',
                author: 'Microsoft'
            };
            
            // 插入资源
            await query(
                'INSERT INTO resources (id, title, category, type, description, size, version, download_url, thumbnail, rating, downloads, upload_date, author) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [defaultResource.id, defaultResource.title, defaultResource.category, defaultResource.type, defaultResource.description, defaultResource.size, defaultResource.version, defaultResource.download_url, defaultResource.thumbnail, defaultResource.rating, defaultResource.downloads, defaultResource.upload_date, defaultResource.author]
            );
            
            // 插入标签
            for (const tag of defaultResource.tags) {
                await query(
                    'INSERT INTO resource_tags (resource_id, tag) VALUES (?, ?)',
                    [defaultResource.id, tag]
                );
            }
            
            console.log('✅ 默认资源数据初始化完成');
        }
    } catch (error) {
        console.error('❌ 初始化资源数据失败:', error.message);
    }
}

// 读取资源数据
async function getResources() {
    try {
        console.log('正在从数据库读取资源数据...');
        const resources = await query('SELECT * FROM resources ORDER BY created_at DESC');
        console.log('从数据库读取到的资源数量:', resources.length);
        console.log('从数据库读取到的资源数据:', resources);
        
        // 为每个资源加载标签
        const processedResources = [];
        for (const resource of resources) {
            const tags = await query('SELECT tag FROM resource_tags WHERE resource_id = ?', [resource.id]);
            // 确保download_url和thumbnail字段是完整的字符串
            const downloadUrl = resource.download_url ? String(resource.download_url) : '';
            const thumbnail = resource.thumbnail ? String(resource.thumbnail) : '';
            console.log('处理资源ID:', resource.id);
            console.log('原始download_url:', resource.download_url);
            console.log('处理后的downloadUrl:', downloadUrl);
            console.log('原始thumbnail:', resource.thumbnail);
            console.log('处理后的thumbnail:', thumbnail);
            const processedResource = {
                id: resource.id,
                title: resource.title,
                category: resource.category,
                type: resource.type,
                description: resource.description,
                size: resource.size,
                version: resource.version,
                format: resource.format,
                downloadUrl: downloadUrl,
                thumbnail: thumbnail,
                tags: tags.map(tag => tag.tag),
                rating: resource.rating,
                downloads: resource.downloads,
                uploadDate: resource.upload_date,
                author: resource.author
            };
            processedResources.push(processedResource);
        }
        
        console.log('处理后的资源数据:', processedResources);
        return processedResources;
    } catch (error) {
        console.error('❌ 读取资源数据失败:', error.message);
        return [];
    }
}

// 读取特定分类的资源
async function getResourcesByCategory(category) {
    try {
        const resources = await query('SELECT * FROM resources WHERE category = ? ORDER BY created_at DESC', [category]);
        
        // 为每个资源加载标签
        for (const resource of resources) {
            const tags = await query('SELECT tag FROM resource_tags WHERE resource_id = ?', [resource.id]);
            resource.tags = tags.map(tag => tag.tag);
            // 转换字段名以保持兼容性
            resource.downloadUrl = resource.download_url;
            resource.uploadDate = resource.upload_date;
        }
        
        return resources;
    } catch (error) {
        console.error('❌ 读取分类资源失败:', error.message);
        return [];
    }
}

// API路由

// 获取所有资源
app.get('/api/resources', async (req, res) => {
    try {
        let resources;
        if (useFileStorage) {
            resources = getResourcesFromFile();
        } else {
            resources = await getResources();
        }
        console.log('返回的资源数量:', resources.length);
        console.log('返回的资源数据:', resources);
        // 确保响应使用utf-8编码
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Content-Encoding', 'identity');
        // 手动序列化并设置编码
        const jsonString = JSON.stringify(resources, null, 2);
        res.send(Buffer.from(jsonString, 'utf8'));
    } catch (error) {
        console.error('获取资源错误:', error);
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.send(Buffer.from('[]', 'utf8'));
    }
});

// 获取特定分类的资源
app.get('/api/resources/category/:category', async (req, res) => {
    try {
        const category = req.params.category;
        let resources;
        if (useFileStorage) {
            resources = getResourcesFromFile().filter(r => r.category === category);
        } else {
            resources = await getResourcesByCategory(category);
        }
        res.json(resources);
    } catch (error) {
        console.error('获取分类资源错误:', error);
        res.status(500).json([]);
    }
});

// 获取单个资源
app.get('/api/resources/:id', async (req, res) => {
    try {
        const id = req.params.id;
        let resource;
        if (useFileStorage) {
            const resources = getResourcesFromFile();
            resource = resources.find(r => r.id === id);
        } else {
            const resources = await getResources();
            resource = resources.find(r => r.id === id);
        }
        if (resource) {
            res.json(resource);
        } else {
            res.status(404).json({ success: false, message: '资源未找到' });
        }
    } catch (error) {
        console.error('获取单个资源错误:', error);
        res.status(500).json({ success: false, message: '获取资源失败' });
    }
});

// 显示数据库中的资源数据（用于调试）
app.get('/api/debug/resources', async (req, res) => {
    try {
        if (!useFileStorage) {
            const resources = await query('SELECT id, title, download_url FROM resources');
            res.json(resources);
        } else {
            const resources = getResourcesFromFile();
            res.json(resources.map(r => ({ id: r.id, title: r.title, download_url: r.downloadUrl })));
        }
    } catch (error) {
        console.error('获取调试信息错误:', error);
        res.status(500).json({ success: false, message: '获取调试信息失败' });
    }
});

// 添加新资源
app.post('/api/resources', async (req, res) => {
    try {
        console.log('收到添加资源的请求...');
        console.log('请求体:', req.body);
        const newResource = req.body;

        // 输入验证
        if (!newResource.title || !newResource.category || !newResource.type) {
            console.log('验证失败: 标题、分类和类型为必填字段');
            return res.status(400).json({ success: false, message: '标题、分类和类型为必填字段' });
        }

        // 验证分类
        const validCategories = ['office', 'ai', 'documents', 'videos'];
        if (!validCategories.includes(newResource.category)) {
            console.log('验证失败: 无效的分类');
            return res.status(400).json({ success: false, message: '无效的分类' });
        }

        if (useFileStorage) {
            // 文件存储模式
            console.log('使用文件存储模式');
            const resources = getResourcesFromFile();
            const newId = String(resources.length + 1).padStart(3, '0');
            newResource.id = newId;
            // 优先使用前端传递的日期，如果没有则使用当前日期
            newResource.uploadDate = (newResource.uploadDate && newResource.uploadDate.trim() !== '') ? newResource.uploadDate : new Date().toISOString().split('T')[0];
            newResource.downloads = 0;
            newResource.rating = newResource.rating || 0;

            resources.push(newResource);
            saveResourcesToFile(resources);
        } else {
            // 数据库存储模式
            console.log('使用数据库存储模式');
            const countResult = await query('SELECT COUNT(*) as count FROM resources');
            const newId = String(countResult[0].count + 1).padStart(3, '0');
            newResource.id = newId;
            // 优先使用前端传递的日期，如果没有则使用当前日期
            newResource.upload_date = (newResource.uploadDate && newResource.uploadDate.trim() !== '') ? newResource.uploadDate : new Date().toISOString().split('T')[0];
            newResource.downloads = 0;
            newResource.rating = newResource.rating || 0;

            console.log('准备插入资源:', newResource);

            // 将undefined值转换为null
            const values = [
                newResource.id, newResource.title, newResource.category, newResource.type, 
                newResource.description || null, newResource.size || null, newResource.version || null, 
                newResource.format || null, newResource.downloadUrl || null, newResource.thumbnail || null, 
                newResource.rating || 0, newResource.downloads || 0, newResource.upload_date || null, 
                newResource.author || null
            ];
            console.log('插入参数:', values);
            // 插入资源
            await query(
                'INSERT INTO resources (id, title, category, type, description, size, version, format, download_url, thumbnail, rating, downloads, upload_date, author) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                values
            );
            console.log('资源插入成功');

            // 插入标签
            if (newResource.tags && Array.isArray(newResource.tags)) {
                console.log('插入标签:', newResource.tags);
                for (const tag of newResource.tags) {
                    await query(
                        'INSERT INTO resource_tags (resource_id, tag) VALUES (?, ?)',
                        [newResource.id, tag]
                    );
                }
            }

            // 转换字段名以保持兼容性
            newResource.downloadUrl = newResource.download_url;
            newResource.uploadDate = newResource.upload_date;
        }

        console.log('添加资源成功:', newResource);

        // 同步到CSTCloud
        if (useFileStorage && cstcloudStorage.isEnabled) {
            try { await syncJsonToCstcloud(); } catch (e) { console.error('同步失败:', e.message); }
        }

        res.json({ success: true, resource: newResource });
    } catch (error) {
        console.error('添加资源错误:', error);
        res.status(500).json({ success: false, message: '添加资源失败' });
    }
});

// 同步资源数据（从后台管理）
app.post('/api/resources/sync', async (req, res) => {
    try {
        const resources = req.body;
        
        if (useFileStorage) {
            // 文件存储模式
            saveResourcesToFile(resources);
        } else {
            // 数据库存储模式
            // 清空现有数据
            await query('DELETE FROM resource_tags');
            await query('DELETE FROM resources');
            
            // 重新插入所有资源
            for (const resource of resources) {
                // 处理日期格式
                let uploadDate = resource.uploadDate;
                if (uploadDate && uploadDate.includes('T')) {
                    // 转换ISO格式日期为MySQL DATETIME格式
                    uploadDate = new Date(uploadDate).toISOString().slice(0, 19).replace('T', ' ');
                }
                
                // 将undefined值转换为null
                const values = [
                    resource.id, resource.title, resource.category, resource.type, 
                    resource.description || null, resource.size || null, resource.version || null, 
                    resource.format || null, resource.downloadUrl || null, resource.thumbnail || null, 
                    resource.rating || 0, resource.downloads || 0, uploadDate || null, 
                    resource.author || null
                ];
                await query(
                    'INSERT INTO resources (id, title, category, type, description, size, version, format, download_url, thumbnail, rating, downloads, upload_date, author) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    values
                );
                
                // 插入标签
                if (resource.tags && Array.isArray(resource.tags)) {
                    for (const tag of resource.tags) {
                        await query(
                            'INSERT INTO resource_tags (resource_id, tag) VALUES (?, ?)',
                            [resource.id, tag]
                        );
                    }
                }
            }
        }
        
        console.log('资源已同步:', resources.length, '条');
        res.json({ success: true });
    } catch (error) {
        console.error('同步资源错误:', error);
        res.status(500).json({ success: false, message: '同步失败' });
    }
});

// 更新资源
app.put('/api/resources/:id', async (req, res) => {
    try {
        console.log('收到更新资源请求:', req.params.id);
        console.log('更新数据:', req.body);
        
        const id = req.params.id;
        const updateData = req.body;
        
        if (useFileStorage) {
            // 文件存储模式
            const resources = getResourcesFromFile();
            const index = resources.findIndex(r => r.id === id);

            if (index !== -1) {
                resources[index] = { ...resources[index], ...updateData };
                saveResourcesToFile(resources);
                console.log('文件存储模式：资源更新成功');
                res.json({ success: true, resource: resources[index] });
            } else {
                console.log('文件存储模式：资源未找到');
                res.status(404).json({ success: false, message: '资源未找到' });
            }
        } else {
            // 数据库存储模式
            // 检查资源是否存在
            const existingResource = await query('SELECT * FROM resources WHERE id = ?', [id]);
            if (existingResource.length === 0) {
                console.log('数据库存储模式：资源未找到');
                return res.status(404).json({ success: false, message: '资源未找到' });
            }
            
            // 构建更新字段和值
            let updateFields = [];
            let updateValues = [];
            
            if (updateData.title !== undefined) updateFields.push('title = ?'), updateValues.push(updateData.title || null);
            if (updateData.category !== undefined) updateFields.push('category = ?'), updateValues.push(updateData.category || null);
            if (updateData.type !== undefined) updateFields.push('type = ?'), updateValues.push(updateData.type || null);
            if (updateData.description !== undefined) updateFields.push('description = ?'), updateValues.push(updateData.description || null);
            if (updateData.size !== undefined) updateFields.push('size = ?'), updateValues.push(updateData.size || null);
            if (updateData.version !== undefined) updateFields.push('version = ?'), updateValues.push(updateData.version || null);
            if (updateData.format !== undefined) updateFields.push('format = ?'), updateValues.push(updateData.format || null);
            if (updateData.downloadUrl !== undefined) updateFields.push('download_url = ?'), updateValues.push(updateData.downloadUrl || null);
            if (updateData.thumbnail !== undefined) updateFields.push('thumbnail = ?'), updateValues.push(updateData.thumbnail || null);
            if (updateData.rating !== undefined) updateFields.push('rating = ?'), updateValues.push(updateData.rating || 0);
            if (updateData.downloads !== undefined) updateFields.push('downloads = ?'), updateValues.push(updateData.downloads || 0);
            if (updateData.uploadDate !== undefined) updateFields.push('upload_date = ?'), updateValues.push((updateData.uploadDate && updateData.uploadDate.trim() !== '') ? updateData.uploadDate : null);
            if (updateData.author !== undefined) updateFields.push('author = ?'), updateValues.push(updateData.author || null);
            
            console.log('更新字段:', updateFields);
            console.log('更新值:', updateValues);
            
            // 如果有更新字段
            if (updateFields.length > 0) {
                // 构建SQL语句
                const sql = `UPDATE resources SET ${updateFields.join(', ')} WHERE id = ?`;
                updateValues.push(id);
                
                console.log('执行SQL:', sql);
                console.log('执行参数:', updateValues);
                
                // 更新资源
                await query(sql, updateValues);
                console.log('资源更新成功');
            }
            
            // 更新标签（只有当提供了新标签时）
            if (updateData.tags !== undefined) {
                console.log('更新标签:', updateData.tags);
                await query('DELETE FROM resource_tags WHERE resource_id = ?', [id]);
                if (Array.isArray(updateData.tags)) {
                    for (const tag of updateData.tags) {
                        await query(
                            'INSERT INTO resource_tags (resource_id, tag) VALUES (?, ?)',
                            [id, tag]
                        );
                    }
                }
                console.log('标签更新成功');
            }
            
            // 获取更新后的资源
            const updatedResources = await getResources();
            const updatedResource = updatedResources.find(r => r.id === id);
            
            console.log('更新后的资源:', updatedResource);

            // 同步到CSTCloud
            if (useFileStorage && cstcloudStorage.isEnabled) {
                try { await syncJsonToCstcloud(); } catch (e) { console.error('同步失败:', e.message); }
            }

            res.json({ success: true, resource: updatedResource });
        }
    } catch (error) {
        console.error('更新资源错误:', error);
        res.status(500).json({ success: false, message: '更新资源失败' });
    }
});

// 删除资源
app.delete('/api/resources/:id', async (req, res) => {
    try {
        const id = req.params.id;
        
        if (useFileStorage) {
            // 文件存储模式
            const resources = getResourcesFromFile();
            const filteredResources = resources.filter(r => r.id !== id);

            if (filteredResources.length !== resources.length) {
                saveResourcesToFile(filteredResources);

                // 同步到CSTCloud
                if (cstcloudStorage.isEnabled) {
                    try { await syncJsonToCstcloud(); } catch (e) { console.error('同步失败:', e.message); }
                }

                res.json({ success: true });
            } else {
                res.status(404).json({ success: false, message: '资源未找到' });
            }
        } else {
            // 数据库存储模式
            // 检查资源是否存在
            const existingResource = await query('SELECT * FROM resources WHERE id = ?', [id]);
            if (existingResource.length === 0) {
                return res.status(404).json({ success: false, message: '资源未找到' });
            }

            // 删除资源（标签会通过外键级联删除）
            await query('DELETE FROM resources WHERE id = ?', [id]);

            res.json({ success: true });
        }
    } catch (error) {
        console.error('删除资源错误:', error);
        res.status(500).json({ success: false, message: '删除资源失败' });
    }
});

// 根据文件名获取分类
function getCategoryFromFile(filename) {
    const lowerFilename = filename.toLowerCase();
    
    // 视频文件
    if (lowerFilename.match(/\.(mp4|avi|mkv|mov|wmv)$/)) {
        return 'videos';
    }
    
    // 文档文件
    if (lowerFilename.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv)$/)) {
        return 'documents';
    }
    
    // AI相关文件
    if (lowerFilename.includes('ai') || lowerFilename.includes('模型') || lowerFilename.includes('model')) {
        return 'ai';
    }
    
    // 办公工具
    if (lowerFilename.includes('office') || lowerFilename.includes('办公') || lowerFilename.includes('excel') || lowerFilename.includes('word')) {
        return 'office';
    }
    
    // 默认分类
    return 'documents';
}

// 文件上传
app.post('/api/upload', upload.single('file'), async (req, res) => {
    console.log('========== 开始处理文件上传 ==========');
    try {
        // 检查请求
        console.log('请求方法:', req.method);
        console.log('请求路径:', req.path);
        console.log('Content-Type:', req.headers['content-type']);
        
        if (!req.file) {
            console.error('上传失败: 没有上传文件');
            return res.status(400).json({ success: false, message: '没有上传文件' });
        }

        console.log('上传的文件信息:');
        console.log('  - 原始文件名:', req.file.originalname);
        console.log('  - 存储文件名:', req.file.filename);
        console.log('  - 文件大小:', req.file.size, 'bytes');
        console.log('  - MIME类型:', req.file.mimetype);
        console.log('  - 存储路径:', req.file.path);

        // 验证文件大小
        if (req.file.size > 5 * 1024 * 1024 * 1024) {
            console.error('上传失败: 文件大小超过限制');
            // 删除过大的文件
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(413).json({ success: false, message: '文件大小超过限制(最大5GB)' });
        }

        // 检查uploads目录是否存在
        const uploadsDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadsDir)) {
            console.log('uploads目录不存在，正在创建...');
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const now = new Date();
        // 确保中文文件名正确处理
        const originalName = Buffer.from(req.file.originalname, 'latin1').toString('utf8');

        // CSTCloud上传
        let fileUrl = `/uploads/${req.file.filename}`;
        const localFilePath = req.file.path;
        const qiniuKey = `uploads/${req.file.filename}`;

        if (cstcloudStorage.isEnabled) {
            try {
                console.log('正在上传到CSTCloud...');
                await cstcloudStorage.uploadFile(localFilePath, qiniuKey);
                fileUrl = `/uploads/${req.file.filename}`;
                console.log('CSTCloud上传成功，使用相对路径:', fileUrl);

                // 上传成功后删除本地文件（可选，保留本地作为回退缓存）
                // 如需保留本地文件作为回退，注释掉下面这行
                // fs.unlinkSync(localFilePath);
            } catch (qiniuErr) {
                console.error('CSTCloud上传失败，使用本地存储:', qiniuErr.message);
                // 保留本地 URL 作为回退
            }
        }

        const fileInfo = {
            id: req.file.filename,
            originalName: originalName,
            size: req.file.size,
            mimetype: req.file.mimetype,
            uploadDate: now.toISOString().slice(0, 19).replace('T', ' '),
            url: fileUrl,
            category: getCategoryFromFile(originalName)
        };

        console.log('文件信息对象:', fileInfo);

        if (useFileStorage) {
            // 文件存储模式
            console.log('使用文件存储模式');
            const uploads = getUploadsFromFile();
            uploads.push(fileInfo);
            saveUploadsToFile(uploads);
            console.log('文件信息已保存到uploads.json');
        } else {
            // 数据库存储模式
            console.log('使用数据库存储模式');
            try {
                await query(
                    'INSERT INTO uploads (id, original_name, size, mimetype, upload_date, url, category) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [fileInfo.id, fileInfo.originalName, fileInfo.size, fileInfo.mimetype, fileInfo.uploadDate, fileInfo.url, fileInfo.category]
                );
                console.log('文件信息已保存到数据库');
            } catch (dbError) {
                console.error('数据库插入失败:', dbError.message);
                // 如果数据库失败，回退到文件存储
                console.log('回退到文件存储模式');
                const uploads = getUploadsFromFile();
                uploads.push(fileInfo);
                saveUploadsToFile(uploads);
                console.log('文件信息已保存到uploads.json（回退模式）');
            }
        }

        // 同步 resources.json 和 uploads.json 到CSTCloud
        if (cstcloudStorage.isEnabled) {
            try {
                await syncJsonToCstcloud();
            } catch (syncErr) {
                console.error('JSON同步到CSTCloud失败:', syncErr.message);
            }
        }

        console.log('========== 文件上传处理完成 ==========');

        res.json({
            success: true,
            file: fileInfo
        });
    } catch (error) {
        console.error('========== 文件上传错误 ==========');
        console.error('错误类型:', error.name);
        console.error('错误消息:', error.message);
        console.error('错误堆栈:', error.stack);
        
        // 清理临时文件
        if (req.file && req.file.path) {
            try {
                if (fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                    console.log('已清理临时文件:', req.file.path);
                }
            } catch (unlinkError) {
                console.error('删除临时文件失败:', unlinkError);
            }
        }
        
        console.log('========== 上传错误处理完成 ==========');
        
        // 根据错误类型返回不同的错误消息
        let errorMessage = '文件上传失败';
        if (error.code === 'ENOENT') {
            errorMessage = '上传目录不存在';
        } else if (error.code === 'EACCES') {
            errorMessage = '没有权限写入文件';
        } else if (error.code === 'ENOSPC') {
            errorMessage = '磁盘空间不足';
        } else if (error.message.includes('不支持的文件类型')) {
            errorMessage = error.message;
        }
        
        res.status(500).json({ success: false, message: errorMessage });
    }
});

// 获取文件列表
app.get('/api/uploads', async (req, res) => {
    try {
        let uploads;
        if (useFileStorage) {
            // 文件存储模式
            uploads = getUploadsFromFile();
        } else {
            // 数据库存储模式
            uploads = await query('SELECT * FROM uploads ORDER BY upload_date DESC');
            
            // 转换字段名以保持兼容性
            uploads = uploads.map(file => ({
                id: file.id,
                originalName: file.original_name,
                size: file.size,
                mimetype: file.mimetype,
                uploadDate: file.upload_date,
                url: file.url,
                category: file.category
            }));
        }

        // 按类型分类
        const archive = uploads.filter(f => {
            // 检查MIME类型
            const mimetype = f.mimetype ? f.mimetype.toLowerCase() : '';
            const isArchiveMimetype = mimetype.includes('zip') || mimetype.includes('rar') || mimetype.includes('7z') || mimetype.includes('compressed') || mimetype.includes('archive');
            
            // 检查文件扩展名
            const fileExtension = f.originalName ? f.originalName.toLowerCase() : '';
            const isArchiveExtension = fileExtension.endsWith('.zip') || fileExtension.endsWith('.rar') || fileExtension.endsWith('.7z') || fileExtension.endsWith('.tar') || fileExtension.endsWith('.gz') || fileExtension.endsWith('.bz2');
            
            // 打印调试信息
            console.log('文件分类调试:', {
                originalName: f.originalName,
                mimetype: f.mimetype,
                isArchiveMimetype,
                isArchiveExtension
            });
            
            return isArchiveMimetype || isArchiveExtension;
        });
        
        // 打印分类结果
        console.log('文件分类结果:', {
            archive: archive.length,
            software: uploads.filter(f => !archive.includes(f) && f.mimetype && f.mimetype.includes('application')).length,
            document: uploads.filter(f => f.mimetype && (f.mimetype.includes('pdf') || f.mimetype.includes('word') || f.mimetype.includes('document'))).length,
            video: uploads.filter(f => f.mimetype && f.mimetype.includes('video')).length,
            image: uploads.filter(f => f.mimetype && f.mimetype.includes('image')).length,
            other: uploads.filter(f => {
                const mimetype = f.mimetype ? f.mimetype.toLowerCase() : '';
                return !archive.includes(f) && 
                       !mimetype.includes('application') && 
                       !mimetype.includes('pdf') && 
                       !mimetype.includes('word') && 
                       !mimetype.includes('document') && 
                       !mimetype.includes('video') && 
                       !mimetype.includes('image');
            }).length
        });
        const document = uploads.filter(f => f.mimetype && (f.mimetype.includes('pdf') || f.mimetype.includes('word') || f.mimetype.includes('document')));
        const video = uploads.filter(f => f.mimetype && f.mimetype.includes('video'));
        const image = uploads.filter(f => f.mimetype && f.mimetype.includes('image'));
        const software = uploads.filter(f => 
            f.mimetype && f.mimetype.includes('application') && 
            f.originalName && f.originalName.includes('.') &&
            !archive.includes(f) &&
            !document.includes(f)
        );
        const other = uploads.filter(f => 
            !archive.includes(f) && 
            !software.includes(f) && 
            !document.includes(f) && 
            !video.includes(f) && 
            !image.includes(f)
        );
        
        const categorized = {
            archive,
            software,
            document,
            video,
            image,
            other
        };

        res.json(categorized);
    } catch (error) {
        console.error('Error reading uploads:', error);
        res.json({ archive: [], software: [], document: [], video: [], image: [], other: [] });
    }
});

// 删除文件
app.delete('/api/uploads/:fileId', async (req, res) => {
    try {
        const fileId = req.params.fileId;
        
        // 检查文件是否被资源引用
        let isReferenced = false;
        
        if (useFileStorage) {
            // 文件存储模式
            const resources = getResourcesFromFile();
            isReferenced = resources.some(resource => 
                (resource.downloadUrl && resource.downloadUrl.includes(fileId)) ||
                (resource.thumbnail && resource.thumbnail.includes(fileId))
            );
        } else {
            // 数据库存储模式
            const resources = await getResources();
            isReferenced = resources.some(resource => 
                (resource.downloadUrl && resource.downloadUrl.includes(fileId)) ||
                (resource.thumbnail && resource.thumbnail.includes(fileId))
            );
        }
        
        if (isReferenced) {
            return res.status(400).json({ success: false, message: '该文件已被资源引用，无法删除' });
        }
        
        if (useFileStorage) {
            // 文件存储模式
            const uploads = getUploadsFromFile();
            const updatedUploads = uploads.filter(file => file.id !== fileId);
            saveUploadsToFile(updatedUploads);
        } else {
            // 数据库存储模式
            await query('DELETE FROM uploads WHERE id = ?', [fileId]);
        }
        
        // 删除实际文件
        const filePath = path.join(__dirname, 'uploads', fileId);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        
        res.json({ success: true, message: '文件删除成功' });
    } catch (error) {
        console.error('删除文件错误:', error);
        res.status(500).json({ success: false, message: '删除文件失败' });
    }
});

// 根据文件名获取分类
function getCategoryFromFile(filename) {
    const ext = path.extname(filename).toLowerCase();
    const categoryMap = {
        '.pdf': 'documents',
        '.doc': 'documents',
        '.docx': 'documents',
        '.txt': 'documents',
        '.zip': 'downloads',
        '.rar': 'downloads',
        '.exe': 'downloads',
        '.mp4': 'videos',
        '.avi': 'videos',
        '.mkv': 'videos',
        '.png': 'images',
        '.jpg': 'images',
        '.jpeg': 'images',
        '.gif': 'images'
    };

    return categoryMap[ext] || 'downloads';
}

// 启动服务器
async function startServer() {
    try {
        // 初始化文件存储（作为后备）
        initFileStorage();

        // 从CSTCloud恢复 JSON 数据（覆盖本地）
        await restoreJsonFromCstcloud();

        // 初始化数据库
        await initDatabase();
        
        // 初始化资源数据
        if (!useFileStorage) {
            await initResources();
        }
        
        const server = app.listen(PORT, () => {
            console.log(`\n✅ Server is running on http://localhost:${PORT}`);
            console.log('📁 Uploads directory:', path.join(__dirname, 'uploads'));
            console.log('📁 Downloads directory:', path.join(__dirname, 'downloads'));
            console.log(`\n🌐 Frontend: http://localhost:${PORT}/index.html`);
            console.log(`🔧 Admin Panel: http://localhost:${PORT}/admin/index.html`);
            console.log('\n📊 Storage Mode:', useFileStorage ? 'File Storage' : 'Database Storage');
            console.log('\nPress Ctrl+C to stop the server\n');
        });
        
        // 优雅关闭
        process.on('SIGINT', () => {
            console.log('\n🛑 Received SIGINT, shutting down gracefully...');
            server.close(() => {
                console.log('✅ Server closed');
                // 关闭数据库连接池
                if (pool) {
                    pool.end();
                    console.log('✅ Database pool closed');
                }
                process.exit(0);
            });
        });
        
    } catch (error) {
        console.error('❌ 服务器启动失败:', error.message);
        process.exit(1);
    }
}

// Vercel 环境检测
if (process.env.VERCEL) {
    // Vercel Serverless 模式：导出 app
    module.exports = app;
} else {
    // 本地/Render 模式：启动服务器
    startServer();
}

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
    console.error('\n❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('\n❌ Unhandled Rejection at:', promise, 'reason:', reason);
});