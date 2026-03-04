<template>
  <view class="container" id="container">
    <!-- Background Elements -->
    <view class="grid-bg"></view>
    <view class="particles"></view>
    <view class="scan-line"></view>
    
    <!-- Header -->
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="header-content">
        <view class="back-btn" @click="goBack">
          <text class="back-arrow">←</text>
        </view>
        <text class="page-title">考前焦虑心魔扫描</text>
        <view class="info-btn" style="opacity: 0; pointer-events: none;">
          <!-- Placeholder for layout balance -->
        </view>
      </view>
      <text class="subtitle">点击气泡 · 捕获念头</text>
    </view>

    <!-- Thought Bubbles Area -->
    <view class="bubbles-area">
      <view 
        v-for="(item, index) in thoughts" 
        :key="item.id"
        class="thought-bubble"
        :data-index="index"
        :data-id="item.id"
        :data-window-height="windowHeight"
        :style="{ top: item.top + 'px', left: item.left + 'px', zIndex: item.zIndex }"
        @touchstart="drag.touchstart"
        @touchmove="drag.touchmove"
        @touchend="drag.touchend"
      >
        <view class="bubble-content" :class="[item.theme, { 'glitch-anim': item.isGlitching }]">
          <text class="thought-text">{{ item.text }}</text>
          <view class="bubble-border"></view>
        </view>
      </view>
    </view>

    <!-- Drop Zone (Shredder) -->
    <view class="shredder-zone" id="shredder-zone">
      <view class="shredder-grid"></view>
      <view class="shredder-label">
        <view class="icon icon-delete danger-icon"></view>
        <text class="label-text">思维粉碎区</text>
      </view>
      <view class="laser-line"></view>
    </view>
    
    <!-- Diagnosis Report Button (Hidden initially, shown when cleared) -->
    <view class="report-btn-container" :class="{ 'show': thoughts.length === 0 }">
      <button class="report-btn" @click="viewReport">
        <text>查看诊断报告</text>
        <view class="icon icon-forward"></view>
      </button>
    </view>
  </view>
</template>

<script module="drag" lang="wxs">
var startX = 0;
var startY = 0;
var lastLeft = 0;
var lastTop = 0;
var screenHeight = 0;
var shredderTop = 0;
var maxZIndex = 1000;

function touchstart(event, ownerInstance) {
  var instance = event.instance;
  var state = instance.getState();
  var touch = event.touches[0];
  
  // 1. Sync start positions immediately
  state.startX = touch.clientX;
  state.startY = touch.clientY;
  
  // 2. Ensure we have the last position (default to 0 if undefined)
  state.lastTx = state.lastTx || 0;
  state.lastTy = state.lastTy || 0;
  
  // 3. Bring to front
  maxZIndex++;
  
  // 4. FORCE UPDATE STYLE IMMEDIATELY
  instance.setStyle({
    'z-index': maxZIndex,
    'transition': 'none', /* KILL any animation instantly */
    'transform': 'translate3d(' + state.lastTx + 'px, ' + state.lastTy + 'px, 0)'
  });
  
  // 5. Active feedback
    var shredder = ownerInstance.selectComponent('#shredder-zone');
    if (shredder) {
      shredder.addClass('active');
    }

    // Cache window height only once if needed
    if (!screenHeight) {
      var dataset = instance.getDataset();
      if (dataset.windowHeight) {
        screenHeight = dataset.windowHeight;
        // IMPORTANT: 0.78 must match the CSS shredder-zone height (22% height = top at 78%)
        shredderTop = screenHeight * 0.78;
      }
    }
  }

function touchmove(event, ownerInstance) {
  var instance = event.instance;
  var state = instance.getState();
  var touch = event.touches[0];
  if (!touch) return;
  
  var dx = touch.clientX - state.startX;
  var dy = touch.clientY - state.startY;
  var currentTx = state.lastTx + dx;
  var currentTy = state.lastTy + dy;
  instance.setStyle({
    transform: 'translate3d(' + currentTx + 'px, ' + currentTy + 'px, 0)'
  });
}

