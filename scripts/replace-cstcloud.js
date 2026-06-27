const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, '../server.js');
const content = fs.readFileSync(serverPath, 'utf8');

// 替换所有 qiniuStorage -> cstcloudStorage
let newContent = content.replace(/qiniuStorage/g, 'cstcloudStorage');

// 替换所有 syncJsonToQiniu -> syncJsonToCstcloud
newContent = newContent.replace(/syncJsonToQiniu/g, 'syncJsonToCstcloud');

// 所有 restoreJsonFromQiniu -> restoreJsonFromCstcloud
newContent = newContent.replace(/restoreJsonFromQiniu/g, 'restoreJsonFromCstcloud');

// 替换所有 '七牛云' -> 'CSTCloud'
newContent = newContent.replace(/七牛云/g, 'CSTCloud');

fs.writeFileSync(serverPath, newContent, 'utf8');
console.log('替换完成！');