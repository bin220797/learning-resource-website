// 全局变量
let currentEditingResource = null;
let adminPassword = localStorage.getItem('adminPassword') || 'admin123';

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', async function() {
    // 检查是否已登录
    await checkLoginStatus();
});

// 检查登录状态
async function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
        showAdminPanel();
        await loadDashboard();
        // 加载已上传的文件列表
        await loadUploadedFiles();
    } else {
        showLoginScreen();
    }
}

// 登录功能
async function login() {
    const password = document.getElementById('passwordInput').value;
    const errorElement = document.getElementById('loginError');

    if (!password) {
        errorElement.textContent = '请输入密码';
        return;
    }

    if (password === adminPassword) {
        localStorage.setItem('isLoggedIn', 'true');
        showAdminPanel();
        await initializeAdmin();
        loadDashboard();
    } else {
        errorElement.textContent = '密码错误';
    }
}

// 处理回车键登录
async function handleLogin(event) {
    if (event.key === 'Enter') {
        await login();
    }
}

// 显示登录界面
function showLoginScreen() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('passwordInput').focus();
}

// 显示管理界面
function showAdminPanel() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
}

// 退出登录
function logout() {
    localStorage.removeItem('isLoggedIn');
    showLoginScreen();
    document.getElementById('passwordInput').value = '';
    document.getElementById('loginError').textContent = '';
}

// 初始化管理界面
async function initializeAdmin() {
    // 设置默认日期为今天
    document.getElementById('resourceDate').value = new Date().toISOString().split('T')[0];

    // 加载已上传的文件列表
    await loadUploadedFiles();
}

// 加载仪表板数据
async function loadDashboard() {
    // 加载统计数据
    await loadStatistics();

    // 加载最近更新
    await loadRecentUpdates();
}

// 加载统计数据
async function loadStatistics() {
    // 从API获取最新数据
    const resources = await getResources();
    const categories = getCategories();

    document.getElementById('totalResources').textContent = resources.length;

    const totalDownloads = resources.reduce((sum, resource) => sum + (resource.downloads || 0), 0);
    document.getElementById('totalDownloads').textContent = totalDownloads.toLocaleString();

    document.getElementById('totalCategories').textContent = Object.keys(categories).length;

    const lastUpdate = localStorage.getItem('lastUpdate') || '-';
    document.getElementById('lastUpdate').textContent = lastUpdate;
}

