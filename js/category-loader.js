// 分类加载和导航栏动态生成

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
    // 默认分类
    return {
        "office": "办公工具",
        "ai": "AI工具",
        "documents": "文档资料",
        "videos": "视频教程"
    };
}

// 生成导航栏
function generateNavigation() {
    const categories = getCategories();
    const navMenu = document.querySelector('.nav-menu');
    const footerLinks = document.querySelector('.footer-section ul');
    const categoryGrid = document.querySelector('.category-grid');
    
    if (navMenu) {
        // 保留首页链接
        const homeLink = navMenu.querySelector('li:first-child');
        navMenu.innerHTML = '';
        if (homeLink) {
            navMenu.appendChild(homeLink);
        }
        
        // 动态添加分类链接
            for (const [key, value] of Object.entries(categories)) {
                const li = document.createElement('li');
                const a = document.createElement('a');
                // 使用正确的文件名格式
                const fileName = key === 'ai' ? 'ai-tools.html' : 
                               key === 'office' ? 'office-tools.html' : 
                               key === 'documents' ? 'documents.html' : 
                               key === 'videos' ? 'videos.html' : `${key}.html`;
                a.href = fileName;
                a.textContent = value;
                
                // 设置当前页面的active状态
                const currentPath = window.location.pathname;
                if (currentPath.includes(key)) {
                    a.classList.add('active');
                }
                
                li.appendChild(a);
                navMenu.appendChild(li);
            }
    }
    
    if (footerLinks) {
        footerLinks.innerHTML = '';
        for (const [key, value] of Object.entries(categories)) {
            const li = document.createElement('li');
            const a = document.createElement('a');
            // 使用正确的文件名格式
            const fileName = key === 'ai' ? 'ai-tools.html' : 
                           key === 'office' ? 'office-tools.html' : 
                           key === 'documents' ? 'documents.html' : 
                           key === 'videos' ? 'videos.html' : `${key}.html`;
            a.href = fileName;
            a.textContent = value;
            li.appendChild(a);
            footerLinks.appendChild(li);
        }
    }
    
    if (categoryGrid) {
        categoryGrid.innerHTML = '';
        for (const [key, value] of Object.entries(categories)) {
            const categoryCard = document.createElement('div');
            categoryCard.className = 'category-card';
            // 使用正确的文件名格式
            const fileName = key === 'ai' ? 'ai-tools.html' : 
                           key === 'office' ? 'office-tools.html' : 
                           key === 'documents' ? 'documents.html' : 
                           key === 'videos' ? 'videos.html' : `${key}.html`;
            categoryCard.onclick = () => window.location.href = fileName;
            
            const icon = getCategoryIcon(key);
            
            categoryCard.innerHTML = `
                <div class="category-icon">${icon}</div>
                <h3>${value}</h3>
                <p>${getCategoryDescription(key)}</p>
                <span class="resource-count">${getCategoryResourceCount(key)}个资源</span>
            `;
            
            categoryGrid.appendChild(categoryCard);
        }
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

// 获取分类描述
function getCategoryDescription(category) {
    const descriptions = {
        'office': 'Office套件、项目管理、协作工具',
        'ai': '人工智能助手、AI写作、AI设计',
        'documents': '技术文档、使用手册、电子书',
        'videos': '在线课程、视频教程、技术分享'
    };
    return descriptions[category] || '相关资源';
}

// 获取分类资源数量
function getCategoryResourceCount(category) {
    const resources = JSON.parse(localStorage.getItem('resources') || '[]');
    return resources.filter(r => r.category === category).length;
}

// 加载邮箱地址
function loadContactEmail() {
    const settings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
    const contactEmail = settings.contactEmail || 'contact@example.com';
    
    const emailElements = document.querySelectorAll('footer .footer-section p');
    emailElements.forEach(element => {
        if (element.textContent.includes('📧')) {
            element.textContent = `📧 ${contactEmail}`;
        }
    });
}

// 页面加载完成后执行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        generateNavigation();
        loadContactEmail();
    });
} else {
    generateNavigation();
    loadContactEmail();
}
