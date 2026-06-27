const { execFile, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// 环境检测
const isRailway = !!process.env.RAILWAY_ENVIRONMENT;
const isLinux = os.platform() === 'linux';
const isCloud = isRailway || isLinux;

// 配置参数
const remoteName = 'mycloud';
const bucket = process.env.QINIU_BUCKET || 'bin220797';
const endpoint = process.env.QINIU_ENDPOINT || 'https://s3.cstcloud.cn';

// rclone 路径与配置
let rcloneExe;
let rcloneConfig;

if (isCloud) {
    // Railway / Linux：使用系统 rclone，动态生成配置文件
    rcloneExe = 'rclone';
    const rcloneDir = path.join(__dirname, '..', 'rclone');
    if (!fs.existsSync(rcloneDir)) {
        fs.mkdirSync(rcloneDir, { recursive: true });
    }
    rcloneConfig = path.join(rcloneDir, 'rclone.conf');

    // 从环境变量生成 rclone.conf（如果不存在或需要更新）
    const accessKey = process.env.QINIU_ACCESS_KEY;
    const secretKey = process.env.QINIU_SECRET_KEY;
    const region = process.env.QINIU_ZONE || '';

    if (accessKey && secretKey) {
        const configContent = `[${remoteName}]
type = s3
provider = Other
access_key_id = ${accessKey}
secret_access_key = ${secretKey}
region = ${region}
endpoint = s3.cstcloud.cn
acl = private
force_path_style = true
`;
        fs.writeFileSync(rcloneConfig, configContent);
    }
} else {
    // 本地 Windows：使用项目目录中的 rclone
    rcloneExe = path.join(__dirname, '..', 'rclone', 'rclone.exe');
    rcloneConfig = path.join(__dirname, '..', 'rclone', 'rclone.conf');
}

// 检查 rclone 是否可用
let isEnabled = false;
if (isCloud) {
    // Linux 下检查系统 PATH 中是否有 rclone
    try {
        require('child_process').execSync('which rclone', { stdio: 'ignore' });
        isEnabled = fs.existsSync(rcloneConfig);
    } catch (e) {
        isEnabled = false;
    }
} else {
    isEnabled = fs.existsSync(rcloneExe) && fs.existsSync(rcloneConfig);
}

if (isEnabled) {
    console.log('✅ CSTCloud 存储已启用 (rclone 模式)');
    console.log('   rclone:', rcloneExe);
    console.log('   config:', rcloneConfig);
    console.log('   环境:', isCloud ? 'Cloud (Railway/Linux)' : 'Local Windows');
} else {
    console.log('⚠️  CSTCloud 存储未启用 (rclone 未找到)');
}

// 执行 rclone 命令的辅助函数
function runRclone(args, timeout = 120000) {
    return new Promise((resolve, reject) => {
        if (!isEnabled) {
            return reject(new Error('rclone 未配置'));
        }
        const fullArgs = ['--config', rcloneConfig, ...args];
        execFile(rcloneExe, fullArgs, { timeout }, (error, stdout, stderr) => {
            if (error) {
                // 某些 rclone 命令返回非零退出码但属于正常情况
                // 如 ls 空结果时返回 exit code 3
                if (args[0] === 'ls' && error.code === 3) {
                    resolve({ stdout: '', stderr: '' });
                    return;
                }
                const errMsg = stderr || error.message || 'rclone 执行失败';
                reject(new Error(errMsg));
            } else {
                resolve({ stdout: stdout.trim(), stderr: stderr.trim() });
            }
        });
    });
}

// 上传文件到 CSTCloud
function uploadFile(localFile, key) {
    return new Promise((resolve, reject) => {
        if (!isEnabled) {
            return reject(new Error('CSTCloud 未配置'));
        }
        const remotePath = `${remoteName}:${bucket}/${key}`;
        runRclone(['copyto', localFile, remotePath, '--s3-acl', 'public-read'])
            .then(() => resolve())
            .catch(err => reject(err));
    });
}

// 上传 Buffer 到 CSTCloud
function uploadBuffer(buffer, key, mimeType) {
    return new Promise((resolve, reject) => {
        if (!isEnabled) {
            return reject(new Error('CSTCloud 未配置'));
        }
        const tmpFile = path.join(os.tmpdir(), `rclone-upload-${Date.now()}-${Math.random().toString(36).slice(2)}`);
        fs.writeFileSync(tmpFile, buffer);
        const remotePath = `${remoteName}:${bucket}/${key}`;
        runRclone(['copyto', tmpFile, remotePath, '--s3-acl', 'public-read'])
            .then(() => {
                try { fs.unlinkSync(tmpFile); } catch (e) {}
                resolve();
            })
            .catch(err => {
                try { fs.unlinkSync(tmpFile); } catch (e) {}
                reject(err);
            });
    });
}

// 从 CSTCloud 下载文件到本地
function downloadFile(key, localFile) {
    return new Promise((resolve, reject) => {
        if (!isEnabled) {
            return reject(new Error('CSTCloud 未配置'));
        }
        const remotePath = `${remoteName}:${bucket}/${key}`;
        runRclone(['copyto', remotePath, localFile])
            .then(() => resolve())
            .catch(err => reject(err));
    });
}

// 获取公开访问 URL
function getPublicUrl(key) {
    return `${endpoint}/${bucket}/${key}`;
}

// 检查文件是否存在
function fileExists(key) {
    return new Promise((resolve) => {
        if (!isEnabled) return resolve(false);
        const remotePath = `${remoteName}:${bucket}/${key}`;
        runRclone(['ls', remotePath])
            .then(result => {
                resolve(result.stdout.length > 0);
            })
            .catch(() => resolve(false));
    });
}

// 流式读取文件（用于后端代理下载）
function streamFile(key, res) {
    return new Promise((resolve, reject) => {
        if (!isEnabled) {
            return reject(new Error('CSTCloud 未配置'));
        }
        const remotePath = `${remoteName}:${bucket}/${key}`;
        const args = ['--config', rcloneConfig, 'cat', remotePath];
        const child = spawn(rcloneExe, args);

        let hasError = false;

        child.stdout.pipe(res);

        child.stderr.on('data', (data) => {
            console.error('rclone cat stderr:', data.toString());
        });

        child.on('error', (err) => {
            hasError = true;
            console.error('rclone cat error:', err.message);
            reject(err);
        });

        child.on('close', (code) => {
            if (code !== 0 && !hasError) {
                reject(new Error(`rclone cat 退出码 ${code}`));
            } else {
                resolve();
            }
        });
    });
}

// 删除文件
function deleteFile(key) {
    return new Promise((resolve, reject) => {
        if (!isEnabled) return resolve();
        const remotePath = `${remoteName}:${bucket}/${key}`;
        runRclone(['delete', remotePath])
            .then(() => resolve())
            .catch(err => reject(err));
    });
}

// 获取文件 MIME 类型
function getMimeType(key) {
    const ext = path.extname(key).toLowerCase();
    const mimeTypes = {
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.txt': 'text/plain',
        '.zip': 'application/zip',
        '.rar': 'application/x-rar-compressed',
        '.exe': 'application/x-msdownload',
        '.mp4': 'video/mp4',
        '.avi': 'video/x-msvideo',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif'
    };
    return mimeTypes[ext] || 'application/octet-stream';
}

module.exports = {
    isEnabled,
    uploadFile,
    uploadBuffer,
    downloadFile,
    streamFile,
    getPublicUrl,
    fileExists,
    deleteFile,
    getMimeType,
    bucket,
    domain: 's3.cstcloud.cn'
};
