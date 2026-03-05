<template>
  <view class="container">
    <!-- Header -->
    <view class="header" :style="{ paddingTop: (statusBarHeight + 10) + 'px' }">
      <view class="icon-btn" @click="goBack">
        <text class="material-icons">close</text>
      </view>

    </view>

    <!-- Main Content -->
    <scroll-view scroll-y class="main-content">
      <!-- Hero Section -->
      <view class="hero-section">
        <view class="glow-effect" :style="{ backgroundColor: rankColor, boxShadow: '0 0 120rpx ' + rankColor }"></view>
        <view class="brain-visual" :style="{ borderColor: rankColor, boxShadow: '0 0 60rpx ' + rankColor + '33' }">
          <image 
            class="brain-image" 
            :src="brainImageUrl" 
            mode="aspectFill"
          ></image>
          <view class="overlay-gradient" :style="{ background: 'linear-gradient(to top, ' + rankColor + '99, transparent)' }"></view>
          <view class="overlay-icon">
            <text class="material-icons large-icon">psychology_alt</text>
          </view>
        </view>

        <!-- Primary Status -->
        <view class="status-container">
          <view class="warning-badge" :style="{ borderColor: rankColor }">
            <view class="pulse-dot-container">
              <view class="pulse-dot-animate" :style="{ backgroundColor: rankColor }"></view>
              <view class="pulse-dot" :style="{ backgroundColor: rankColor }"></view>
            </view>
            <text class="warning-text" :style="{ color: rankColor }">{{ rankSub }}</text>
          </view>
          
          <view class="level-title">
            <text class="level-label">注意力级别</text>
            <text class="level-value" :style="{ color: rankColor, textShadow: '0 0 20rpx ' + rankColor + '80' }">{{ focusLevel }}</text>
          </view>
          
          <text class="alert-desc">
            {{ analysisText }}
          </text>
        </view>
      </view>

      <!-- Stats Grid -->
      <view class="stats-grid">
        <!-- Stat Card 1 -->
        <view class="stat-card">
          <view class="glow-bg red-glow"></view>
          <view class="stat-header">
            <text class="material-icons stat-icon">touch_app</text>
            <text class="stat-label">干扰项误触</text>
          </view>
          <view class="stat-value-container">
            <text class="stat-value">{{ metrics.errorCount }}</text>
            <text class="stat-unit">次</text>
          </view>
          <view class="progress-bar-bg">
            <view class="progress-bar-fill red-fill" :style="{ width: errorProgressWidth }"></view>
          </view>
          <text class="stat-footer red-text" v-if="metrics.errorCount > 5">需提高准确率</text>
          <text class="stat-footer white-text" v-else>控制良好</text>
        </view>

        <!-- Stat Card 2 -->
        <view class="stat-card">
          <view class="glow-bg white-glow"></view>
          <view class="stat-header">
            <text class="material-icons stat-icon">timer</text>
            <text class="stat-label">专注时长</text>
          </view>
          <view class="stat-value-container">
            <text class="stat-value">{{ formattedFocusDuration }}</text>
            <text class="stat-unit white-text">秒</text>
          </view>
          <view class="progress-bar-bg">
            <view class="progress-bar-fill white-fill" :style="{ width: focusProgressWidth }"></view>
          </view>
          <text class="stat-footer gray-text">平均连续专注</text>
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

    <!-- Tab Bar -->
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
      brainImageUrl: '/static/brain-diagnosis.svg',
      
      // Data from payload
      metrics: {
        totalTime: 0,
        errorCount: 0,
        avgFocus: 0
      },
      thresholds: {
        excellentSec: 25,
        riskSec: 45
      },

      // UI State
      focusLevel: '计算中...',
      rankSub: 'CALCULATING',
      analysisText: '正在分析您的神经元连接数据...',
      rankColor: '#F59E0B',
      mode: ''
    };
  },
  computed: {
    formattedFocusDuration() {
      if (!this.metrics.avgFocus) return '-';
      if (this.metrics.avgFocus < 3000) {
        return '< 3';
      } else {
        return (this.metrics.avgFocus / 1000).toFixed(1);
      }
    },
    // Dynamic progress bar width for error count (visual estimation)
    errorProgressWidth() {
      // Arbitrary cap for visual
      const max = 20; 
      const pct = Math.min(100, (this.metrics.errorCount / max) * 100);
      return `${pct}%`;
    },
    // Dynamic progress bar width for focus duration
    focusProgressWidth() {
      // Arbitrary max 10s
      const max = 10000; 
      const pct = Math.min(100, (this.metrics.avgFocus / max) * 100);
      return `${pct}%`;
    }
  },
  onLoad(options) {
    const sysInfo = uni.getSystemInfoSync();
    this.statusBarHeight = sysInfo.statusBarHeight || 20;

    if (options.mode) {
      this.mode = options.mode;
    }
    
    // Parse Standardized Payload
    if (options.data) {
      try {
        const payload = JSON.parse(decodeURIComponent(options.data));
        if (payload.metrics) {
          this.metrics = { ...this.metrics, ...payload.metrics };
        }
        if (payload.thresholds) {
          this.thresholds = { ...this.thresholds, ...payload.thresholds };
        }
      } catch (e) {
        console.error('Failed to parse result data', e);
      }
    } else {
      // Legacy / Direct URL fallback
      if (options.totalDuration) this.metrics.totalTime = parseFloat(options.totalDuration);
      if (options.errorCount) this.metrics.errorCount = parseInt(options.errorCount);
      if (options.avgFocus) this.metrics.avgFocus = parseInt(options.avgFocus);
    }
    
    this.evaluateResult();
  },
  methods: {
    evaluateResult() {
      const time = this.metrics.totalTime;
      const { excellentSec, riskSec } = this.thresholds;

      // Determine Rank based on thresholds
      if (time <= excellentSec) {
        this.setRankStyle('EXCELLENT');
      } else if (time >= riskSec) {
        this.setRankStyle('RISK');
      } else {
        this.setRankStyle('NORMAL');
      }
    },
    setRankStyle(status) {
       if (status === 'EXCELLENT') {
         this.focusLevel = '鹰眼级';
         this.rankSub = 'EAGLE EYE';
         this.analysisText = '前额叶超频状态，具备顶尖的视觉锁定能力。';
         this.rankColor = '#00E5FF'; // Cyan
       } else if (status === 'RISK') {
         this.focusLevel = '金鱼级';
         this.rankSub = 'GOLDFISH';
         this.analysisText = '严重警报：大脑已被算法重塑，无法维持线性思考。';
         this.rankColor = '#FF0000'; // Red
       } else {
         this.focusLevel = '人类基准';
         this.rankSub = 'BASELINE';
         this.analysisText = '注意力机制运行平稳，属于标准碳基生物水平。';
         this.rankColor = '#F59E0B'; // Yellow (Amber)
       }
    },
    goBack() {
      uni.navigateBack();
    },
    startDetox() {
      uni.showToast({
        title: '多巴胺排毒计划即将开启',
        icon: 'none'
      });
    },
    restartTest() {
      let url = '/pages/neural-link/test2';
      if (this.mode) {
        url += `?mode=${this.mode}`;
      }
      uni.redirectTo({ url: url });
    }
  }
};
</script>

