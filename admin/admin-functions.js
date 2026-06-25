// 文件选择器 - 改用下拉菜单
async function showFileSelector() {
    try {
        // 从服务器获取最新的文件列表
        const response = await fetch('/api/uploads?' + new Date().getTime());
        if (!response.ok) {
            throw new Error('获取文件列表失败');
        }
        const categorizedFiles = await response.json();
        
        // 合并所有文件到一个数组
        const files = [
            ...(categorizedFiles.archive || []),
            ...(categorizedFiles.software || []),
            ...(categorizedFiles.document || []),
            ...(categorizedFiles.video || []),
            ...(categorizedFiles.image || []),
            ...(categorizedFiles.other || [])
        ];

        if (files.length === 0) {
            alert('暂无已上传的文件');
            return;
        }

        // 创建下拉选项
        var options = '';
        for (var i = 0; i < files.length; i++) {
            var fileName = files[i].originalName || files[i].name;
            options += '<option value="' + files[i].url + '">' + fileName + '</option>';
        }

        var html = '<div id="file-selector-modal" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;">' +
            '<div style="background:white;padding:20px;border-radius:8px;max-width:400px;width:90%;">' +
            '<h3>选择文件</h3>' +
            '<select id="file-select" style="width:100%;padding:10px;margin:10px 0;">' + options + '</select>' +
            '<button onclick="confirmFileSelect()" style="padding:10px 20px;background:#3498db;color:white;border:none;border-radius:4px;cursor:pointer;">确定</button>' +
            ' <button onclick="closeFileSelector()" style="padding:10px 20px;background:#ccc;border:none;border-radius:4px;cursor:pointer;">取消</button>' +
            '</div></div>';

        document.body.insertAdjacentHTML('beforeend', html);
    } catch (error) {
        console.error('加载文件列表失败:', error);
        alert('加载文件列表失败，请刷新页面重试');
    }
}

function confirmFileSelect() {
    var select = document.getElementById('file-select');
    if (select) {
        document.getElementById('resourceUrl').value = select.value;
    }
    closeFileSelector();
}

function closeFileSelector() {
    var modal = document.getElementById('file-selector-modal');
    if (modal) modal.remove();
}

// 图片选择器 - 改用下拉菜单
async function showImageSelector() {
    try {
        // 从服务器获取最新的文件列表
        const response = await fetch('/api/uploads?' + new Date().getTime());
        if (!response.ok) {
            throw new Error('获取文件列表失败');
        }
        const categorizedFiles = await response.json();
        
        // 合并所有文件到一个数组
        const files = [
            ...(categorizedFiles.archive || []),
            ...(categorizedFiles.software || []),
            ...(categorizedFiles.document || []),
            ...(categorizedFiles.video || []),
            ...(categorizedFiles.image || []),
            ...(categorizedFiles.other || [])
        ];
        
        var images = [];

        for (var i = 0; i < files.length; i++) {
            var fileName = files[i].originalName || files[i].name;
            var ext = fileName.split('.').pop().toLowerCase();
            if (['png', 'jpg', 'jpeg', 'gif', 'webp'].indexOf(ext) !== -1) {
                images.push(files[i]);
            }
        }

        if (images.length === 0) {
            alert('暂无已上传的图片');
            return;
        }

        var options = '';
        for (var i = 0; i < images.length; i++) {
            var fileName = images[i].originalName || images[i].name;
            options += '<option value="' + images[i].url + '">' + fileName + '</option>';
        }

        var html = '<div id="image-selector-modal" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;">' +
            '<div style="background:white;padding:20px;border-radius:8px;max-width:400px;width:90%;">' +
            '<h3>选择图片</h3>' +
            '<select id="image-select" style="width:100%;padding:10px;margin:10px 0;">' + options + '</select>' +
            '<button onclick="confirmImageSelect()" style="padding:10px 20px;background:#3498db;color:white;border:none;border-radius:4px;cursor:pointer;">确定</button>' +
            ' <button onclick="closeImageSelector()" style="padding:10px 20px;background:#ccc;border:none;border-radius:4px;cursor:pointer;">取消</button>' +
            '</div></div>';

        document.body.insertAdjacentHTML('beforeend', html);
    } catch (error) {
        console.error('加载图片列表失败:', error);
        alert('加载图片列表失败，请刷新页面重试');
    }
}

function confirmImageSelect() {
    var select = document.getElementById('image-select');
    if (select) {
        document.getElementById('resourceThumbnail').value = select.value;
    }
    closeImageSelector();
}

function closeImageSelector() {
    var modal = document.getElementById('image-selector-modal');
    if (modal) modal.remove();
}