// 前台主脚本
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    loadLatestResources();
    loadFeaturedResources();
    initializeScrollToTop();
    initializeSearch();
    initializeScrollAnimation();
    initializeNavbarScroll();
});

// 导航
function initializeNavigation() {
    var hamburger = document.querySelector('.hamburger');
    var navMenu = document.querySelector('.nav-menu');
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
}

// 导航栏滚动效果
function initializeNavbarScroll() {
    var navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }
}

// 元素进入视口时的动画
function initializeScrollAnimation() {
    var animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });
    
    animatedElements.forEach(function(element) {
        observer.observe(element);
    });
}

// 加载最新资源
async function loadLatestResources() {
    var latestResources = document.getElementById('latestResources');
    if (!latestResources) return;

    // 显示加载状态
    latestResources.innerHTML = '<div class="loading-indicator">加载中...</div>';

    try {
        // 从服务器API获取资源数据，添加缓存控制参数
        const response = await fetch('/api/resources?_=' + Date.now());
        console.log('API响应状态:', response.status);
        if (!response.ok) {
            throw new Error('获取资源数据失败: ' + response.status);
        }
        var resources = await response.json();
        console.log('从API获取到的资源数据:', resources);

        if (resources.length > 0) {
            resources.sort(function(a, b) {
                return new Date(b.uploadDate) - new Date(a.uploadDate);
            });
            var sorted = resources.slice(0, 6);

            latestResources.innerHTML = '';
            for (var i = 0; i < sorted.length; i++) {
                var card = createResourceCard(sorted[i]);
                latestResources.appendChild(card);
            }
        } else {
            latestResources.innerHTML = '<div class="no-results">暂无资源</div>';
        }
    } catch (error) {
        console.error('加载最新资源失败:', error);
        latestResources.innerHTML = '<div class="no-results">加载资源失败，请刷新页面重试</div>';
    }
}

// 加载特色资源
async function loadFeaturedResources() {
    var featuredContainer = document.getElementById('featuredResources');
    if (!featuredContainer) return;

    // 显示加载状态
    featuredContainer.innerHTML = '<div class="loading-indicator">加载中...</div>';

    try {
        // 从服务器API获取资源数据，添加缓存控制参数
        const response = await fetch('/api/resources?_=' + Date.now());
        if (!response.ok) {
            throw new Error('获取资源数据失败: ' + response.status);
        }
        var resources = await response.json();
        console.log('从API获取到的资源数据:', resources);

        if (resources.length > 0) {
            resources.sort(function(a, b) {
                return (b.rating || 0) - (a.rating || 0);
            });
            var featured = resources.slice(0, 4);

            featuredContainer.innerHTML = '';
            for (var i = 0; i < featured.length; i++) {
                var item = createFeaturedItem(featured[i]);
                featuredContainer.appendChild(item);
            }
        } else {
            featuredContainer.innerHTML = '<div class="no-results">暂无</div>';
        }
    } catch (error) {
        console.error('加载特色资源失败:', error);
        featuredContainer.innerHTML = '<div class="no-results">加载资源失败，请刷新页面重试</div>';
    }
}

