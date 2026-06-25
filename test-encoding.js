// 测试中文编码问题
const fs = require('fs');
const path = require('path');

// 读取资源文件
const resourcesFilePath = path.join(__dirname, 'data/resources.json');
const data = fs.readFileSync(resourcesFilePath, 'utf8');
const resources = JSON.parse(data);

console.log('原始资源数据:');
resources.forEach(resource => {
    console.log('Title:', resource.title);
    console.log('Download URL:', resource.downloadUrl);
    console.log('Thumbnail:', resource.thumbnail);
    console.log('---');
});

// 模拟JSON序列化
const jsonString = JSON.stringify(resources, null, 2);
console.log('\nJSON序列化后:');
console.log(jsonString);

// 检查文件是否存在
console.log('\n检查文件是否存在:');
resources.forEach(resource => {
    if (resource.downloadUrl) {
        const filePath = path.join(__dirname, resource.downloadUrl);
        const exists = fs.existsSync(filePath);
        console.log(`${resource.downloadUrl}: ${exists ? '存在' : '不存在'}`);
    }
});
