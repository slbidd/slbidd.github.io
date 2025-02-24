let cropper = null;
let currentOpacity = 1.0;

// 初始化事件监听
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('imageInput').addEventListener('change', handleFileSelect);
    document.getElementById('generateBtn').addEventListener('click', generateWatermark);
    document.getElementById('resetBtn').addEventListener('click', resetApp);
    document.getElementById('newProcessBtn').addEventListener('click', resetApp);
    document.querySelector('.opacity-slider').addEventListener('input', e => updateOpacity(e.target.value));
});

// 处理文件选择
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        showCropSection(e.target.result);
    };
    reader.readAsDataURL(file);
}

// 显示裁剪界面
function showCropSection(imageSrc) {
    document.querySelector('.upload-section').hidden = true;
    document.querySelector('.crop-section').hidden = false;
    document.querySelector('.result-section').hidden = true;

    if (cropper) cropper.destroy();
    
    const image = document.getElementById('cropImage');
    image.src = imageSrc;
    
    cropper = new Cropper(image, {
        aspectRatio: 1,
        viewMode: 2,
        autoCropArea: 0.8,
        guides: false,
        background: false
    });
}

// 更新透明度
function updateOpacity(value) {
    currentOpacity = value / 100;
    document.getElementById('opacityValue').textContent = `${value}%`;
}

// 生成水印
async function generateWatermark() {
    if (!cropper) return;

    try {
        toggleButtons(true);
        
        const croppedCanvas = cropper.getCroppedCanvas({
            width: 1000,
            height: 1000,
            fillColor: '#fff'
        });

        const watermark = await loadImage('watermark.png');
        const resultCanvas = await compositeImage(croppedCanvas, watermark);
        
        showResult(resultCanvas);
    } catch (error) {
        alert('处理失败: ' + error.message);
    } finally {
        toggleButtons(false);
    }
}

// 合成图片
function compositeImage(baseImage, watermark) {
    return new Promise(resolve => {
        const canvas = document.createElement('canvas');
        canvas.width = 1000;
        canvas.height = 1000;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(baseImage, 0, 0);
        ctx.globalAlpha = currentOpacity;
        ctx.drawImage(watermark, 0, 0, 1000, 1000);
        
        resolve(canvas);
    });
}

// 显示结果
function showResult(canvas) {
    canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        document.getElementById('resultImage').src = url;
        document.getElementById('downloadLink').href = url;
        
        document.querySelector('.crop-section').hidden = true;
        document.querySelector('.result-section').hidden = false;
    }, 'image/png');
}

// 重置应用
function resetApp() {
    if (document.getElementById('resultImage').src) {
        URL.revokeObjectURL(document.getElementById('resultImage').src);
    }
    
    document.getElementById('imageInput').value = '';
    document.querySelector('.upload-section').hidden = false;
    document.querySelector('.crop-section').hidden = true;
    document.querySelector('.result-section').hidden = true;
    
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
}

// 通用工具函数
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

function toggleButtons(disabled) {
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.disabled = disabled;
    });
}