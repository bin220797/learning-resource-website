/**
 * 批量迁移脚本：将本地 uploads 文件上传到七牛云，并替换 resources.json 中的下载链接
 *
 * 使用方法：
 * 1. 确保 .env 文件已配置好七牛云密钥
 * 2. 运行：node scripts/migrate-to-qiniu.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const qiniuStorage = require('../config/qiniu');

const uploadsDir = path.join(__dirname, '..', 'uploads');
const resourcesFilePath = path.join(__dirname, '..', 'data', 'resources.json');
const uploadsJsonPath = path.join(__dirname, '..', 'data', 'uploads.json');

async function uploadAllFiles() {
    if (!qiniuStorage.isEnabled) {
        console.error('❌ 七牛云未配置，请先设置环境变量 QINIU_ACCESS_KEY 和 QINIU_SECRET_KEY');
        process.exit(1);
    }

    console.log('🚀 开始批量上传文件到七牛云...');
    console.log(`📁 上传目录: ${uploadsDir}`);
    console.log(`☁️  Bucket: ${qiniuStorage.bucket}`);
    console.log(`🌐 域名: ${qiniuStorage.domain}`);
    console.log('');

    const files = fs.readdirSync(uploadsDir);
    const total = files.length;
    let success = 0;
    let failed = 0;
    let skipped = 0;

    for (let i = 0; i < files.length; i++) {
        const filename = files[i];
        const localPath = path.join(uploadsDir, filename);

        // 跳过目录
        if (fs.statSync(localPath).isDirectory()) {
            skipped++;
            continue;
        }

        const key = `uploads/${filename}`;
        const progress = `[${i + 1}/${total}]`;

        try {
            // 检查七牛云上是否已存在
            const exists = await qiniuStorage.fileExists(key);
            if (exists) {
                console.log(`${progress} ⏭️  已存在，跳过: ${filename}`);
                skipped++;
                continue;
            }

            // 上传文件
            await qiniuStorage.uploadFile(localPath, key);
            console.log(`${progress} ✅ 上传成功: ${filename}`);
            success++;
        } catch (err) {
            console.error(`${progress} ❌ 上传失败: ${filename} - ${err.message}`);
            failed++;
        }
    }

    console.log('');
    console.log('📊 上传结果:');
    console.log(`   成功: ${success}`);
    console.log(`   跳过: ${skipped}`);
    console.log(`   失败: ${failed}`);
    console.log('');

    return { success, failed, skipped };
}

async function replaceUrlsInResources() {
    console.log('📝 开始替换 resources.json 中的下载链接...');

    if (!fs.existsSync(resourcesFilePath)) {
        console.error('❌ resources.json 不存在');
        return;
    }

    const data = fs.readFileSync(resourcesFilePath, 'utf8');
    const resources = JSON.parse(data);

    let replaced = 0;
    for (const resource of resources) {
        if (resource.downloadUrl && resource.downloadUrl.startsWith('/uploads/')) {
            const filename = resource.downloadUrl.replace('/uploads/', '');
            resource.downloadUrl = qiniuStorage.getPublicUrl(`uploads/${filename}`);
            replaced++;
        }
        if (resource.thumbnail && resource.thumbnail.startsWith('/uploads/')) {
            const filename = resource.thumbnail.replace('/uploads/', '');
            resource.thumbnail = qiniuStorage.getPublicUrl(`uploads/${filename}`);
            replaced++;
        }
    }

    fs.writeFileSync(resourcesFilePath, JSON.stringify(resources, null, 2));
    console.log(`✅ resources.json 已更新，替换了 ${replaced} 个链接`);
}

async function replaceUrlsInUploads() {
    console.log('📝 开始替换 uploads.json 中的链接...');

    if (!fs.existsSync(uploadsJsonPath)) {
        console.log('⚠️  uploads.json 不存在，跳过');
        return;
    }

    const data = fs.readFileSync(uploadsJsonPath, 'utf8');
    const uploads = JSON.parse(data);

    let replaced = 0;
    for (const upload of uploads) {
        if (upload.url && upload.url.startsWith('/uploads/')) {
            const filename = upload.url.replace('/uploads/', '');
            upload.url = qiniuStorage.getPublicUrl(`uploads/${filename}`);
            replaced++;
        }
    }

    fs.writeFileSync(uploadsJsonPath, JSON.stringify(uploads, null, 2));
    console.log(`✅ uploads.json 已更新，替换了 ${replaced} 个链接`);
}

async function syncJsonToQiniu() {
    console.log('☁️  同步 JSON 文件到七牛云...');
    const files = [
        { local: resourcesFilePath, key: 'data/resources.json' },
        { local: uploadsJsonPath, key: 'data/uploads.json' }
    ];

    for (const file of files) {
        if (fs.existsSync(file.local)) {
            const buffer = fs.readFileSync(file.local);
            await qiniuStorage.uploadBuffer(buffer, file.key, 'application/json');
            console.log(`   ✅ ${file.key}`);
        }
    }
}

async function main() {
    console.log('========================================');
    console.log('   七牛云批量迁移工具');
    console.log('========================================');
    console.log('');

    // 步骤 1: 上传所有文件
    await uploadAllFiles();

    // 步骤 2: 替换 resources.json 链接
    await replaceUrlsInResources();

    // 步骤 3: 替换 uploads.json 链接
    await replaceUrlsInUploads();

    // 步骤 4: 同步 JSON 到七牛云
    await syncJsonToQiniu();

    console.log('');
    console.log('🎉 迁移完成！');
    console.log('');
    console.log('下一步:');
    console.log('   1. git add . && git commit -m "migrate to qiniu"');
    console.log('   2. git push origin main');
    console.log('   3. 在 Render 上配置环境变量并部署');
}

main().catch(err => {
    console.error('❌ 迁移失败:', err);
    process.exit(1);
});
