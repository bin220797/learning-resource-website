const mysql = require('mysql2/promise');
const config = require('./config');

async function initDatabase() {
    try {
        // 连接到MySQL服务器
        const connection = await mysql.createConnection({
            host: config.database.host,
            user: config.database.user,
            password: config.database.password,
            port: config.database.port
        });

        console.log('✅ 成功连接到MySQL服务器');

        // 创建数据库
        await connection.execute('CREATE DATABASE IF NOT EXISTS learning_resources CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
        console.log('✅ 数据库创建成功');

        // 选择数据库
        await connection.execute('USE learning_resources');
        console.log('✅ 数据库选择成功');

        // 创建categories表
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(50) NOT NULL UNIQUE,
                display_name VARCHAR(100) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ categories表创建成功');

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
            )
        `);
        console.log('✅ resources表创建成功');

        // 创建resource_tags表
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS resource_tags (
                id INT AUTO_INCREMENT PRIMARY KEY,
                resource_id VARCHAR(50) NOT NULL,
                tag VARCHAR(50) NOT NULL,
                FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
                INDEX idx_resource_id (resource_id)
            )
        `);
        console.log('✅ resource_tags表创建成功');

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
            )
        `);
        console.log('✅ uploads表创建成功');

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
        console.log('✅ 默认分类插入成功');

        await connection.end();
        console.log('✅ 数据库初始化完成');

    } catch (error) {
        console.error('❌ 数据库初始化失败:', error.message);
        process.exit(1);
    }
}

// 执行初始化
if (require.main === module) {
    initDatabase();
}

module.exports = initDatabase;