const qiniu = require('qiniu');
const fs = require('fs');
const path = require('path');

// 七牛云配置
const accessKey = process.env.QINIU_ACCESS_KEY;
const secretKey = process.env.QINIU_SECRET_KEY;
const bucket = process.env.QINIU_BUCKET || 'th6uj1etn';
const domain = process.env.QINIU_DOMAIN || 'th6uj1etn.hd-bkt.clouddn.com';
const zone = process.env.QINIU_ZONE || 'z0'; // 华东z0, 华北z1, 华南z2

const isEnabled = accessKey && secretKey;

let mac, bucketManager, formUploader, config;

if (isEnabled) {
    mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
    config = new qiniu.conf.Config();

    // 设置存储区域
    const zoneMap = {
        'z0': qiniu.zone.Zone_z0,
        'z1': qiniu.zone.Zone_z1,
        'z2': qiniu.zone.Zone_z2,
        'na0': qiniu.zone.Zone_na0,
        'as0': qiniu.zone.Zone_as0
    };
    config.zone = zoneMap[zone] || qiniu.zone.Zone_z0;

    bucketManager = new qiniu.rs.BucketManager(mac, config);
    formUploader = new qiniu.form_up.FormUploader(config);
}

// 获取上传凭证
function getUploadToken(key) {
    if (!isEnabled) return null;
    const options = {
        scope: bucket + (key ? ':' + key : ''),
        expires: 3600 // 1小时有效期
    };
    const putPolicy = new qiniu.rs.PutPolicy(options);
    return putPolicy.uploadToken(mac);
}

// 上传文件到七牛云
function uploadFile(localFile, key) {
    return new Promise((resolve, reject) => {
        if (!isEnabled) {
            return reject(new Error('七牛云未配置'));
        }

        const uploadToken = getUploadToken(key);
        const putExtra = new qiniu.form_up.PutExtra();

        formUploader.putFile(uploadToken, key, localFile, putExtra, (respErr, respBody, respInfo) => {
            if (respErr) {
                return reject(respErr);
            }
            if (respInfo.statusCode === 200) {
                resolve(respBody);
            } else {
                reject(new Error(`上传失败: ${respInfo.statusCode}, ${JSON.stringify(respBody)}`));
            }
        });
    });
}

// 上传 Buffer 到七牛云
function uploadBuffer(buffer, key, mimeType) {
    return new Promise((resolve, reject) => {
        if (!isEnabled) {
            return reject(new Error('七牛云未配置'));
        }

        const uploadToken = getUploadToken(key);
        const putExtra = new qiniu.form_up.PutExtra();
        putExtra.mimeType = mimeType || 'application/octet-stream';

        formUploader.put(uploadToken, key, buffer, putExtra, (respErr, respBody, respInfo) => {
            if (respErr) {
                return reject(respErr);
            }
            if (respInfo.statusCode === 200) {
                resolve(respBody);
            } else {
                reject(new Error(`上传失败: ${respInfo.statusCode}, ${JSON.stringify(respBody)}`));
            }
        });
    });
}

// 获取公开访问URL
function getPublicUrl(key) {
    return `http://${domain}/${key}`;
}

// 检查文件是否存在
function fileExists(key) {
    return new Promise((resolve) => {
        if (!isEnabled) return resolve(false);
        bucketManager.stat(bucket, key, (err, respBody, respInfo) => {
            resolve(!err && respInfo.statusCode === 200);
        });
    });
}

// 删除文件
function deleteFile(key) {
    return new Promise((resolve, reject) => {
        if (!isEnabled) return resolve();
        bucketManager.delete(bucket, key, (err, respBody, respInfo) => {
            if (err) return reject(err);
            resolve(respBody);
        });
    });
}

// 下载文件到本地
function downloadFile(key, localPath) {
    return new Promise((resolve, reject) => {
        if (!isEnabled) return reject(new Error('七牛云未配置'));
        const publicUrl = getPublicUrl(key);
        bucketManager.fetch(publicUrl, bucket, key, (err, respBody, respInfo) => {
            if (err) return reject(err);
            if (respInfo.statusCode === 200) {
                fs.writeFileSync(localPath, respBody);
                resolve(localPath);
            } else {
                reject(new Error(`下载失败: ${respInfo.statusCode}`));
            }
        });
    });
}

module.exports = {
    isEnabled,
    uploadFile,
    uploadBuffer,
    getPublicUrl,
    fileExists,
    deleteFile,
    downloadFile,
    bucket,
    domain
};
