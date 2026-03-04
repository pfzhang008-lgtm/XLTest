<template>
  <view class="container">
    <!-- Header (Back) -->
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="back-btn" @click="goHome">
        <text class="material-icons">arrow_back</text>
      </view>
    </view>

    <scroll-view scroll-y class="content-scroll">
      <!-- Hero Visual -->
      <view class="hero-section">
        <view class="brain-container">
          <!-- Rust texture overlay using CSS gradients -->
          <view class="rust-overlay"></view>
          <image 
            src="/static/brain-black.png" 
            mode="aspectFit" 
            class="brain-model"
          ></image>
        </view>
        

      </view>

      <!-- The Verdict -->
      <view class="verdict-section">
        <text class="verdict-label">评估结果：大脑老化</text>
        <view class="verdict-value-box">
          <text class="verdict-value">{{ brainAge }}</text>
          <text class="verdict-unit">岁</text>
        </view>
        <view class="verdict-sub">
          <text>实际生理年龄 </text>
          <text class="aging-highlight">老化 +{{ brainAge - 16 }}年</text>
        </view>
      </view>

      <!-- Data Grid -->
      <view class="data-grid">
        <!-- Card 1: Cognitive Status -->
        <view class="data-card rust-card">
          <view class="card-header">
            <text class="card-title">认知状态</text>
            <text class="material-icons card-icon">psychology_alt</text>
          </view>
          <view class="card-main">
            <text class="card-value-lg">重度生锈</text>
            <view class="status-tag">
              <text class="tag-icon">!</text>
              <text>极高风险</text>
            </view>
          </view>
          <view class="progress-bar-bg">
            <view class="progress-bar-fill rust-fill" style="width: 90%"></view>
          </view>
        </view>

        <!-- Card 2: Latency -->
        <view class="data-card bronze-card">
          <view class="card-header">
            <text class="card-title">反应延迟</text>
            <text class="material-icons card-icon">speed</text>
          </view>
          <view class="card-main">
            <text class="card-value-lg">+{{ avgTime }}ms</text>
            <view class="trend-box">
              <text class="trend-icon">📉</text>
              <text class="trend-text">严重滞后</text>
            </view>
          </view>
          <view class="progress-bar-bg">
            <view class="progress-bar-fill orange-fill" style="width: 85%"></view>
          </view>
        </view>

        <!-- Card 3: Fragmentation (Full Width) -->
        <view class="data-card full-card">
          <view class="fragment-row">
            <view class="fragment-icon-box">
              <view class="pixel-circle"></view>
            </view>
            <view class="fragment-info">
              <text class="fragment-label">注意力碎片化指数</text>
              <view class="fragment-value-row">
                <text class="fragment-score">92/100</text>
                <text class="fragment-desc">(重度涣散)</text>
              </view>
            </view>
           
          </view>
        </view>
      </view>

      
      <view class="spacer"></view>
    </scroll-view>

    <!-- Terminal Command Action (Fixed Bottom) -->
    <view class="terminal-action-area">
      <view class="cmd-btn" hover-class="cmd-btn-active" @click="restartTest">
        <text class="cmd-prompt">></text>
        <text class="cmd-text">重新初始化测试</text>
        <view class="cmd-cursor"></view>
      </view>
    </view>

    <!-- Navigation Bar -->
    <app-tab-bar current-tab="home"></app-tab-bar>
  </view>
</template>

<script>
import AppTabBar from '@/components/AppTabBar.vue';

export default {
  components: {
    AppTabBar
  },
  data() {
    return {
      statusBarHeight: 20,
      score: 0,
      errors: 0,
      avgTime: 450,
      brainAge: 68
    };
  },
  onLoad(options) {
    const sysInfo = uni.getSystemInfoSync();
    this.statusBarHeight = sysInfo.statusBarHeight || 20;
    
    if (options.score) {
      this.score = parseInt(options.score);
      this.errors = parseInt(options.errors) || 0;
      this.avgTime = parseInt(options.avgTime) || 450;
      
      this.calculateBrainAge();
    }
  },
  methods: {
    calculateBrainAge() {
      // Base Age
      let age = 16;
      
      // Error Penalty (+5 years per error)
      age += (this.errors * 5);
      
      // Speed Penalty (Normal ~250ms)
      // +1 year for every 20ms over 250ms
      if (this.avgTime > 250) {
        age += Math.floor((this.avgTime - 250) / 20);
      }
      
      // Cap at reasonable max/min
      if (age > 99) age = 99;
      if (age < 16) age = 16;
      
      this.brainAge = age;
    },
    goHome() {
      uni.reLaunch({ url: '/pages/index/index' });
    },
    restartTest() {
      uni.redirectTo({ url: '/pages/neural-link/test3' });
    }
  }
};
</script>

