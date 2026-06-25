// 同步资源数据到JSON文件
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// 数据库配置
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'bs568456',
    database: 'bin',
    port: 3306,
    charset: 'utf8mb4',
    connectTimeout: 10000
};

// 资源数据文件路径
const resourcesFilePath = path.join(__dirname, 'data/resources.json');

async function syncResources() {
    let pool;
    try {
        // 连接数据库
        pool = mysql.createPool(dbConfig);
        const connection = await pool.getConnection();
        
        // 读取资源数据
        const [resources] = await connection.query('SELECT * FROM resources ORDER BY created_at DESC');
        
        // 读取标签数据
        const resourcesWithTags = [];
        for (const resource of resources) {
            const [tags] = await connection.query('SELECT tag FROM resource_tags WHERE resource_id = ?', [resource.id]);
            const tagList = tags.map(tag => tag.tag);
            
            // 转换字段名
            const resourceWithTags = {
                id: resource.id,
                title: resource.title,
                category: resource.category,
                type: resource.type,
                description: resource.description,
                size: resource.size,
                version: resource.version,
                format: resource.format,
                downloadUrl: resource.download_url,
                thumbnail: resource.thumbnail,
                tags: tagList,
                rating: resource.rating,
                downloads: resource.downloads,
                uploadDate: resource.upload_date,
                author: resource.author
            };
            resourcesWithTags.push(resourceWithTags);
        }
        
        // 写入JSON文件
        fs.writeFileSync(resourcesFilePath, JSON.stringify(resourcesWithTags, null, 2));
        
        console.log('同步成功！共同步', resourcesWithTags.length, '条资源数据');
        
        connection.release();
    } catch (error) {
        console.error('同步失败:', error.message);
    } finally {
        if (pool) {
            pool.end();
        }
    }
}

// 运行同步
syncResources();