// 创建资源卡片
function createResourceCard(resource) {
    var card = document.createElement('div');
    card.className = 'resource-card';
    var thumb = resource.thumbnail || '';
    card.innerHTML = '<img src="' + thumb + '" alt="' + resource.title + '">' +
        '<div class="resource-info" style="display: flex; flex-direction: column; height: 100%;">' +
        '<div style="flex: 1;">' +
        '<h3>' + resource.title + '</h3>' +
        '<p>' + (resource.description || '') + '</p>' +
        '<div class="resource-meta">' +
        '<span>⬇ ' + (resource.downloads || 0) + '</span>' +
        '<span>⭐ ' + (resource.rating || '0') + '</span>' +
        '</div>' +
        '</div>' +
        '<div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e0e0e0; min-height: 70px; display: flex; align-items: center; gap: 10px;">' +
        '<button class="preview-btn" onclick="previewDocument(\'' + resource.id + '\', \'' + resource.title + '\')">预览</button>' +
        '<button class="download-btn" onclick="downloadResource(\'' + resource.id + '\', \'' + resource.title + '\')">下载</button>' +
        '</div>' +
        '</div>';
    
    // 为新创建的按钮添加样式
    const previewBtn = card.querySelector('.preview-btn');
    const downloadBtn = card.querySelector('.download-btn');
    
    if (previewBtn) {
        previewBtn.style.flex = '1';
        previewBtn.style.background = '#f0f0f0';
        previewBtn.style.color = '#666';
        previewBtn.style.border = '1px solid #e0e0e0';
        previewBtn.style.padding = '10px 20px';
        previewBtn.style.borderRadius = '5px';
        previewBtn.style.cursor = 'pointer';
        previewBtn.style.transition = 'all 0.3s ease';
        previewBtn.style.fontSize = '14px';
        previewBtn.style.fontWeight = '500';
    }
    
    if (downloadBtn) {
        downloadBtn.style.flex = '1';
        downloadBtn.style.background = 'var(--primary-color)';
        downloadBtn.style.color = 'white';
        downloadBtn.style.border = 'none';
        downloadBtn.style.padding = '10px 20px';
        downloadBtn.style.borderRadius = '5px';
        downloadBtn.style.cursor = 'pointer';
        downloadBtn.style.transition = 'all 0.3s ease';
        downloadBtn.style.fontSize = '14px';
        downloadBtn.style.fontWeight = '500';
    }
    return card;
}

// 创建特色项
function createFeaturedItem(resource) {
    var item = document.createElement('div');
    item.className = 'featured-item';
    item.innerHTML = '<h3>' + resource.title + '</h3>' +
        '<p>' + resource.description + '</p>';
    return item;
}