<style>
/* Material Icons Font */
@font-face {
  font-family: 'Material Icons';
  font-style: normal;
  font-weight: 400;
  src: url(https://fonts.gstatic.com/s/materialicons/v139/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2) format('woff2');
}

.material-icons {
  font-family: 'Material Icons';
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-feature-settings: 'liga';
  -webkit-font-smoothing: antialiased;
}

/* Terminal Command Action (Fixed Bottom) */
.terminal-action-area {
  position: fixed;
  bottom: calc(140rpx + env(safe-area-inset-bottom));
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  padding-top: 20rpx;
  padding-bottom: 20rpx;
  z-index: 50;
  pointer-events: none;
}

.cmd-btn {
  pointer-events: auto;
  background: transparent;
  border: none;
  padding: 20rpx 40rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.cmd-prompt {
  color: rgba(245, 158, 11, 0.7); /* Matching the Orange/Rust theme */
  font-size: 28rpx;
  font-weight: 700;
}

.cmd-text {
  color: rgba(245, 158, 11, 0.7);
  font-size: 28rpx;
  letter-spacing: 2rpx;
}

.cmd-cursor {
  width: 16rpx;
  height: 28rpx;
  background-color: rgba(245, 158, 11, 0.7);
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.cmd-btn-active .cmd-text {
  opacity: 0.5;
  text-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
}

page {
  background-color: #1c1917; /* stone-900 */
  color: #e5e5e5;
  font-family: 'Inter', sans-serif;
}

.container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  padding: 20rpx 32rpx;
  z-index: 10;
}

.back-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.content-scroll {
  flex: 1;
}

/* Hero Section */
.hero-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30rpx 0 30rpx;
  position: relative;
}

.brain-container {
  width: 400rpx;
  height: 400rpx;
  position: relative;
  margin-bottom: 32rpx;
}

.brain-model {
  width: 100%;
  height: 100%;
  filter: sepia(0.8) contrast(1.2) brightness(0.8); /* Rust effect */
}

.rust-overlay {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: radial-gradient(circle, transparent 40%, #1a120b 100%);
  pointer-events: none;
  z-index: 1;
}

.warning-badge {
  display: flex;
  align-items: center;
  gap: 12rpx;
  background: rgba(60, 20, 20, 0.6);
  border: 1px solid #7f1d1d;
  padding: 12rpx 32rpx;
  border-radius: 999px;
  color: #f87171;
  font-size: 24rpx;
  font-weight: 700;
  letter-spacing: 1px;
}

.warning-icon {
  font-size: 28rpx;
}

/* Verdict */
.verdict-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 60rpx;
}

.verdict-label {
  color: #a8a29e;
  font-size: 28rpx;
  margin-bottom: 16rpx;
}

.verdict-value-box {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
  margin-bottom: 16rpx;
}

.verdict-value {
  font-size: 120rpx;
  font-weight: 900;
  line-height: 1;
  color: #FF8C00; /* Sunset Orange */
  text-shadow: 0 4rpx 12rpx rgba(255, 140, 0, 0.3);
}

.verdict-unit {
  font-size: 40rpx;
  color: #FF8C00;
  font-weight: 700;
}

.verdict-sub {
  color: #78716c;
  font-size: 26rpx;
}

.aging-highlight {
  color: #ef4444; /* Red */
  font-weight: 700;
}

/* Data Grid */
.data-grid {
  padding: 0 32rpx;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24rpx;
  margin-bottom: 40rpx;
}

.data-card {
  background: #2D1B12; /* Decay Brown */
  border: 1px solid #4a3b32;
  border-radius: 24rpx;
  padding: 24rpx;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.card-title {
  color: #a8a29e;
  font-size: 24rpx;
  font-weight: 500;
}

.card-icon {
  color: #57534e;
  font-size: 32rpx;
}

.card-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-bottom: 24rpx;
}

.card-value-lg {
  font-size: 40rpx;
  font-weight: 700;
  color: #fff;
}

/* Tags */
.status-tag {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  color: #ef4444;
  font-size: 22rpx;
  font-weight: 700;
}

.tag-icon {
  background: #ef4444;
  color: #2D1B12;
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18rpx;
}

.trend-box {
  display: flex;
  align-items: center;
  gap: 8rpx;
  color: #f59e0b; /* Warning Yellow */
  font-size: 22rpx;
  font-weight: 500;
}

/* Progress Bars */
.progress-bar-bg {
  height: 8rpx;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4rpx;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 4rpx;
}

.rust-fill { background: #d97706; }
.orange-fill { background: #f59e0b; }

/* Full Width Card */
.full-card {
  grid-column: span 2;
  padding: 32rpx;
}

.fragment-row {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.fragment-icon-box {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pixel-circle {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: 
    radial-gradient(transparent 30%, #a8a29e 30%),
    repeating-linear-gradient(45deg, transparent, transparent 2px, #a8a29e 2px, #a8a29e 4px);
  opacity: 0.5;
}

.fragment-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.fragment-label {
  font-size: 24rpx;
  color: #a8a29e;
}

.fragment-value-row {
  display: flex;
  align-items: baseline;
  gap: 12rpx;
}

.fragment-score {
  font-size: 36rpx;
  font-weight: 700;
  color: #fff;
}

.fragment-desc {
  font-size: 24rpx;
  color: #a8a29e;
}

.action-btn {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid #f59e0b;
  padding: 12rpx 24rpx;
  border-radius: 12rpx;
}

.action-btn text {
  color: #f59e0b;
  font-size: 24rpx;
  font-weight: 700;
}

/* Analysis */
.analysis-section {
  padding: 0 40rpx;
  margin-bottom: 40rpx;
}

.analysis-text {
  color: #78716c;
  font-size: 24rpx;
  line-height: 1.6;
  text-align: justify;
}

.spacer {
  height: 200rpx;
}
</style>