// 测试文件路径问题
const fs = require('fs');
const path = require('path');

// 模拟前端收到的资源数据
const resources = [
  {
    "id": "001",
    "title": "照片排版打印工具",
    "downloadUrl": "/uploads/1775954331552-729967333-照片排版工具-更新.exe"
  },
  {
    "id": "007",
    "title": "MYCOL函数视频教程",
    "downloadUrl": "/uploads/1775976831534-552812394-BYCOL函数.mp4"
  }
];

console.log('测试文件路径解析:');
resources.forEach(resource => {
    console.log('\n资源:', resource.title);
    console.log('相对路径:', resource.downloadUrl);
    
    // 构建绝对路径
    const absolutePath = path.join(__dirname, resource.downloadUrl);
    console.log('绝对路径:', absolutePath);
    
    // 检查文件是否存在
    const exists = fs.existsSync(absolutePath);
    console.log('文件存在:', exists);
    
    // 模拟前端在不同端口访问时的路径解析
    console.log('\n模拟前端路径解析:');
    console.log('localhost:8080 访问时:', 'http://localhost:8080' + resource.downloadUrl);
    console.log('notes.bin220797.top 访问时:', 'http://notes.bin220797.top' + resource.downloadUrl);
});

// 检查uploads目录中的实际文件
console.log('\nuploads目录中的实际文件:');
const uploadsDir = path.join(__dirname, 'uploads');
const files = fs.readdirSync(uploadsDir);
files.forEach(file => {
    console.log(file);
});
