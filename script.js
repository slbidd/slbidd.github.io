const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let isProcessing = false;

async function processImage() {
    if (isProcessing) return;
    isProcessing = true;
    
    try {
        // 显示加载状态
        const processBtn = document.querySelector('button.action-btn');
        const spinner = processBtn.querySelector('.loading-spinner');
        const btnText = processBtn.querySelector('.btn-text');
        btnText.textContent = '处理中...';
        spinner.hidden = false;
        processBtn.disabled = true;

        const input = document.getElementById('imageInput');
        const preview = document.getElementById('preview');
        const link = document.getElementById('downloadLink');

        // 验证输入
        if (!input.files[0]) {
            throw new Error('请选择图片文件');
        }
        if (!input.files[0].type.startsWith('image/')) {
            throw new Error('仅支持图片文件');
        }

        // 加载主图片
        const mainImage = await loadImage(URL.createObjectURL(input.files[0]));
        preview.src = URL.createObjectURL(input.files[0]);
        preview.style.display = 'block';

        // 图片处理流程
        const processedImage = adjustAndCrop(mainImage);
        const watermark = await loadImage('watermark.png');
        
        canvas.width = 1000;
        canvas.height = 1000;
        
        // 绘制主图
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(processedImage, 0, 0, 1000, 1000);
        
        // 添加水印
        ctx.globalAlpha = 1;
        ctx.drawImage(watermark, 0, 0, 1000, 1000);
        
        // 显示结果
        preview.src = canvas.toDataURL('image/png');
        link.href = preview.src;
        link.hidden = false;
    } catch (error) {
        console.error('处理失败:', error);
        alert(`错误: ${error.message}`);
    } finally {
        // 重置按钮状态
        const processBtn = document.querySelector('button.action-btn');
        const spinner = processBtn.querySelector('.loading-spinner');
        const btnText = processBtn.querySelector('.btn-text');
        btnText.textContent = '添加水印';
        spinner.hidden = true;
        processBtn.disabled = false;
        isProcessing = false;
    }
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(new Error('图片加载失败'));
        img.src = src;
    });
}

function adjustAndCrop(img) {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    // 计算最佳缩放比例
    const scaleRatio = Math.max(1000 / img.width, 1000 / img.height);
    const scaledWidth = img.width * scaleRatio;
    const scaledHeight = img.height * scaleRatio;
    
    // 缩放图片
    tempCanvas.width = scaledWidth;
    tempCanvas.height = scaledHeight;
    tempCtx.imageSmoothingQuality = 'high';
    tempCtx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
    
    // 裁剪居中区域
    const x = (scaledWidth - 1000) / 2;
    const y = (scaledHeight - 1000) / 2;
    
    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = 1000;
    croppedCanvas.height = 1000;
    croppedCanvas.getContext('2d').drawImage(
        tempCanvas,
        x, y, 1000, 1000,
        0, 0, 1000, 1000
    );
    
    return croppedCanvas;
}

// 实时预览
document.getElementById('imageInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const preview = document.getElementById('preview');
        preview.src = URL.createObjectURL(file);
        preview.style.display = 'block';
    }
});