// 加载最近更新
async function loadRecentUpdates() {
    const resources = await getResources();
    const recentUpdates = resources
        .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))
        .slice(0, 5);

    const updatesList = document.getElementById('recentUpdates');
    updatesList.innerHTML = '';

    recentUpdates.forEach(resource => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="update-info">
                <h4>${resource.title}</h4>
                <p>${resource.category} - ${resource.type}</p>
            </div>
            <div class="update-time">${formatDate(resource.uploadDate)}</div>
        `;
        updatesList.appendChild(li);
    });
}

// 显示不同的管理区域
async function showSection(sectionName) {
    // 隐藏所有区域
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });

    // 显示选中的区域
    document.getElementById(sectionName).classList.add('active');

    // 更新导航按钮状态
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('.nav-btn').classList.add('active');

    // 根据区域加载相应数据
    switch(sectionName) {
        case 'resources':
            await loadResourceTable();
            break;
        case 'categories':
            await loadCategories();
            break;
        case 'upload':
            // 上传区域已经初始化
            break;
        case 'settings':
            // 加载设置
            loadSettings();
            break;
    }
}

// 获取资源数据
async function getResources() {
    try {
        // 从API获取最新数据
        const response = await fetch('/api/resources');
        if (response.ok) {
            const resources = await response.json();
            // 保存到localStorage以保持兼容性
            localStorage.setItem('resources', JSON.stringify(resources));
            return resources;
        }
    } catch (error) {
        console.error('获取资源失败:', error);
    }
    // 失败时使用本地存储的数据
    const stored = localStorage.getItem('resources');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error('解析本地存储失败:', e);
        }
    }
    // 从默认文件加载
    return getDefaultResources();
}

// 从后端API获取资源数据
async function fetchResources() {
    try {
        const response = await fetch('/api/resources');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const resources = await response.json();
        // 保存到localStorage以保持兼容性
        localStorage.setItem('resources', JSON.stringify(resources));
        return resources;
    } catch (error) {
        console.error('获取资源失败:', error);
        // 失败时使用本地存储的数据
        const stored = localStorage.getItem('resources');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('解析本地存储失败:', e);
            }
        }
        return [];
    }
}

// 获取分类数据
function getCategories() {
    const stored = localStorage.getItem('categories');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error('Error parsing categories:', e);
        }
    }
    return getDefaultCategories();
}

// 默认资源数据
function getDefaultResources() {
    return [
        {
            id: "001",
            title: "Office 365 Pro Plus 2021",
            category: "office",
            type: "software",
            description: "微软Office办公套件完整版",
            size: "2.5GB",
            version: "2021",
            downloadUrl: "/downloads/Office365ProPlus2021.zip",
            thumbnail: "/images/office365.png",
            tags: ["办公", "文档", "表格", "演示"],
            rating: 4.5,
            downloads: 1250,
            uploadDate: "2024-01-15",
            author: "Microsoft"
        }
        // ... 其他默认资源
    ];
}

// 默认分类数据
function getDefaultCategories() {
    return {
        "office": "办公工具",
        "ai": "AI工具",
        "documents": "文档资料",
        "videos": "视频教程"
    };
}

// 保存资源到localStorage和服务器
function saveResources(resources) {
    // 保存到localStorage
    localStorage.setItem('resources', JSON.stringify(resources));
    localStorage.setItem('lastUpdate', new Date().toLocaleString());
    loadDashboard();

    // 同时同步到服务器文件
    fetch('/api/resources/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resources)
    }).catch(err => console.log('同步服务器失败:', err));
}

// 加载资源表格
async function loadResourceTable() {
    try {
        const resources = await fetchResources();
        const tbody = document.getElementById('resourceTableBody');
        tbody.innerHTML = '';

        if (resources.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">暂无资源</td></tr>';
            return;
        }

        resources.forEach(resource => {
            const tr = document.createElement('tr');
            
            // 创建各个列
            const idTd = document.createElement('td');
            idTd.textContent = resource.id;
            
            const titleTd = document.createElement('td');
            titleTd.textContent = resource.title;
            
            const categoryTd = document.createElement('td');
            categoryTd.textContent = getCategoryName(resource.category);
            
            const typeTd = document.createElement('td');
            typeTd.textContent = resource.type;
            
            const downloadsTd = document.createElement('td');
            downloadsTd.textContent = resource.downloads || 0;
            
            const ratingTd = document.createElement('td');
            ratingTd.textContent = resource.rating || 'N/A';
            
            // 创建编辑按钮
            const editButton = document.createElement('button');
            editButton.className = 'btn-warning';
            editButton.innerHTML = '<i class="fas fa-edit"></i> 编辑';
            editButton.style.marginRight = '5px';
            editButton.addEventListener('click', function() {
                console.log('点击编辑按钮，资源ID:', resource.id);
                // 直接调用editResource函数
                editResource(resource.id);
            });
            
            // 创建删除按钮
            const deleteButton = document.createElement('button');
            deleteButton.className = 'btn-danger';
            deleteButton.innerHTML = '<i class="fas fa-trash"></i> 删除';
            deleteButton.addEventListener('click', function() {
                deleteResource(resource.id);
            });
            
            // 创建操作列
            const actionsTd = document.createElement('td');
            actionsTd.className = 'actions';
            actionsTd.appendChild(editButton);
            actionsTd.appendChild(deleteButton);
            
            // 添加所有列到行中
            tr.appendChild(idTd);
            tr.appendChild(titleTd);
            tr.appendChild(categoryTd);
            tr.appendChild(typeTd);
            tr.appendChild(downloadsTd);
            tr.appendChild(ratingTd);
            tr.appendChild(actionsTd);
            
            tbody.appendChild(tr);
        });
        console.log('资源表格渲染完成');
        console.log('渲染完成后，检查资源表格是否存在:', document.getElementById('resourceTableBody'));
    } catch (error) {
        console.error('加载资源表格失败:', error);
        const tbody = document.getElementById('resourceTableBody');
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: red;">加载失败</td></tr>';
    }
}

// 获取分类名称
function getCategoryName(categoryId) {
    const categories = getCategories();
    return categories[categoryId] || categoryId;
}

// 显示添加资源模态框
function showAddResourceModal() {
    currentEditingResource = null;
    document.getElementById('modalTitle').textContent = '添加资源';
    document.getElementById('resourceForm').reset();
    document.getElementById('resourceDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('resourceModal').style.display = 'block';
}

// 编辑资源
async function editResource(resourceId) {
    // 直接从服务器获取单个资源，而不是获取所有资源
    try {
        const response = await fetch(`/api/resources/${resourceId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const resource = await response.json();
        
        if (resource) {
            currentEditingResource = resource;
            document.getElementById('modalTitle').textContent = '编辑资源';

            // 填充表单
            // 手动填充所有字段
            document.getElementById('resourceId').value = resource.id || '';
            document.getElementById('resourceTitle').value = resource.title || '';
            document.getElementById('resourceCategory').value = resource.category || '';
            document.getElementById('resourceType').value = resource.type || '';
            document.getElementById('resourceDescription').value = resource.description || '';
            document.getElementById('resourceSize').value = resource.size || '';
            document.getElementById('resourceVersion').value = resource.version || '';
            
            // 特殊处理下载链接字段
            const downloadUrlElement = document.getElementById('resourceUrl');
            if (downloadUrlElement) {
                // 直接检查所有可能的下载链接字段名
                const downloadUrl = resource.downloadUrl || resource.download_url || resource.download || resource.url;
                if (downloadUrl) {
                    // 确保downloadUrl是字符串类型
                    const downloadUrlStr = String(downloadUrl);
                    downloadUrlElement.value = downloadUrlStr;
                } else {
                    downloadUrlElement.value = '';
                }
            }
            
            // 特殊处理缩略图链接字段
            const thumbnailElement = document.getElementById('resourceThumbnail');
            if (thumbnailElement) {
                // 直接检查所有可能的缩略图链接字段名
                const thumbnail = resource.thumbnail || resource.thumb || resource.image;
                if (thumbnail) {
                    // 确保thumbnail是字符串类型
                    const thumbnailStr = String(thumbnail);
                    thumbnailElement.value = thumbnailStr;
                } else {
                    thumbnailElement.value = '';
                }
            }
            
            // 填充其他字段
            document.getElementById('resourceRating').value = resource.rating || 0;
            document.getElementById('resourceDownloads').value = resource.downloads || 0;
            // 处理日期格式，确保转换为YYYY-MM-DD格式
            let uploadDate = resource.uploadDate || resource.upload_date;
            if (uploadDate) {
                // 如果是ISO格式的日期字符串，转换为YYYY-MM-DD格式
                if (typeof uploadDate === 'string' && uploadDate.includes('T')) {
                    uploadDate = uploadDate.split('T')[0];
                } else if (uploadDate instanceof Date) {
                    uploadDate = uploadDate.toISOString().split('T')[0];
                }
            }
            document.getElementById('resourceDate').value = uploadDate || new Date().toISOString().split('T')[0];
            document.getElementById('resourceAuthor').value = resource.author || '';
            
            // 处理标签选择器
            const tags = resource.tags || [];
            // 先清除所有选中状态
            document.querySelectorAll('.tags-selector input[type="checkbox"]').forEach(cb => {
                cb.checked = false;
            });
            // 设置选中的标签
            tags.forEach(tag => {
                const checkbox = document.querySelector(`.tags-selector input[value="${tag}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                    checkbox.parentElement.classList.add('checked');
                }
            });
            updateSelectedTags();

            document.getElementById('resourceModal').style.display = 'block';
        }
    } catch (error) {
        console.error('获取资源失败:', error);
        // 失败时使用本地存储的数据
        const resources = await fetchResources();
        const resource = resources.find(r => r.id === resourceId);
        console.log('从本地存储找到的资源:', resource);
        
        if (resource) {
            currentEditingResource = resource;
            document.getElementById('modalTitle').textContent = '编辑资源';

            // 填充表单
            // 先打印资源数据，检查downloadUrl字段
            console.log('编辑的资源数据:', resource);
            
            // 手动填充所有字段
            document.getElementById('resourceId').value = resource.id || '';
            document.getElementById('resourceTitle').value = resource.title || '';
            document.getElementById('resourceCategory').value = resource.category || '';
            document.getElementById('resourceType').value = resource.type || '';
            document.getElementById('resourceDescription').value = resource.description || '';
            document.getElementById('resourceSize').value = resource.size || '';
            document.getElementById('resourceVersion').value = resource.version || '';
            
            // 特殊处理下载链接字段
            const downloadUrlElement = document.getElementById('resourceUrl');
            if (downloadUrlElement) {
                // 直接检查所有可能的下载链接字段名
                const downloadUrl = resource.downloadUrl || resource.download_url || resource.download || resource.url;
                if (downloadUrl) {
                    // 确保downloadUrl是字符串类型
                    const downloadUrlStr = String(downloadUrl);
                    downloadUrlElement.value = downloadUrlStr;
                    console.log('填充下载链接:', downloadUrlStr);
                } else {
                    downloadUrlElement.value = '';
                    console.log('下载链接为空');
                }
            }
            
            // 特殊处理缩略图链接字段
            const thumbnailElement = document.getElementById('resourceThumbnail');
            if (thumbnailElement) {
                // 直接检查所有可能的缩略图链接字段名
                const thumbnail = resource.thumbnail || resource.thumb || resource.image;
                if (thumbnail) {
                    // 确保thumbnail是字符串类型
                    const thumbnailStr = String(thumbnail);
                    thumbnailElement.value = thumbnailStr;
                    console.log('填充缩略图链接:', thumbnailStr);
                } else {
                    thumbnailElement.value = '';
                    console.log('缩略图链接为空');
                }
            }
            
            // 填充其他字段
            document.getElementById('resourceRating').value = resource.rating || 0;
            document.getElementById('resourceDownloads').value = resource.downloads || 0;
            // 处理日期格式，确保转换为YYYY-MM-DD格式
            let uploadDate = resource.uploadDate || resource.upload_date;
            if (uploadDate) {
                // 如果是ISO格式的日期字符串，转换为YYYY-MM-DD格式
                if (typeof uploadDate === 'string' && uploadDate.includes('T')) {
                    uploadDate = uploadDate.split('T')[0];
                } else if (uploadDate instanceof Date) {
                    uploadDate = uploadDate.toISOString().split('T')[0];
                }
            }
            document.getElementById('resourceDate').value = uploadDate || new Date().toISOString().split('T')[0];
            document.getElementById('resourceAuthor').value = resource.author || '';
            
            // 处理标签选择器
            const tags = resource.tags || [];
            // 先清除所有选中状态
            document.querySelectorAll('.tags-selector input[type="checkbox"]').forEach(cb => {
                cb.checked = false;
            });
            // 设置选中的标签
            tags.forEach(tag => {
                const checkbox = document.querySelector(`.tags-selector input[value="${tag}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                    checkbox.parentElement.classList.add('checked');
                }
            });
            updateSelectedTags();

            document.getElementById('resourceModal').style.display = 'block';
        }
    }
}

// 删除资源
async function deleteResource(resourceId) {
    if (confirm('确定要删除这个资源吗？')) {
        try {
            const response = await fetch(`http://localhost/api/resources/${resourceId}`, {
                method: 'DELETE'
            });
            const result = await response.json();
            if (result.success) {
                showNotification('资源已删除', 'success');
                await loadResourceTable();
            } else {
                showNotification('删除资源失败', 'error');
            }
        } catch (error) {
            console.error('删除资源失败:', error);
            showNotification('删除资源失败', 'error');
        }
    }
}

// 关闭资源模态框
function closeResourceModal() {
    document.getElementById('resourceModal').style.display = 'none';
    currentEditingResource = null;
}

// 更新选中的标签显示
function updateSelectedTags() {
    const checkboxes = document.querySelectorAll('.tags-selector input[type="checkbox"]:checked');
    const selectedTags = Array.from(checkboxes).map(cb => cb.value);
    const hiddenInput = document.getElementById('resourceTags');
    const preview = document.getElementById('tagsPreview');

    hiddenInput.value = selectedTags.join(',');
    preview.textContent = selectedTags.length > 0 ? selectedTags.join(', ') : '无';
}

// 处理资源表单提交
document.getElementById('resourceForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const resourceData = {
        id: document.getElementById('resourceId').value,
        title: document.getElementById('resourceTitle').value,
        category: document.getElementById('resourceCategory').value,
        type: document.getElementById('resourceType').value,
        description: document.getElementById('resourceDescription').value,
        size: document.getElementById('resourceSize').value,
        version: document.getElementById('resourceVersion').value,
        downloadUrl: document.getElementById('resourceUrl').value,
        thumbnail: document.getElementById('resourceThumbnail').value,
        tags: document.getElementById('resourceTags').value.split(',').map(tag => tag.trim()).filter(tag => tag),
        rating: parseFloat(document.getElementById('resourceRating').value) || 0,
        downloads: parseInt(document.getElementById('resourceDownloads').value) || 0,
        uploadDate: document.getElementById('resourceDate').value,
        author: document.getElementById('resourceAuthor').value
    };

    try {
        if (currentEditingResource) {
            // 编辑现有资源
            const response = await fetch(`/api/resources/${resourceData.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(resourceData)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            if (result.success) {
                showNotification('资源已更新', 'success');
            } else {
                showNotification('更新资源失败', 'error');
            }
        } else {
            // 添加新资源
            const response = await fetch('/api/resources', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(resourceData)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            if (result.success) {
                showNotification('资源已添加', 'success');
            } else {
                showNotification('添加资源失败', 'error');
            }
        }
        
        // 重新加载资源列表
        await loadResourceTable();
        closeResourceModal();
    } catch (error) {
        console.error('保存资源失败:', error);
        showNotification('保存资源失败', 'error');
    }
});

// 加载分类
async function loadCategories() {
    const categories = getCategories();
    const categoriesGrid = document.getElementById('categoriesGrid');
    categoriesGrid.innerHTML = '';

    for (const [key, value] of Object.entries(categories)) {
        const resourceCount = await countResourcesByCategory(key);
        const card = document.createElement('div');
        card.className = 'category-card';
        card.innerHTML = `
            <div class="category-header">
                <div class="category-icon">${getCategoryIcon(key)}</div>
                <div class="category-info">
                    <h3>${value}</h3>
                    <p>分类ID: ${key}</p>
                </div>
            </div>
            <div class="category-stats">
                <span>资源数: ${resourceCount}</span>
                <button class="btn-secondary" onclick="editCategory('${key}')">
                    <i class="fas fa-edit"></i> 编辑
                </button>
            </div>
        `;
        categoriesGrid.appendChild(card);
    }
}

// 获取分类图标
function getCategoryIcon(category) {
    const icons = {
        'office': '📊',
        'ai': '🤖',
        'documents': '📄',
        'videos': '🎥'
    };
    return icons[category] || '📁';
}

// 统计分类下的资源数
async function countResourcesByCategory(category) {
    const resources = await getResources();
    return resources.filter(r => r.category === category).length;
}

// 编辑分类
function editCategory(categoryId) {
    const newName = prompt('请输入新的分类名称：', getCategories()[categoryId]);
    if (newName && newName.trim()) {
        const categories = getCategories();
        categories[categoryId] = newName.trim();
        localStorage.setItem('categories', JSON.stringify(categories));
        loadCategories();
        showNotification('分类已更新', 'success');
    }
}

// 文件上传功能
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');

// 拖拽上传
uploadArea.addEventListener('dragover', function(e) {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
});

uploadArea.addEventListener('dragleave', function(e) {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
});

uploadArea.addEventListener('drop', function(e) {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');

    const files = e.dataTransfer.files;
    handleFiles(files);
});

// 点击上传
fileInput.addEventListener('change', function(e) {
    handleFiles(e.target.files);
});

// 处理文件
function handleFiles(files) {
    const uploadQueue = document.getElementById('uploadQueue');
    uploadQueue.innerHTML = '';

    // 添加文件类型验证
    const allowedTypes = [
        'application/pdf',
        'application/zip',
        'application/x-rar-compressed',
        'application/x-7z-compressed',
        'application/x-msdownload',
        'application/x-apple-diskimage',
        'application/vnd.ms-office',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'video/mp4',
        'video/x-msvideo',
        'video/x-matroska',
        'video/quicktime'
    ];

    const allowedExtensions = ['.pdf', '.zip', '.rar', '.7z', '.exe', '.dmg', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.avi', '.mkv', '.mov'];

    Array.from(files).forEach(file => {
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

        // 验证文件类型
        if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
            showNotification(`文件 "${file.name}" 类型不被支持`, 'error');
            return;
        }

        const queueItem = document.createElement('div');
        queueItem.className = 'queue-item';
        queueItem.innerHTML = `
            <span>${file.name}</span>
            <div class="progress">
                <div class="progress-bar"></div>
            </div>
            <span>0%</span>
        `;
        uploadQueue.appendChild(queueItem);

        // 上传文件
        uploadFile(file, queueItem.querySelector('.progress-bar'), queueItem.querySelector('span:last-child'));
    });
}

// 上传文件到服务器
async function uploadFile(file, progressBar, progressText) {
    try {
        // 创建FormData
        const formData = new FormData();
        formData.append('file', file);

        // 显示进度
        const fileSize = file.size;
        let loaded = 0;
        let speed = 0;
        let lastLoaded = 0;
        let lastTime = Date.now();

        progressText.textContent = `0 MB / ${formatFileSize(fileSize)}`;

        // 使用XMLHttpRequest支持进度显示
        const xhr = new XMLHttpRequest();

        // 监听上传进度
        xhr.upload.addEventListener('progress', function(event) {
            if (event.lengthComputable) {
                loaded = event.loaded;
                const progress = (loaded / fileSize) * 100;
                progressBar.style.width = progress + '%';

                // 计算速度
                const now = Date.now();
                const timeDiff = now - lastTime;
                if (timeDiff > 0) {
                    speed = (loaded - lastLoaded) / (timeDiff / 1000);
                    lastLoaded = loaded;
                    lastTime = now;
                }

                progressText.textContent = `${formatFileSize(loaded)} / ${formatFileSize(fileSize)} (${formatFileSize(speed)}/s)`;
            }
        });

        // 设置超时时间（30分钟）
        xhr.timeout = 1800000;

        // 监听响应，处理后端是否可用
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    // 后端可用，保存到服务器
                    try {
                        var response = JSON.parse(xhr.responseText);
                        if (response.success) {
                            // 显示上传成功通知
                            showNotification('文件 "' + file.name + '" 上传成功，请在资源管理中手动添加资源', 'success');
                        } else {
                            showNotification('文件上传失败: ' + (response.message || '未知错误'), 'error');
                        }
                    } catch (e) {
                        console.error('解析失败', e);
                        console.error('原始响应:', xhr.responseText);
                        showNotification('文件上传失败: 响应解析错误', 'error');
                    }
                } else if (xhr.status === 413) {
                    showNotification('文件上传失败: 文件大小超过限制', 'error');
                } else if (xhr.status === 400) {
                    try {
                        var response = JSON.parse(xhr.responseText);
                        showNotification('文件上传失败: ' + (response.message || '无效请求'), 'error');
                    } catch (e) {
                        showNotification('文件上传失败: 无效请求', 'error');
                    }
                } else if (xhr.status === 0) {
                    showNotification('文件上传失败: 服务器连接失败', 'error');
                } else {
                    showNotification('文件上传失败: 服务器错误 (' + xhr.status + ')', 'error');
                }
                // 重新从API加载文件列表
                loadUploadedFiles();
                progressBar.parentElement.parentElement.remove();
            }
        };

        // 监听网络错误
        xhr.onerror = function() {
            showNotification('文件上传失败: 网络错误', 'error');
            loadUploadedFiles();
            progressBar.parentElement.parentElement.remove();
        };

        // 监听超时
        xhr.ontimeout = function() {
            showNotification('文件上传失败: 请求超时', 'error');
            loadUploadedFiles();
            progressBar.parentElement.parentElement.remove();
        };

        xhr.open('POST', '/api/upload');
        xhr.send(formData);

    } catch (error) {
        console.error('上传错误:', error);
        showNotification('文件上传失败', 'error');
        progressBar.parentElement.parentElement.remove();
    }
}



// 获取文件类型
function getFileType(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    const typeMap = {
        'zip': 'archive',
        'rar': 'archive',
        '7z': 'archive',
        'exe': 'software',
        'dmg': 'software',
        'pkg': 'software',
        'msi': 'software',
        'pdf': 'document',
        'doc': 'document',
        'docx': 'document',
        'xls': 'document',
        'xlsx': 'document',
        'ppt': 'document',
        'pptx': 'document',
        'txt': 'document',
        'mp4': 'video',
        'avi': 'video',
        'mkv': 'video',
        'mov': 'video',
        'wmv': 'video',
        'flv': 'video',
        'png': 'image',
        'jpg': 'image',
        'jpeg': 'image',
        'gif': 'image',
        'webp': 'image',
        'svg': 'image'
    };
    return typeMap[extension] || 'other';
}

// 获取文件分类
function getFileCategory(fileName) {
    const fileType = getFileType(fileName);
    const categoryMap = {
        'archive': 'downloads',
        'software': 'downloads',
        'document': 'documents',
        'video': 'videos',
        'image': 'images',
        'other': 'downloads'
    };
    return categoryMap[fileType] || 'downloads';
}

// 加载已上传文件（按分类显示）
async function loadUploadedFiles() {
    try {
        // 使用相对路径，这样无论是本地访问还是外网访问都能正确解析
        // 添加时间戳参数避免浏览器缓存
        const response = await fetch('/api/uploads?' + new Date().getTime());
        if (!response.ok) {
            throw new Error('获取文件列表失败: ' + response.status);
        }
        const categorizedFiles = await response.json();
        
        // 合并所有文件到一个数组并更新localStorage
        const allFiles = [
            ...(categorizedFiles.archive || []),
            ...(categorizedFiles.software || []),
            ...(categorizedFiles.document || []),
            ...(categorizedFiles.video || []),
            ...(categorizedFiles.image || []),
            ...(categorizedFiles.other || [])
        ];
        
        // 更新localStorage中的文件列表
        localStorage.setItem('uploadedFiles', JSON.stringify(allFiles));
        
        // 显示文件到对应的分类
        var fileCategories = {
            'archive-files': categorizedFiles.archive || [],
            'software-files': categorizedFiles.software || [],
            'document-files': categorizedFiles.document || [],
            'video-files': categorizedFiles.video || [],
            'image-files': categorizedFiles.image || [],
            'other-files': categorizedFiles.other || []
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
                        '<button class="btn-small btn-danger" onclick="deleteFile(\'' + f.id + '\', \'' + fileName + '\')">删除</button>';
                    container.appendChild(div);
                }
            }
        }
    } catch (error) {
        console.error('加载文件列表失败:', error);
        // 失败时使用本地存储
        var uploadedFiles = JSON.parse(localStorage.getItem('uploadedFiles') || '[]');
        
        if (uploadedFiles.length > 0) {
            var categorizedFiles = {
                archive: [],
                software: [],
                document: [],
                video: [],
                image: []
            };

            for (var i = 0; i < uploadedFiles.length; i++) {
                var type = uploadedFiles[i].type || 'other';
                if (categorizedFiles[type]) {
                    categorizedFiles[type].push(uploadedFiles[i]);
                }
            }

            // 显示文件到对应的分类
            var fileCategories = {
                'archive-files': categorizedFiles.archive || [],
                'software-files': categorizedFiles.software || [],
                'document-files': categorizedFiles.document || [],
                'video-files': categorizedFiles.video || [],
                'image-files': categorizedFiles.image || [],
                'other-files': categorizedFiles.other || []
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
                            '<button class="btn-small btn-danger" onclick="deleteFile(\'' + f.id + '\', \'' + fileName + '\')">删除</button>';
                        container.appendChild(div);
                    }
                }
            }
        } else {
            loadDefaultFiles();
        }
    }
}



// 复制文件链接
function copyFileUrl(url, fileName) {
    const fullUrl = window.location.origin + url;
    navigator.clipboard.writeText(fullUrl).then(() => {
        showNotification(`已复制 "${fileName}" 的链接`, 'success');
    }).catch(() => {
        showNotification('复制失败，请手动复制', 'error');
    });
}

// 删除文件
async function deleteFile(fileId, fileName) {
    if (confirm(`确定要删除文件 "${fileName}" 吗？`)) {
        try {
            // 删除服务器文件
            const response = await fetch(`/api/uploads/${fileId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    showNotification(`文件 "${fileName}" 已删除`, 'success');
                } else {
                    showNotification(result.message || '删除失败，请重试', 'error');
                }
            } else {
                // 处理400错误（文件被引用）
                if (response.status === 400) {
                    const result = await response.json();
                    showNotification(result.message || '删除失败', 'error');
                } else {
                    showNotification('删除失败，请重试', 'error');
                }
            }
        } catch (error) {
            console.error('Delete error:', error);
            showNotification('删除失败，请重试', 'error');
        }

        // 重新加载文件列表
        await loadUploadedFiles();

        // 更新资源管理中的相关链接
        updateResourceLinksAfterDelete(fileId);
    }
}