// 下载
async function downloadResource(id, title) {
    console.log('开始下载资源:', id, title);

    try {
        // 从服务器API获取资源的详细信息
        const response = await fetch(`/api/resources/${id}`);

        if (!response.ok) {
            throw new Error('获取资源信息失败: ' + response.status);
        }

        const resource = await response.json();

        if (resource && resource.downloadUrl) {
            let downloadUrl = resource.downloadUrl;
            // 确保是相对路径（走后端 /uploads 代理）
            if (downloadUrl.startsWith('http')) {
                // 如果仍然是绝对URL，提取路径部分
                try {
                    const urlObj = new URL(downloadUrl);
                    downloadUrl = urlObj.pathname;
                } catch (e) {
                    // URL 解析失败，直接使用
                }
            }

            // 直接下载（不再做 HEAD 检查，文件通过后端 rclone 代理提供）
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = downloadUrl.split('/').pop();
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // 更新资源的下载次数
            try {
                await fetch(`/api/resources/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ downloads: (resource.downloads || 0) + 1 })
                });
            } catch (updateError) {
                console.error('更新下载次数失败:', updateError);
            }
        } else {
            console.log('资源下载链接不存在:', resource);
            alert('资源下载链接不存在');
        }
    } catch (error) {
        console.error('下载失败:', error);
        alert('下载失败，请稍后重试: ' + error.message);
    }
}

// 标签筛选 - 根据标签显示资源
async function showByTag(tag) {
    // 计算当前分类和容器
    var path = window.location.pathname;
    var category = 'videos';
    var containerId = 'allVideos';

    if (path.indexOf('office') > -1) {
        category = 'office';
        containerId = 'toolsGrid';
    } else if (path.indexOf('ai') > -1) {
        category = 'ai';
        containerId = 'aiToolsGrid';
    } else if (path.indexOf('documents') > -1) {
        category = 'documents';
        containerId = 'documentsGrid';
    }

    var container = document.getElementById(containerId);
    if (!container) {
        // 尝试其他可能的ID
        var possibleIds = ['allVideos', 'allOffice', 'allAI', 'allDocuments', 'toolsGrid', 'aiToolsGrid', 'documentsGrid', 'videoGrid'];
        for (var x = 0; x < possibleIds.length; x++) {
            container = document.getElementById(possibleIds[x]);
            if (container) break;
        }
    }
    if (!container) return;

    try {
        // 从服务器获取最新数据，添加缓存控制参数
        const response = await fetch('/api/resources?_=' + Date.now());
        if (response.ok) {
            var resources = await response.json();
            
            var filtered = resources.filter(resource => {
                return resource.category === category && (tag === '' || (resource.tags && resource.tags.indexOf(tag) !== -1));
            });

            container.innerHTML = '';
            if (filtered.length > 0) {
                for (var j = 0; j < filtered.length; j++) {
                    var card = createResourceCard(filtered[j]);
                    container.appendChild(card);
                }
            } else {
                container.innerHTML = '<div class="no-results">暂无资源</div>';
            }
        } else {
            container.innerHTML = '<div class="no-results">加载资源失败，请刷新页面重试</div>';
        }
    } catch (error) {
        console.error('加载标签筛选资源失败:', error);
        container.innerHTML = '<div class="no-results">加载资源失败，请刷新页面重试</div>';
    }
}

// 搜索
function initializeSearch() {
    var searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
}

async function performSearch() {
    var keyword = document.getElementById('searchInput').value;
    if (!keyword.trim()) {
        alert('请输入搜索关键词');
        return;
    }

    try {
        // 从服务器API获取资源数据，添加缓存控制参数
        const response = await fetch('/api/resources?_=' + Date.now());
        if (!response.ok) {
            throw new Error('获取资源数据失败');
        }
        var resources = await response.json();

        // 搜索资源
        var searchResults = resources.filter(resource => {
            const searchText = (resource.title + ' ' + (resource.description || '') + ' ' + (resource.tags || []).join(' ')).toLowerCase();
            return searchText.includes(keyword.toLowerCase());
        });

        // 显示搜索结果
        if (searchResults.length > 0) {
            // 创建搜索结果页面
            var searchOverlay = document.createElement('div');
            searchOverlay.className = 'search-overlay';
            
            var resultsHTML = '<div class="search-results-header">';
            resultsHTML += '<h3>搜索结果: ' + keyword + '</h3>';
            resultsHTML += '<div class="search-results-count">找到 ' + searchResults.length + ' 个结果</div>';
            resultsHTML += '<button class="close-search-btn" onclick="this.closest(\'.search-overlay\').remove()">×</button>';
            resultsHTML += '</div>';
            
            resultsHTML += '<div class="search-results-container">';
            searchResults.forEach(resource => {
                const thumb = resource.thumbnail || '';
                resultsHTML += '<div class="search-result-card">';
                resultsHTML += '<h3 class="search-result-title">' + resource.title + '</h3>';
                resultsHTML += '<p class="search-result-description">' + (resource.description || '') + '</p>';
                resultsHTML += '<div class="search-result-meta">';
                resultsHTML += '<span>⬇ ' + (resource.downloads || 0) + '</span>';
                resultsHTML += '<span>⭐ ' + (resource.rating || '0') + '</span>';
                resultsHTML += '<span>' + resource.category + '</span>';
                resultsHTML += '</div>';
                resultsHTML += '<button class="view-details-btn" onclick="downloadResource(\'' + resource.id + '\', \'' + resource.title + '\')">下载资源</button>';
                resultsHTML += '</div>';
            });
            resultsHTML += '</div>';
            
            searchOverlay.innerHTML = resultsHTML;
            document.body.appendChild(searchOverlay);
        } else {
            // 显示无结果页面
            var searchOverlay = document.createElement('div');
            searchOverlay.className = 'search-overlay';
            
            var noResultsHTML = '<div class="search-results-header">';
            noResultsHTML += '<h3>搜索结果: ' + keyword + '</h3>';
            noResultsHTML += '<div class="search-results-count">找到 0 个结果</div>';
            noResultsHTML += '<button class="close-search-btn" onclick="this.closest(\'.search-overlay\').remove()">×</button>';
            noResultsHTML += '</div>';
            
            noResultsHTML += '<div class="no-search-results">';
            noResultsHTML += '<h3>未找到匹配的资源</h3>';
            noResultsHTML += '<p>请尝试使用其他关键词或浏览分类目录</p>';
            noResultsHTML += '<button class="back-home-btn" onclick="this.closest(\'.search-overlay\').remove()">返回首页</button>';
            noResultsHTML += '</div>';
            
            searchOverlay.innerHTML = noResultsHTML;
            document.body.appendChild(searchOverlay);
        }
    } catch (error) {
        console.error('搜索失败:', error);
        alert('搜索失败，请稍后重试');
    }
}

// 预览文档
async function previewDocument(docId, docTitle) {
    try {
        // 获取资源信息
        const response = await fetch(`/api/resources/${docId}`);
        if (!response.ok) {
            throw new Error('获取资源信息失败');
        }
        const resource = await response.json();
        
        if (!resource || !resource.downloadUrl) {
            throw new Error('资源下载链接不存在');
        }
        
        let downloadUrl = resource.downloadUrl;
        // 确保使用完整的URL路径
        if (downloadUrl && !downloadUrl.startsWith('http')) {
            const baseUrl = window.location.origin;
            downloadUrl = baseUrl + downloadUrl;
        }
        
        // 检查文件类型
        const isPDF = downloadUrl && downloadUrl.toLowerCase().endsWith('.pdf');
        const isVideo = downloadUrl && /\.(mp4|avi|mov|wmv|flv|mkv)$/i.test(downloadUrl);
        
        if (isVideo) {
            // 调用视频预览函数
            previewVideo(docId, docTitle);
            return;
        }
        
        // 创建文档预览模态框
        const modal = document.createElement('div');
        modal.className = 'modal document-preview-modal';
        
        if (isPDF) {
            // PDF预览 - 使用iframe
            modal.innerHTML = `
                <div class="modal-content document-preview-content">
                    <div class="modal-header">
                        <h2>PDF预览: ${docTitle}</h2>
                        <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                    </div>
                    <div class="modal-body">
                        <div class="pdf-container">
                            <iframe src="${downloadUrl}" style="width: 100%; height: 100%; border: none;"></iframe>
                        </div>
                        <div class="pdf-info" style="margin-top: 10px; font-size: 14px; color: #666;">
                            <p>如果PDF无法显示，请尝试<a href="${downloadUrl}" target="_blank">直接打开</a>或<a href="${downloadUrl}" download>下载</a>后查看。</p>
                        </div>
                    </div>
                </div>
            `;
        } else {
            // 其他文档类型
            modal.innerHTML = `
                <div class="modal-content document-preview-content">
                    <div class="modal-header">
                        <h2>文档预览: ${docTitle}</h2>
                        <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                    </div>
                    <div class="modal-body">
                        <div class="document-placeholder">
                            <div class="document-icon">📄</div>
                            <h3>文档预览</h3>
                            <p>当前仅支持PDF文件的在线预览。</p>
                            <div class="document-info">
                                <p><strong>文档ID:</strong> ${docId}</p>
                                <p><strong>文档标题:</strong> ${docTitle}</p>
                                <p><strong>文件类型:</strong> ${downloadUrl.split('.').pop().toUpperCase()}</p>
                            </div>
                            <div class="preview-actions">
                                <button class="btn-secondary" onclick="downloadResource('${docId}', '${docTitle}')">
                                    下载文档
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        document.body.appendChild(modal);
        modal.style.display = 'block';

        // 添加文档预览样式
        const style = document.createElement('style');
        style.textContent = `
            .modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0,0,0,0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }
            
            .modal-content {
                background-color: white;
                padding: 20px;
                border-radius: 10px;
                width: 80%;
                max-width: 800px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 1px solid #dee2e6;
            }
            
            .modal-header h2 {
                margin: 0;
                font-size: 20px;
            }
            
            .close {
                font-size: 24px;
                cursor: pointer;
            }
            
            .document-preview-modal .modal-content {
                width: 90%;
                max-width: 900px;
                max-height: 90vh;
            }

            .document-placeholder {
                text-align: center;
                padding: 40px;
                background: #f8f9fa;
                border-radius: 10px;
            }

            .document-icon {
                font-size: 64px;
                margin-bottom: 20px;
                opacity: 0.5;
            }

            .document-info {
                margin: 20px 0;
                text-align: left;
                background: white;
                padding: 15px;
                border-radius: 5px;
                border: 1px solid #dee2e6;
            }

            .document-info p {
                margin: 8px 0;
                font-size: 14px;
            }

            .preview-actions {
                margin-top: 20px;
                display: flex;
                gap: 15px;
                justify-content: center;
            }
            
            .btn-primary {
                background-color: #3498DB;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
            }
            
            .btn-secondary {
                background-color: #f0f0f0;
                color: #333;
                border: 1px solid #dee2e6;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
            }
            
            .pdf-container {
                width: 100%;
                height: 600px;
                overflow: auto;
                border: 1px solid #dee2e6;
                border-radius: 5px;
            }
            
            #pdf-canvas {
                display: block;
                margin: 0 auto;
                max-width: 100%;
            }
            
            .pdf-controls {
                margin-top: 10px;
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 10px;
            }
            
            .pdf-controls button {
                padding: 5px 10px;
                border: 1px solid #dee2e6;
                background-color: #f8f9fa;
                border-radius: 3px;
                cursor: pointer;
            }
        `;
        document.head.appendChild(style);
        
        // 如果是PDF文件，加载PDF.js并预览
        if (isPDF) {
            // 加载PDF.js库
            if (typeof pdfjsLib === 'undefined') {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
                script.onload = function() {
                    // 配置PDF.js
                    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
                    loadPDF(downloadUrl);
                };
                document.head.appendChild(script);
            } else {
                // 确保PDF.js配置正确
                if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
                    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
                }
                loadPDF(downloadUrl);
            }
        }
        
        // 加载PDF函数
        function loadPDF(url) {
            console.log('开始加载PDF:', url);
            const canvas = document.getElementById('pdf-canvas');
            const ctx = canvas.getContext('2d');
            const prevPageBtn = document.getElementById('prev-page');
            const nextPageBtn = document.getElementById('next-page');
            const pageNumEl = document.getElementById('page-num');
            
            let pdfDoc = null;
            let pageNum = 1;
            const scale = 1.5;
            
            // 显示加载状态
            const pdfContainer = document.querySelector('.pdf-container');
            pdfContainer.innerHTML = '<div style="text-align: center; padding: 40px;">加载PDF中...</div>';
            
            // 检查PDF.js是否正确加载
            if (typeof pdfjsLib === 'undefined') {
                console.error('PDF.js库未加载');
                pdfContainer.innerHTML = '<div style="text-align: center; padding: 40px;">PDF.js库加载失败，请刷新页面重试</div>';
                return;
            }
            
            console.log('PDF.js版本:', pdfjsLib.version);
            console.log('Worker路径:', pdfjsLib.GlobalWorkerOptions.workerSrc);
            
            // 加载PDF文档
            pdfjsLib.getDocument({ 
                url: url,
                cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/cmaps/',
                cMapPacked: true
            }).promise.then(function(pdf) {
                console.log('PDF加载成功:', pdf.numPages, '页');
                pdfDoc = pdf;
                pageNumEl.textContent = `${pageNum} / ${pdf.numPages}`;
                
                // 重新创建canvas元素
                pdfContainer.innerHTML = '<canvas id="pdf-canvas"></canvas>';
                const newCanvas = document.getElementById('pdf-canvas');
                const newCtx = newCanvas.getContext('2d');
                
                renderPage(pageNum, newCanvas, newCtx);
                
                // 绑定按钮事件
                prevPageBtn.addEventListener('click', function() {
                    if (pageNum <= 1) return;
                    pageNum--;
                    renderPage(pageNum, newCanvas, newCtx);
                });
                
                nextPageBtn.addEventListener('click', function() {
                    if (pageNum >= pdf.numPages) return;
                    pageNum++;
                    renderPage(pageNum, newCanvas, newCtx);
                });
            }).catch(function(error) {
                console.error('加载PDF失败:', error);
                pdfContainer.innerHTML = `<div style="text-align: center; padding: 40px;">加载PDF失败: ${error.message}</div>`;
            });
            
            // 渲染页面
            function renderPage(num, canvas, ctx) {
                console.log('渲染页面:', num);
                pdfDoc.getPage(num).then(function(page) {
                    const viewport = page.getViewport({ scale: scale });
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    
                    const renderContext = {
                        canvasContext: ctx,
                        viewport: viewport
                    };
                    
                    page.render(renderContext).promise.then(function() {
                        pageNumEl.textContent = `${num} / ${pdfDoc.numPages}`;
                        console.log('页面渲染成功:', num);
                    }).catch(function(error) {
                        console.error('渲染页面失败:', error);
                        pdfContainer.innerHTML = `<div style="text-align: center; padding: 40px;">渲染页面失败: ${error.message}</div>`;
                    });
                }).catch(function(error) {
                    console.error('获取页面失败:', error);
                    pdfContainer.innerHTML = `<div style="text-align: center; padding: 40px;">获取页面失败: ${error.message}</div>`;
                });
            }
        }
    } catch (error) {
        console.error('预览文档失败:', error);
        alert('预览文档失败: ' + error.message);
    }
}

// 预览视频
async function previewVideo(videoId, videoTitle) {
    try {
        // 获取视频资源信息
        const response = await fetch(`/api/resources/${videoId}`);
        if (!response.ok) {
            throw new Error('获取资源信息失败');
        }
        const video = await response.json();
        
        let videoUrl = '';
        if (video && video.downloadUrl) {
            videoUrl = video.downloadUrl;
        }
        
        // 创建视频预览模态框
        const modal = document.createElement('div');
        modal.className = 'modal video-preview-modal';
        
        // 构建视频播放内容
        let videoContent;
        if (videoUrl) {
            // 确保 URL 是完整的
            let fullVideoUrl = videoUrl;
            if (!fullVideoUrl.startsWith('http')) {
                // 构建完整的 URL
                fullVideoUrl = window.location.origin + fullVideoUrl;
            }
            
            videoContent = `
                <div class="video-player-container">
                    <video controls width="100%" height="auto" style="max-height: 60vh;">
                        <source src="${fullVideoUrl}" type="video/mp4">
                        您的浏览器不支持视频播放。
                    </video>
                </div>
            `;
        } else {
            videoContent = `
                <div class="video-placeholder">
                    <div class="video-icon">🎥</div>
                    <h3>视频预览功能</h3>
                    <p>当前视频文件不可用，请尝试下载后观看。</p>
                </div>
            `;
        }
        
        modal.innerHTML = `
            <div class="modal-content video-preview-content">
                <div class="modal-header">
                    <h2>视频预览: ${videoTitle}</h2>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <div class="modal-body">
                    ${videoContent}
                    <div class="video-actions" style="margin-top: 20px; display: flex; gap: 15px; justify-content: center;">
                        <button class="btn-primary" onclick="downloadResource('${videoId}', '${videoTitle}')">
                            下载视频
                        </button>
                        <button class="btn-secondary" onclick="this.closest('.modal').remove()">
                            关闭
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.style.display = 'block';

        // 添加视频预览样式
        const style = document.createElement('style');
        style.textContent = `
            .modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0,0,0,0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }
            
            .modal-content {
                background-color: white;
                padding: 20px;
                border-radius: 10px;
                width: 80%;
                max-width: 800px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 1px solid #dee2e6;
            }
            
            .modal-header h2 {
                margin: 0;
                font-size: 20px;
            }
            
            .close {
                font-size: 24px;
                cursor: pointer;
            }
            
            .video-preview-modal .modal-content {
                width: 80%;
                max-height: 90vh;
            }

            .video-player-container {
                text-align: center;
                margin-bottom: 20px;
            }

            .video-placeholder {
                text-align: center;
                padding: 40px;
                background: #f8f9fa;
                border-radius: 10px;
                margin-bottom: 20px;
            }

            .video-icon {
                font-size: 64px;
                margin-bottom: 20px;
                opacity: 0.5;
            }

            .btn-primary {
                background-color: #3498DB;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
            }
            
            .btn-secondary {
                background-color: #f0f0f0;
                color: #333;
                border: 1px solid #dee2e6;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
            }
        `;
        document.head.appendChild(style);
    } catch (error) {
        console.error('预览视频失败:', error);
        alert('预览视频失败: ' + error.message);
    }
}

// 返回顶部
function initializeScrollToTop() {
    var backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                backToTop.style.display = 'block';
            } else {
                backToTop.style.display = 'none';
            }
        });
    }
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}