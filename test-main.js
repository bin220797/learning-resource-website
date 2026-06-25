<!DOCTYPE html>
<html>
<head>
    <title>测试main.js</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        pre { background: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>测试main.js</h1>
    <div id="latestResources"></div>
    
    <script>
        // 模拟loadLatestResources函数
        async function loadLatestResources() {
            var latestResources = document.getElementById('latestResources');
            if (!latestResources) return;

            try {
                console.log('开始从API获取资源...');
                // 从服务器API获取资源数据
                const response = await fetch('/api/resources');
                console.log('API响应状态:', response.status);
                if (!response.ok) {
                    throw new Error('获取资源数据失败: ' + response.status);
                }
                var resources = await response.json();
                console.log('从API获取到的资源数据:', resources);
                
                // 保存到本地存储作为后备
                localStorage.setItem('resources', JSON.stringify(resources));
                console.log('数据已保存到localStorage');

                if (resources.length > 0) {
                    resources.sort(function(a, b) {
                        return new Date(b.uploadDate) - new Date(a.uploadDate);
                    });
                    var sorted = resources.slice(0, 6);

                    latestResources.innerHTML = '';
                    for (var i = 0; i < sorted.length; i++) {
                        var card = document.createElement('div');
                        card.style.margin = '10px 0';
                        card.style.padding = '10px';
                        card.style.border = '1px solid #ccc';
                        card.innerHTML = `<h3>${sorted[i].title}</h3><p>${sorted[i].description}</p>`;
                        latestResources.appendChild(card);
                    }
                    console.log('资源渲染完成');
                } else {
                    latestResources.innerHTML = '<div class="no-results">暂无资源</div>';
                }
            } catch (error) {
                console.error('加载最新资源失败:', error);
                // 回退到本地存储
                var stored = localStorage.getItem('resources');
                var resources = stored ? JSON.parse(stored) : [];
                console.log('从localStorage获取数据:', resources);

                if (resources.length > 0) {
                    resources.sort(function(a, b) {
                        return new Date(b.uploadDate) - new Date(a.uploadDate);
                    });
                    var sorted = resources.slice(0, 6);

                    latestResources.innerHTML = '';
                    for (var i = 0; i < sorted.length; i++) {
                        var card = document.createElement('div');
                        card.style.margin = '10px 0';
                        card.style.padding = '10px';
                        card.style.border = '1px solid #ccc';
                        card.innerHTML = `<h3>${sorted[i].title}</h3><p>${sorted[i].description}</p>`;
                        latestResources.appendChild(card);
                    }
                } else {
                    // 回退到JSON文件
                    console.log('尝试从JSON文件加载数据...');
                    fetch('data/resources.json')
                        .then(response => response.json())
                        .then(data => {
                            console.log('从JSON文件获取数据:', data);
                            if (data.length > 0) {
                                // 保存到本地存储
                                localStorage.setItem('resources', JSON.stringify(data));
                                
                                data.sort(function(a, b) {
                                    return new Date(b.uploadDate) - new Date(a.uploadDate);
                                });
                                var sorted = data.slice(0, 6);

                                latestResources.innerHTML = '';
                                for (var i = 0; i < sorted.length; i++) {
                                    var card = document.createElement('div');
                                    card.style.margin = '10px 0';
                                    card.style.padding = '10px';
                                    card.style.border = '1px solid #ccc';
                                    card.innerHTML = `<h3>${sorted[i].title}</h3><p>${sorted[i].description}</p>`;
                                    latestResources.appendChild(card);
                                }
                            } else {
                                latestResources.innerHTML = '<div class="no-results">暂无资源</div>';
                            }
                        })
                        .catch(fetchError => {
                            console.error('从JSON文件加载数据失败:', fetchError);
                            latestResources.innerHTML = '<div class="no-results">暂无资源</div>';
                        });
                }
            }
        }
        
        // 调用函数
        loadLatestResources();
    </script>
</body>
</html>