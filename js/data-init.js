// 初始化数据
function initializeData() {
    // 检查localStorage是否已有数据
    const stored = localStorage.getItem('resources');
    if (!stored) {
        // 尝试从JSON文件加载
        fetch('data/resources.json')
            .then(response => response.json())
            .then(data => {
                localStorage.setItem('resources', JSON.stringify(data));
                console.log('数据已从resources.json加载');
            })
            .catch(error => {
                // 不使用默认数据，保持localStorage为空
                console.log('从JSON文件加载数据失败:', error);
            });
    }
    // 已有数据则不覆盖，保留用户上传的资源
}

// 如果直接运行此脚本
if (typeof window !== 'undefined') {
    // 等待DOM加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeData);
    } else {
        initializeData();
    }
}