<style>
/* Material Icons Font - Simplified for demo, in real app consider local font or image icons */
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

page {
  background-color: #120505;
  color: #f3f4f6;
}

.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #120505;
  background-image: linear-gradient(to bottom, rgba(236, 19, 19, 0.1), transparent 40%);
  overflow: hidden;
  position: relative;
}

/* Header */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32rpx 24rpx 32rpx;
  z-index: 10;
}

.icon-btn {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.header-title {
  color: rgba(255, 255, 255, 0.8);
  font-size: 24rpx;
  font-weight: 500;
  letter-spacing: 2rpx;
  text-transform: uppercase;
}

/* Main Content */
.main-content {
  flex: 1;
  width: 100%;
}

/* Hero Section */
.hero-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32rpx 48rpx 64rpx;
  position: relative;
}

.glow-effect {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 384rpx;
  height: 384rpx;
  background-color: rgba(236, 19, 19, 0.4);
  border-radius: 50%;
  filter: blur(120rpx);
  z-index: 0;
}

.brain-visual {
  position: relative;
  width: 412rpx;
  height: 412rpx;
  margin-bottom: 48rpx;
  border-radius: 50%;
  border: 1px solid rgba(236, 19, 19, 0.3);
  background-color: rgba(0, 0, 0, 0.4);
  overflow: hidden;
  box-shadow: 0 0 60rpx rgba(236, 19, 19, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.brain-image {
  width: 100%;
  height: 100%;
  opacity: 0.9;
}

.overlay-gradient {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to top, rgba(236, 19, 19, 0.6), transparent);
  mix-blend-mode: overlay;
}

.overlay-icon {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.large-icon {
  font-size: 160rpx;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 0 20rpx rgba(236, 19, 19, 0.8);
}

.status-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  z-index: 1;
}

.warning-badge {
  display: inline-flex;
  align-items: center;
  gap: 16rpx;
  padding: 8rpx 24rpx;
  border-radius: 9999px;
  background-color: rgba(236, 19, 19, 0.2);
  border: 1px solid rgba(236, 19, 19, 0.4);
  margin-bottom: 16rpx;
  backdrop-filter: blur(8px);
}

.pulse-dot-container {
  position: relative;
  width: 16rpx;
  height: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pulse-dot-animate {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #ec1313;
  opacity: 0.75;
  animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

.pulse-dot {
  position: relative;
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background-color: #ec1313;
}

.warning-text {
  color: #ec1313;
  font-size: 24rpx;
  font-weight: bold;
  letter-spacing: 2rpx;
}

.level-title {
  margin-bottom: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.level-label {
  color: #fff;
  font-size: 26rpx;
  font-weight: bold;
  line-height: 1.2;
}

.level-value {
  color: #ec1313;
  font-size: 80rpx;
  font-weight: bold;
  line-height: 1.2;
}

.alert-desc {
  color: #9ca3af;
  font-size: 28rpx;
  margin-top: 24rpx;
  max-width: 560rpx;
  line-height: 1.6;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32rpx;
  padding: 0 40rpx;
  margin-bottom: 32rpx;
}

.stat-card {
  background-color: rgba(34, 16, 16, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(236, 19, 19, 0.3);
  border-radius: 24rpx;
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.glow-bg {
  position: absolute;
  top: -32rpx;
  right: -32rpx;
  width: 128rpx;
  height: 128rpx;
  border-radius: 50%;
  filter: blur(48rpx);
}

.red-glow {
  background-color: rgba(236, 19, 19, 0.1);
}

.white-glow {
  background-color: rgba(255, 255, 255, 0.05);
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 8rpx;
  color: #9ca3af;
}

.stat-icon {
  font-size: 36rpx;
}

.stat-label {
  font-size: 24rpx;
  font-weight: 500;
}

.stat-value-container {
  display: flex;
  align-items: flex-end;
  gap: 8rpx;
  width: 100%;
}

.stat-value {
  color: #fff;
  font-size: 48rpx;
  font-weight: bold;
}

.stat-unit {
  font-size: 24rpx;
  font-weight: bold;
  margin-bottom: 12rpx;
  text-transform: uppercase;
}

.red-text {
  color: rgba(236, 19, 19, 0.8);
}

.white-text {
  color: #6b7280;
}

.progress-bar-bg {
  width: 100%;
  height: 12rpx;
  background-color: #1f2937;
  border-radius: 9999px;
  margin-top: 16rpx;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 9999px;
}

.red-fill {
  background-color: #ec1313;
}

.white-fill {
  background-color: rgba(255, 255, 255, 0.2);
}

.stat-footer {
  font-size: 20rpx;
  margin-top: 8rpx;
  font-family: monospace;
}

.gray-text {
  color: #6b7280;
}

/* Analysis Card */
.analysis-card {
  margin: 0 40rpx;
  background-color: #1a0f0f;
  border-left: 4rpx solid #ec1313;
  border-top-right-radius: 16rpx;
  border-bottom-right-radius: 16rpx;
  padding: 40rpx;
}

.analysis-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.analysis-icon {
  color: #ec1313;
}

.analysis-title {
  color: #fff;
  font-size: 36rpx;
  font-weight: bold;
}

.analysis-text {
  color: #9ca3af;
  font-size: 28rpx;
  line-height: 1.6;
}

.spacer {
  height: 200rpx;
}

/* Bottom Action */
.bottom-action {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 40rpx;
  background: linear-gradient(to top, #120505, #120505 50%, transparent);
  z-index: 20;
  box-sizing: border-box;
}

.action-btn {
  width: 100%;
  background-color: #ec1313;
  color: #fff;
  font-weight: bold;
  font-size: 36rpx;
  padding: 32rpx 48rpx;
  border-radius: 16rpx;
  box-shadow: 0 0 40rpx rgba(236, 19, 19, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  border: none;
}

.action-btn:active {
  transform: scale(0.98);
}

.btn-icon {
  font-size: 40rpx;
}

.action-hint {
  display: block;
  text-align: center;
  font-size: 24rpx;
  color: #4b5563;
  margin-top: 24rpx;
}

/* Terminal Command Action (Fixed Bottom) */
.terminal-action-area {
  position: fixed;
  bottom: calc(140rpx + env(safe-area-inset-bottom));
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
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
  color: rgba(0, 229, 255, 0.7);
  font-size: 28rpx;
  font-weight: 700;
}

.cmd-text {
  color: rgba(0, 229, 255, 0.7);
  font-size: 28rpx;
  letter-spacing: 2rpx;
}

.cmd-cursor {
  width: 16rpx;
  height: 28rpx;
  background-color: rgba(0, 229, 255, 0.7);
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.cmd-btn-active .cmd-text {
  opacity: 0.5;
  text-shadow: 0 0 10px rgba(0, 229, 255, 0.5);
}
</style>