function touchend(event, ownerInstance) {
  var instance = event.instance;
  var state = instance.getState();
  var touch = event.changedTouches[0];
  if (!touch) return;
  
  var clientY = touch.clientY;
  var dx = touch.clientX - state.startX;
  var dy = touch.clientY - state.startY;
  
  // Accumulate the delta
  state.lastTx += dx;
  state.lastTy += dy;
  
  // Force set the final transform to ensure position is locked
  instance.setStyle({
    transform: 'translate3d(' + state.lastTx + 'px, ' + state.lastTy + 'px, 0)',
    transition: 'none'
  });

  if (!screenHeight) {
    var dataset = instance.getDataset();
    if (dataset.windowHeight) {
      screenHeight = dataset.windowHeight;
    }
  }
  
  var isDestroyed = false;
  if (screenHeight && clientY > (screenHeight * 0.78)) {
    isDestroyed = true;
  }
  
  if (isDestroyed) {
    var dataset = instance.getDataset();
    ownerInstance.callMethod('destroyItem', { index: dataset.index, id: dataset.id });
    instance.setStyle({
      transform: 'scale(0)',
      opacity: 0,
      transition: 'all 0.3s ease'
    });
    // Remove active class
    var shredder = ownerInstance.selectComponent('#shredder-zone');
    if (shredder) {
      shredder.removeClass('active');
    }
  } else {
    // Remove active class
    var shredder = ownerInstance.selectComponent('#shredder-zone');
    if (shredder) {
      shredder.removeClass('active');
    }
  }
}

module.exports = {
  touchstart: touchstart,
  touchmove: touchmove,
  touchend: touchend
};
</script>

<script>
import anxietyData from './anxiety_data.json';

export default {
  data() {
    return {
      statusBarHeight: 20,
      thoughts: [],
      windowHeight: 800,
      windowWidth: 375
    };
  },
  onLoad() {
    const sysInfo = uni.getSystemInfoSync();
    this.statusBarHeight = sysInfo.statusBarHeight || 20;
    this.windowHeight = sysInfo.windowHeight;
    this.windowWidth = sysInfo.windowWidth;
    
    this.initThoughts();
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    initThoughts() {
      const rawData = anxietyData;
      const safeZoneTop = this.statusBarHeight + 100; // Header space
      const safeZoneBottom = this.windowHeight * 0.75; // Above shredder
      const safeZoneWidth = this.windowWidth - 40; // Padding
      
      this.thoughts = rawData.map((text, index) => {
        // Simple random placement with basic collision avoidance attempt
        // We'll just randomize for now, real collision physics is complex for initialization
        // but we can ensure they are somewhat spread out.
        
        const top = Math.random() * (safeZoneBottom - safeZoneTop) + safeZoneTop;
        const left = Math.random() * (safeZoneWidth - 200) + 20; // 200 is approx bubble width
        
        const themes = ['theme-purple', 'theme-orange', 'theme-blue'];
        const theme = themes[Math.floor(Math.random() * themes.length)];

        return {
          id: index,
          text: text,
          top: Math.floor(top),
          left: Math.floor(left),
          zIndex: index + 1,
          isGlitching: false,
          theme: theme
        };
      });
    },
    destroyItem(data) {
      const { index, id } = data;
      console.log('Destroying item:', index);
      
      // Haptic Feedback
      uni.vibrateShort({
        success: () => console.log('Vibrate success'),
        fail: () => console.log('Vibrate fail') // Haptic might not work on dev tools
      });
      
      // We could play a sound here too
      
      // Remove from list
      // Find index by ID to be safe if array mutated
      const realIndex = this.thoughts.findIndex(t => t.id === id);
      if (realIndex !== -1) {
        this.thoughts.splice(realIndex, 1);
      }
      
      if (this.thoughts.length === 0) {
        uni.showToast({
          title: '思维已清空',
          icon: 'success'
        });
      }
    },
    viewReport() {
      // Navigate to report page (placeholder)
      uni.showToast({
        title: '生成诊断报告...',
        icon: 'none'
      });
    }
  }
};
</script>

