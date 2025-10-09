// 默认工作时间配置 (存储在localStorage中)
const DEFAULT_WORK_START_HOUR = 9;
const DEFAULT_WORK_START_MINUTE = 0;
const DEFAULT_WORK_END_HOUR = 18;
const DEFAULT_WORK_END_MINUTE = 0;
const DEFAULT_SHOW_MILLISECONDS = false; // 默认不显示毫秒

// 上一个显示的时间（用于动画效果）
let lastTime = "";

// 创建粒子效果
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        // 随机位置
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const size = Math.random() * 5 + 2;
        const animationDuration = Math.random() * 20 + 10;
        const animationDelay = Math.random() * 5;
        const hue = Math.random() * 360;

        particle.style.left = `${posX}%`;
        particle.style.top = `${posY}%`;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.animationDuration = `${animationDuration}s`;
        particle.style.animationDelay = `${animationDelay}s`;
        particle.style.background = `hsla(${hue}, 100%, 70%, 0.7)`;
        particle.style.boxShadow = `0 0 10px hsla(${hue}, 100%, 50%, 0.8)`;

        particlesContainer.appendChild(particle);
    }
}

// 打开设置弹窗
function openSettings() {
    document.getElementById('settingsModal').style.display = 'flex';
    loadConfig();
}

// 关闭设置弹窗
function closeSettings() {
    document.getElementById('settingsModal').style.display = 'none';
}

// 显示成功提示
function showSuccess(message) {
    document.getElementById('successMessage').textContent = message;
    document.getElementById('successModal').style.display = 'flex';

    // 2秒后自动关闭
    setTimeout(function () {
        document.getElementById('successModal').style.display = 'none';
    }, 2000);
}

// 点击弹窗外部关闭弹窗
window.onclick = function (event) {
    const settingsModal = document.getElementById('settingsModal');
    const successModal = document.getElementById('successModal');

    if (event.target == settingsModal) {
        closeSettings();
    } else if (event.target == successModal) {
        successModal.style.display = 'none';
    }
}

let updateInterval; // 用于存储当前的更新间隔

// 更新倒计时
function updateCountdown() {
    // 获取当前时间
    const now = new Date();
    
    // 获取工作时间配置
    const config = getConfig();
    const workStartHour = config.work_start_hour;
    const workStartMinute = config.work_start_minute;
    const workEndHour = config.work_end_hour;
    const workEndMinute = config.work_end_minute;
    const showMilliseconds = config.show_milliseconds || false;
    
    // 根据是否显示毫秒来调整更新频率
    const newInterval = showMilliseconds ? 100 : 1000;
    if (!updateInterval || updateInterval !== newInterval) {
        clearInterval(window.countdownInterval);
        window.countdownInterval = setInterval(updateCountdown, newInterval);
        updateInterval = newInterval;
    }
    
    // 创建今天的工作开始和结束时间
    const workStart = new Date(now);
    workStart.setHours(workStartHour, workStartMinute, 0, 0);
    
    const workEnd = new Date(now);
    workEnd.setHours(workEndHour, workEndMinute, 0, 0);
    
    let timeDiff, message, finished = false;
    
    // 判断当前时间阶段
    if (now < workStart) {
        // 上班前
        timeDiff = workStart - now;
        message = "距离上班还有:";
    } else if (now >= workStart && now < workEnd) {
        // 工作中
        timeDiff = workEnd - now;
        message = "距离下班还有:";
    } else {
        // 下班后
        finished = true;
        message = "🎉 时间到了! 🎉";
    }
    
    if (finished) {
        document.getElementById('countdown').textContent = '时间到了!';
        document.getElementById('countdown').className = 'time-display finished';
        document.getElementById('message').textContent = message;
    } else {
        let timeString;
        // 计算小时、分钟、秒
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
        
        if (showMilliseconds) {
            // 如果开启毫秒显示，计算毫秒
            const milliseconds = Math.floor((timeDiff % 1000) / 10); // 取前两位毫秒数
            timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
        } else {
            // 如果不开启毫秒显示，只显示到秒
            timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        document.getElementById('message').textContent = message;
        
        // 添加数字跳动效果
        if (lastTime !== timeString) {
            const countdownElement = document.getElementById('countdown');
            const digits = timeString.split('');
            let html = '';

            for (let i = 0; i < digits.length; i++) {
                if (digits[i] === ':') {
                    html += '<span>:</span>';
                } else if (digits[i] === '.') {
                    html += '<span>.</span>';
                } else {
                    html += `<span class="digit">${digits[i]}</span>`;
                }
            }

            countdownElement.innerHTML = html;
            lastTime = timeString;
        }
    }
}

// 获取配置信息
function getConfig() {
    const configStr = localStorage.getItem('workTimeConfig');
    if (configStr) {
        return JSON.parse(configStr);
    } else {
        // 返回默认配置
        return {
            work_start_hour: DEFAULT_WORK_START_HOUR,
            work_start_minute: DEFAULT_WORK_START_MINUTE,
            work_end_hour: DEFAULT_WORK_END_HOUR,
            work_end_minute: DEFAULT_WORK_END_MINUTE,
            show_milliseconds: DEFAULT_SHOW_MILLISECONDS
        };
    }
}

// 设置工作时间
function setWorkTime() {
    const startHour = document.getElementById('workStartHour').value;
    const startMinute = document.getElementById('workStartMinute').value;
    const endHour = document.getElementById('workEndHour').value;
    const endMinute = document.getElementById('workEndMinute').value;
    const showMilliseconds = document.getElementById('showMilliseconds').checked;

    // 保存到localStorage
    const config = {
        work_start_hour: parseInt(startHour),
        work_start_minute: parseInt(startMinute),
        work_end_hour: parseInt(endHour),
        work_end_minute: parseInt(endMinute),
        show_milliseconds: showMilliseconds
    };
    
    localStorage.setItem('workTimeConfig', JSON.stringify(config));
    
    // 使用自定义成功提示弹窗
    showSuccess("设置保存成功!");
    // 重新加载倒计时
    updateCountdown();
    // 关闭设置弹窗
    closeSettings();
}

// 加载当前配置
function loadConfig() {
    const config = getConfig();
    document.getElementById('workStartHour').value = config.work_start_hour;
    document.getElementById('workStartMinute').value = config.work_start_minute;
    document.getElementById('workEndHour').value = config.work_end_hour;
    document.getElementById('workEndMinute').value = config.work_end_minute;
    document.getElementById('showMilliseconds').checked = config.show_milliseconds || false;
}

// 页面加载完成后创建粒子并初始化
window.addEventListener('load', function () {
    createParticles();
    // 初始化倒计时更新间隔
    const config = getConfig();
    const showMilliseconds = config.show_milliseconds || false;
    const interval = showMilliseconds ? 100 : 1000;
    window.countdownInterval = setInterval(updateCountdown, interval);
    updateInterval = interval;
});

// 初始化
updateCountdown();