// 删除文件后更新资源链接
function updateResourceLinksAfterDelete(fileId) {
    let resources = JSON.parse(localStorage.getItem('resources') || '[]');
    resources.forEach(resource => {
        if (resource.downloadUrl === `/downloads/${fileId}`) {
            resource.downloadUrl = '';
            resource.status = 'missing_file';
        }
    });
    localStorage.setItem('resources', JSON.stringify(resources));
}

// 获取文件图标
function getFileIcon(type) {
    const icons = {
        'pdf': 'fas fa-file-pdf',
        'image': 'fas fa-file-image',
        'video': 'fas fa-file-video',
        'zip': 'fas fa-file-archive',
        'default': 'fas fa-file'
    };
    return icons[type] || icons.default;
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 保存设置
function saveSettings() {
    const password = document.getElementById('adminPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password && password !== confirmPassword) {
        showNotification('两次输入的密码不一致', 'error');
        return;
    }

    if (password) {
        adminPassword = password;
        localStorage.setItem('adminPassword', password);
        showNotification('密码已更新', 'success');
    }

    // 保存其他设置
    const settings = {
        siteTitle: document.getElementById('siteTitle').value,
        siteDescription: document.getElementById('siteDescription').value,
        contactEmail: document.getElementById('contactEmail').value
    };

    localStorage.setItem('adminSettings', JSON.stringify(settings));
    showNotification('设置已保存', 'success');
}

// 加载设置
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('adminSettings') || '{}');

    document.getElementById('siteTitle').value = settings.siteTitle || '学习资源中心';
    document.getElementById('siteDescription').value = settings.siteDescription || '收集和分享优质的学习资源，帮助大家提升工作效率和学习成果。';
    document.getElementById('contactEmail').value = settings.contactEmail || 'contact@example.com';
}

// 显示通知
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';

    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// 格式化日期
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
}

// 过滤资源
async function filterResources() {
    const searchTerm = document.getElementById('resourceSearch').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const typeFilter = document.getElementById('typeFilter').value;

    const resources = await getResources();
    const filteredResources = resources.filter(resource => {
        const matchesSearch = resource.title.toLowerCase().includes(searchTerm) ||
                            resource.description.toLowerCase().includes(searchTerm);
        const matchesCategory = !categoryFilter || resource.category === categoryFilter;
        const matchesType = !typeFilter || resource.type === typeFilter;

        return matchesSearch && matchesCategory && matchesType;
    });

    // 更新表格
    const tbody = document.getElementById('resourceTableBody');
    tbody.innerHTML = '';

    filteredResources.forEach(resource => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${resource.id}</td>
            <td>${resource.title}</td>
            <td>${getCategoryName(resource.category)}</td>
            <td>${resource.type}</td>
            <td>${resource.downloads || 0}</td>
            <td>${resource.rating || 'N/A'}</td>
            <td class="actions">
                <button class="btn-warning" onclick="editResource('${resource.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-danger" onclick="deleteResource('${resource.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}