<style>
/* Icons */
.icon {
  width: 48rpx;
  height: 48rpx;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  display: block;
}

.icon-back {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ffffff'%3E%3Cpath d='M11.67 3.87L9.9 2.1 0 12l9.9 9.9 1.77-1.77L3.54 12z'/%3E%3C/svg%3E");
}

.icon-info {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ffffff'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z'/%3E%3C/svg%3E");
}

.icon-delete {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ff3333'%3E%3Cpath d='M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z'/%3E%3C/svg%3E");
}

.icon-forward {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ffffff'%3E%3Cpath d='M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z'/%3E%3C/svg%3E");
}

page {
  background-color: #050505;
  color: #fff;
  font-family: 'Courier New', Courier, monospace; /* Monospace for glitch feel */
  overflow: hidden; /* Prevent scrolling */
}

.container {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: radial-gradient(circle at center, #1a0000 0%, #000000 80%); /* 偏红的黑 */
}

/* Background Effects */
.grid-bg {
  display: none; /* 去掉死板的网格，深邃的虚空感 */
}

.particles {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  z-index: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
  pointer-events: none;
  opacity: 0.2; /* 稍微降低一点，更深邃 */
}

.scan-line {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 2px;
  background: rgba(255, 20, 60, 0.5);
  box-shadow: 0 0 15px rgba(255, 20, 60, 0.8);
  animation: scan 6s linear infinite, flicker 0.2s infinite; /* 增加闪烁 */
  z-index: 1;
  pointer-events: none;
  opacity: 0.6;
}

@keyframes flicker {
  0% { opacity: 0.6; }
  50% { opacity: 0.4; }
  100% { opacity: 0.6; }
}

@keyframes scan {
  0% { top: 0%; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}

/* Header */
.header {
  position: relative;
  z-index: 10;
  padding: 0 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header-content {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8rpx;
}

.page-title {
  font-size: 36rpx;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  letter-spacing: 2rpx;
}

.subtitle {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 4rpx;
}

.back-btn, .info-btn {
  width: 70rpx;
  height: 70rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
}

.back-arrow {
  color: #fff;
  font-size: 40rpx;
  font-weight: bold;
  line-height: 1;
}

/* Bubbles */
.bubbles-area {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* Let clicks pass through empty space */
  z-index: 5;
}

.thought-bubble {
  position: absolute;
  pointer-events: auto; /* Enable interaction on bubbles */
  /* Critical for performance and drag responsiveness */
  touch-action: none; 
  user-select: none;
  -webkit-user-select: none;
  will-change: transform;
  /* Transition handled by WXS or when spring back */
}

/* 重新设计气泡容器 */
.bubble-content {
  background: rgba(30, 0, 10, 0.85); /* 更深的红黑底色 */
  backdrop-filter: blur(8px);
  /* 移除之前的 border 和 border-radius */
  border: none;
  border-radius: 4px; /* 微小圆角 */
  padding: 20rpx 32rpx;
  max-width: 420rpx;
  position: relative;
  overflow: visible; /* 允许伪元素溢出做特效 */

  /* 核心：多重故障风边框和发光 */
  box-shadow: 
    0 0 0 1px rgba(255, 40, 80, 0.6), /* 基础细红框 */
    0 0 15px rgba(255, 20, 60, 0.3),  /* 内部微光 */
    0 4px 10px rgba(0,0,0,0.5);       /* 投影增加立体感 */

  /* 可选：增加一个科技感切角效果，需要支持 clip-path */
  /* clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px); */
}

/* Color Themes */
/* Purple: Repression - Deep & Mysterious */
.bubble-content.theme-purple {
  background: linear-gradient(135deg, rgba(45, 0, 60, 0.9), rgba(20, 0, 30, 0.95));
  box-shadow: 
    0 0 0 1px rgba(180, 50, 255, 0.4),
    0 0 15px rgba(130, 0, 255, 0.2),
    0 4px 10px rgba(0,0,0,0.5);
}
.bubble-content.theme-purple .thought-text {
  color: #e0ccff;
  text-shadow: 1px 1px 2px rgba(150, 50, 255, 0.6);
}
.bubble-content.theme-purple::before {
  background: repeating-linear-gradient(transparent 0px, transparent 2px, rgba(180, 50, 255, 0.05) 3px, transparent 4px);
}

/* Orange: Anxiety/Restlessness - Energetic & Unstable */
.bubble-content.theme-orange {
  background: linear-gradient(135deg, rgba(60, 20, 0, 0.9), rgba(30, 10, 0, 0.95));
  box-shadow: 
    0 0 0 1px rgba(255, 100, 50, 0.4),
    0 0 15px rgba(255, 60, 0, 0.2),
    0 4px 10px rgba(0,0,0,0.5);
}
.bubble-content.theme-orange .thought-text {
  color: #ffe0cc;
  text-shadow: 1px 1px 2px rgba(255, 100, 50, 0.6);
}
.bubble-content.theme-orange::before {
  background: repeating-linear-gradient(transparent 0px, transparent 2px, rgba(255, 100, 50, 0.05) 3px, transparent 4px);
}

/* Blue: Fear - Cold & Deep */
.bubble-content.theme-blue {
  background: linear-gradient(135deg, rgba(0, 20, 60, 0.9), rgba(0, 10, 30, 0.95));
  box-shadow: 
    0 0 0 1px rgba(50, 150, 255, 0.4),
    0 0 15px rgba(0, 100, 255, 0.2),
    0 4px 10px rgba(0,0,0,0.5);
}
.bubble-content.theme-blue .thought-text {
  color: #ccf0ff;
  text-shadow: 1px 1px 2px rgba(50, 150, 255, 0.6);
}
.bubble-content.theme-blue::before {
  background: repeating-linear-gradient(transparent 0px, transparent 2px, rgba(50, 150, 255, 0.05) 3px, transparent 4px);
}

/* 利用伪元素增加故障扫描线效果 */
.bubble-content::before {
  content: '';
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: repeating-linear-gradient(
    transparent 0px,
    transparent 2px,
    rgba(255, 40, 80, 0.1) 3px,
    transparent 4px
  );
  pointer-events: none;
  z-index: 1;
}

/* 移除原来的 .bubble-border，已经不需要了 */
.bubble-border { display: none; }

/* 修改文字样式，更锐利 */
.thought-text {
  font-size: 28rpx;
  /* 尝试用系统自带的等宽字体，增加代码感，如果没有就回退 */
  font-family: 'Courier New', Courier, monospace, sans-serif;
  color: #fff0f5; /* 偏白的粉色，提高对比度 */
  line-height: 1.5;
  text-shadow: 1px 1px 2px rgba(255, 20, 60, 0.8); /* 文字本身的故障重影 */
  font-weight: 600;
  letter-spacing: 1px;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* Glitch Animation for destroy */
.glitch-anim {
  animation: glitch-destroy 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite;
}

@keyframes glitch-destroy {
  0% { transform: translate(0); }
  20% { transform: translate(-5px, 5px); }
  40% { transform: translate(-5px, -5px); }
  60% { transform: translate(5px, 5px); }
  80% { transform: translate(5px, -5px); }
  100% { transform: translate(0); }
}

/* Shredder Zone - Phantom Mode */
.shredder-zone {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  /* Hitbox remains large for easy dropping */
  height: 22%;
  
  /* Deep Magma Gradient - subtle in idle */
  /* linear-gradient(to top, #4a0000 0%, transparent 100%) */
  background: linear-gradient(to top, rgba(74, 0, 0, 0.6) 0%, transparent 100%);
  border-top: none; /* Soft top edge */
  box-shadow: none; /* Clean idle state */
  
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 40rpx;
  z-index: 1;
  pointer-events: none; /* Let touches pass through to underlying elements if needed, but mainly visual */
  
  transition: all 0.5s ease; /* Smooth breathing transition */
}

.shredder-grid {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background-image: 
    linear-gradient(rgba(255, 50, 50, 0.3) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 50, 50, 0.3) 1px, transparent 1px);
  background-size: 30px 30px;
  opacity: 0.1; /* Almost invisible in idle */
  mask-image: linear-gradient(to bottom, transparent 10%, black 80%);
  transition: opacity 0.5s ease;
}

.shredder-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  z-index: 2;
  margin-bottom: 20rpx;
  opacity: 0.6; /* Dimmed in idle */
  transform: scale(0.9);
  transition: all 0.4s ease;
}

.danger-icon {
  font-size: 56rpx;
  color: #ff3333;
  /* 更强烈的故障闪烁 */
  text-shadow: 2px 0 #f00, -2px 0 #0ff; /* 红蓝故障色散 */
  /* Animation paused in idle */
  animation: none;
}

.label-text {
  font-size: 24rpx;
  font-weight: bold;
  letter-spacing: 4rpx;
  text-shadow: 0 0 5px #ff0000;
  color: #ffcccc;
}

.laser-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px; /* Slightly thicker beam */
  /* Energy Beam Style */
  background: linear-gradient(90deg, transparent, #ff0055, transparent);
  box-shadow: 0 0 10px rgba(255, 0, 85, 0.2);
  opacity: 0; /* Invisible in idle */
  transition: opacity 0.3s ease, box-shadow 0.3s ease;
}

@keyframes laser-jitter {
  0% { opacity: 0.7; transform: scaleY(1); }
  50% { opacity: 1; transform: scaleY(1.5); }
  100% { opacity: 0.7; transform: scaleY(1); }
}

@keyframes pulse {
  0% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
  100% { opacity: 0.7; transform: scale(1); }
}

/* Active Shredder State */
.shredder-zone.active {
  /* 强烈的高能反应 */
  /* Deep Magma lights up */
  background: linear-gradient(to top, rgba(150, 0, 30, 0.9) 0%, rgba(255, 20, 60, 0.1) 100%);
  box-shadow: 
    0 -5px 20px rgba(255, 50, 80, 0.4), /* 顶部边缘发光 */
    0 -20px 60px rgba(255, 0, 40, 0.3) inset; /* 内部强烈红光 */
  transform: scale(1.02); /* 轻微放大 */
}

.shredder-zone.active .shredder-grid {
  opacity: 0.6;
  animation: grid-scroll 0.5s linear infinite; /* Faster scroll */
}

.shredder-zone.active .laser-line {
  opacity: 1;
  box-shadow: 0 0 20px #ff0055, 0 0 40px #ff0055;
  /* 增加一个电流抖动动画 */
  animation: laser-jitter 0.1s infinite;
}

.shredder-zone.active .shredder-label {
  opacity: 1;
  transform: scale(1.1);
}

.shredder-zone.active .danger-icon {
  animation: pulse 0.5s infinite; /* Fast pulse */
  text-shadow: 0 0 20px #ff0000;
}

@keyframes grid-scroll {
  0% { background-position: 0 0; }
  100% { background-position: 0 20px; }
}

/* Report Button */
.report-btn-container {
  position: absolute;
  bottom: 40rpx;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  z-index: 20;
  transform: translateY(200%);
  transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.report-btn-container.show {
  transform: translateY(0);
}

.report-btn {
  background: linear-gradient(90deg, #6d28d9, #8b5cf6);
  color: white;
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 0 60rpx;
  height: 100rpx;
  border-radius: 50rpx;
  box-shadow: 0 10px 30px rgba(139, 92, 246, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.report-btn:active {
  transform: scale(0.95);
}
</style>
