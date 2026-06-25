// 文件列表加载（上传页面专用）
function loadUploadedFilesInUploadPage() {
    fetch('/api/uploads')
        .then(response => response.json())
        .then(data => {
            // 显示文件到对应的分类
            var fileCategories = {
                'archive-files': data.archive || [],
                'software-files': data.software || [],
                'document-files': data.document || [],
                'video-files': data.video || [],
                'image-files': data.image || [],
                'other-files': data.other || []
            };

            for (var containerId in fileCategories) {
                var container = document.getElementById(containerId);
                if (!container) continue;

                var files = fileCategories[containerId];

                if (files.length === 0) {
                    container.innerHTML = '<div class="empty-category"><p>暂无文件</p></div>';
                } else {
                    container.innerHTML = '';
                    for (var i = 0; i < files.length; i++) {
                        var f = files[i];
                        var div = document.createElement('div');
                        div.className = 'file-item';
                        // 确保中文文件名正确显示
                        var fileName = f.originalName || f.name;
                        div.innerHTML =
                            '<div class="file-name">' + fileName + '</div>' +
                            '<div class="file-size">' + formatFileSize(f.size) + '</div>' +
                            '<button class="btn-small btn-success" onclick="selectFile(\'' + f.url + '\', \'' + fileName + '\')">选择</button>' +
                            '<button class="btn-small btn-danger" onclick="deleteFile(\'' + f.id + '\')">删除</button>';
                        container.appendChild(div);
                    }
                }
            }
        })
        .catch(error => {
            console.error('加载文件失败:', error);
            // 显示错误信息
            var containers = ['archive-files', 'software-files', 'document-files', 'video-files', 'image-files', 'other-files'];
            containers.forEach(containerId => {
                var container = document.getElementById(containerId);
                if (container) {
                    container.innerHTML = '<div class="empty-category"><p>加载失败</p></div>';
                }
            });
        });
}

function formatFileSize(bytes) {
    if (!bytes) return '0 B';
    var k = 1024;
    var sizes = ['B', 'KB', 'MB', 'GB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
}

function selectFile(url, fileName) {
    // 通知父页面选择了文件
    if (window.opener) {
        window.opener.selectFile(url, fileName);
        window.close();
    } else {
        // 如果不是在弹出窗口中，直接设置到资源表单
        var resourceUrl = document.getElementById('resourceUrl');
        if (resourceUrl) {
            resourceUrl.value = url;
            showNotification('已选择文件: ' + fileName, 'success');
        }
    }
}

async function deleteFile(fileId, fileName) {
    if (!confirm(`确定要删除文件 "${fileName || '此文件'}" 吗？`)) return;
    try {
        // 调用API删除文件
        const response = await fetch(`/api/uploads/${fileId}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                showNotification(`文件 "${fileName || '此文件'}" 已删除`, 'success');
            } else {
                showNotification('删除失败，请重试', 'error');
            }
        } else {
            showNotification('删除失败，请重试', 'error');
        }
    } catch (error) {
        console.error('删除文件失败:', error);
        showNotification('删除失败，请重试', 'error');
    }
    // 重新加载文件列表
    loadUploadedFilesInUploadPage();
}

// 显示通知
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 4px;
        color: white;
        z-index: 9999;
        font-size: 14px;
        transition: all 0.3s ease;
    `;
    
    if (type === 'success') {
        notification.style.backgroundColor = '#27ae60';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#e74c3c';
    } else if (type === 'warning') {
        notification.style.backgroundColor = '#f39c12';
    } else {
        notification.style.backgroundColor = '#3498db';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// 页面加载时调用
window.addEventListener('DOMContentLoaded', function() {
    console.log('DOM加载完成，开始加载文件列表');
    loadUploadedFilesInUploadPage();
});