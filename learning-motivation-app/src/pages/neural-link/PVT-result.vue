<template>
  <view class="container">
    <!-- Background Grid (Global) -->
    <view class="grid-background"></view>
    
    <!-- Navbar -->
    <view class="custom-nav" :style="{ paddingTop: menuButtonTop + 'px', paddingBottom: navPaddingBottom + 'px' }">
      <view class="nav-back" @click="goHome">
        <view class="back-arrow"></view>
      </view>

      <view class="nav-spacer"></view>
    </view>

    <scroll-view scroll-y class="scroll-content">
      <!-- Section 1: Hero Section (New) -->
      <view class="hero-section">
        <view class="glow-effect" :style="{ backgroundColor: diagnosis.color, boxShadow: '0 0 120rpx ' + diagnosis.color }"></view>
        <view class="brain-visual" :style="{ borderColor: diagnosis.color, boxShadow: '0 0 60rpx ' + diagnosis.color + '33' }">
          <image 
            class="brain-image" 
            src="/static/brain-viz.svg" 
            mode="aspectFill"
          ></image>
          <view class="overlay-gradient" :style="{ background: 'linear-gradient(to top, ' + diagnosis.color + '99, transparent)' }"></view>
          <view class="overlay-icon">
            <text class="material-icons large-icon">bolt</text>
          </view>
        </view>
      </view>

      <!-- Section 2: Main Metric -->
      <view class="main-metric-section">
        <text class="result-eval-label">评估结果: 反应状态</text>
        <view class="metric-row">
          <text class="metric-value rank-title" :class="{ 'glitch-effect': diagnosis.isGlitch }" :data-text="diagnosis.title" :style="{ color: diagnosis.color, textShadow: '0 0 30px ' + diagnosis.shadowColor }">{{ diagnosis.title }}</text>
        </view>
  
        
        <!-- Physiological Function Copy -->
        <view class="physio-container">
          <text class="physio-text">{{ diagnosis.subtitle }}</text>
        </view>
      </view>

      <!-- Section 3: Reaction Speed Meter -->
      <view class="meter-section">
        <view class="meter-header">
          <text class="meter-label">反应速度区间</text>
          <text class="meter-value-text" :style="{ color: diagnosis.color }">{{ diagnosis.title }} ({{ reactionTime }}ms)</text>
        </view>
        <view class="meter-track-container">
          <view class="meter-gradient-bg"></view>
          <!-- Indicator Line -->
          <view class="meter-indicator-line" :style="{ left: progressPercent + '%' }"></view>
        </view>
        <view class="meter-scale">
          <text>0ms</text>
          <text>150ms</text>
          <text>250ms</text>
          <text>500ms+</text>
        </view>
      </view>

      <!-- Section 4: Multi-dimensional Analysis -->
      <view class="analysis-grid" v-if="analysisResult">
        <!-- Card 1: Focus -->
        <view class="analysis-card">
          <text class="analysis-label">注意力集中度</text>
          <view class="analysis-row">
            <text class="analysis-value" :class="analysisResult.focus.color + '-text'">{{ analysisResult.focus.level }}</text>
            <text class="analysis-change" :class="analysisResult.focus.color + '-text'">{{ analysisResult.focus.change }}</text>
          </view>
          <view class="analysis-bar-bg">
            <view class="analysis-bar-fill" :class="analysisResult.focus.color + '-bg'" :style="{ width: analysisResult.focus.level === 'High' ? '90%' : (analysisResult.focus.level === 'Medium' ? '60%' : '30%') }"></view>
          </view>
        </view>

        <!-- Card 2: Control -->
        <view class="analysis-card">
          <text class="analysis-label">冲动抑制能力</text>
          <view class="analysis-row">
            <text class="analysis-value" :class="analysisResult.control.color + '-text'">{{ analysisResult.control.level }}</text>
            <text class="analysis-change" :class="analysisResult.control.color + '-text'">{{ analysisResult.control.change }}</text>
          </view>
          <view class="analysis-bar-bg">
            <view class="analysis-bar-fill" :class="analysisResult.control.color + '-bg'" :style="{ width: analysisResult.control.level === 'Strong' ? '90%' : (analysisResult.control.level === 'Medium' ? '60%' : '30%') }"></view>
          </view>
        </view>
      </view>

      <!-- Section 5: Secondary Metrics Grid - REMOVED -->
      <!-- <view class="secondary-grid">...</view> -->

      <!-- Footer Disclaimer -->
      
      
      <!-- Bottom Spacer -->
      <view class="bottom-spacer"></view>
    </scroll-view>

    <!-- Terminal Command Action (Fixed Bottom) -->
    <view class="terminal-action-area">
      <view class="cmd-btn" hover-class="cmd-btn-active" @click="restartTest">
        <text class="cmd-prompt">></text>
        <text class="cmd-text">重新初始化测试</text>
        <view class="cmd-cursor"></view>
      </view>
    </view>
    
    <!-- Custom Tab Bar -->
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
      menuButtonTop: 24,
      menuButtonHeight: 32,
      navPaddingBottom: 8,
      reactionTime: 0,
      falseStartCount: 0,
      reactionTimes: [],
      analysisResult: null,
      thresholds: {} // Dynamic thresholds from config
    };
  },
  computed: {
    diagnosis() {
      const ms = this.reactionTime;
      // Dynamic Thresholds
      const excellent = this.thresholds.excellentMs || 220;
      const risk = this.thresholds.riskMs || 350;
      
      // Case A: Excellent (Pro/Ace)
      if (ms <= excellent) {
        return {
          title: '电竞职业级',
          subtitle: '突破生理极限的神经传导速度。',
          color: '#00E5FF', // Cyan
          shadowColor: 'rgba(0, 229, 255, 0.6)',
          badgeBg: 'rgba(0, 229, 255, 0.1)',
          isGlitch: false
        };
      }
      
      // Case D: Risk (Severe Lag)
      if (ms >= risk) {
          return {
            title: '严重迟滞',
            subtitle: '警报：前额叶活跃度显著降低，反应链出现物理阻滞。',
            color: '#FF3B30', // Red
            shadowColor: 'rgba(255, 59, 48, 0.6)',
            badgeBg: 'rgba(255, 59, 48, 0.1)',
            isGlitch: false
          };
      }
      
      // Case B: Ordinary
      return {
          title: '普通路人',
          subtitle: '标准的生理机能，属于大多数人的基准水平。',
          color: '#F59E0B', // Yellow/Orange
          shadowColor: 'rgba(245, 158, 11, 0.6)',
          badgeBg: 'rgba(245, 158, 11, 0.1)',
          isGlitch: false
      };
    },
    progressPercent() {
      // Map 0ms -> 0%, 500ms -> 100%
      const min = 0;
      const max = 500;
      let p = (this.reactionTime - min) / (max - min) * 100;
      if (p < 0) p = 0;
      if (p > 100) p = 100;
      return p;
    }
  },
  methods: {
    analyzePerformance(reactionTimes, falseStartCount) {
       console.log('Running analysis with:', reactionTimes, falseStartCount);
       // --- A. 计算注意力集中度 (基于标准差) ---
       // 1. 计算平均值
       if (!reactionTimes || reactionTimes.length === 0) {
          console.warn('No reaction times available for analysis');
          return null;
       }
       
       const sum = reactionTimes.reduce((a, b) => a + b, 0);
       const avg = sum / reactionTimes.length;
       
       // 2. 计算方差 (Variance)
       // If only 1 item, stdDev is 0.
       let stdDev = 0;
       if (reactionTimes.length > 1) {
         const squareDiffs = reactionTimes.map(value => Math.pow(value - avg, 2));
         const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
         stdDev = Math.sqrt(avgSquareDiff); // 标准差
       }
       
       console.log('StdDev calculated:', stdDev);
       
       // 3. 评级逻辑 (标准差越小越好)
       let focusLevel, focusLabel, focusChange, focusColor;
       
       // Safety check for NaN
       if (isNaN(stdDev)) stdDev = 0;

       // 这里的阈值基于一般人反应波动设定
       if (stdDev < 30) {
         focusLevel = 'High';
         focusLabel = 'Excellent'; // 高度集中
         focusChange = '▲ 5%'; // 比基准高
         focusColor = 'green';
       } else if (stdDev < 70) {
         focusLevel = 'Medium';
         focusLabel = 'Normal';
         focusChange = '-';
         focusColor = 'cyan'; // Normal usually implies stable/okay
       } else {
         focusLevel = 'Low';
         focusLabel = 'Unstable'; // 注意力涣散
         focusChange = '▼ ' + Math.min(Math.floor((stdDev / 30) * 10), 40) + '%'; // 动态计算下降百分比
         focusColor = 'red';
       }
       
       // --- B. 计算冲动抑制能力 (基于抢跑) ---
       let controlLevel, controlLabel, controlChange, controlColor;
       
       // 包含 "超速点击" (小于100ms视为瞎蒙/抢跑)
       const luckyClicks = reactionTimes.filter(t => t < 100).length;
       const totalErrors = falseStartCount + luckyClicks;
       
       if (totalErrors === 0) {
         controlLevel = 'Strong';
         controlLabel = 'Solid';
         controlChange = '▲ 10%';
         controlColor = 'green';
       } else if (totalErrors === 1) {
         controlLevel = 'Medium';
         controlLabel = 'Average';
         controlChange = '▼ 5%';
         controlColor = 'cyan';
       } else {
         controlLevel = 'Weak';
         controlLabel = 'Impulsive'; // 冲动
         controlChange = '▼ ' + (totalErrors * 12) + '%'; // 每错一次下降 12%
         controlColor = 'red';
       }
       
       return {
         focus: { level: focusLevel, label: focusLabel, change: focusChange, color: focusColor },
         control: { level: controlLevel, label: controlLabel, change: controlChange, color: controlColor }
       };
    },
    goHome() {
      console.log('User clicked Home/Back button');
      uni.reLaunch({ url: '/pages/index/index' });
    },
    restartTest() {
      uni.redirectTo({
        url: '/pages/neural-link/PVT'
      });
    }
  },
  onLoad(options) {
    console.log('Result page loaded with options:', options);
    // Get System Info for Status Bar
    const sysInfo = uni.getSystemInfoSync();
    this.statusBarHeight = sysInfo.statusBarHeight || 20;

    // #ifdef MP-WEIXIN
    const menuButton = uni.getMenuButtonBoundingClientRect();
    this.menuButtonTop = menuButton.top;
    this.menuButtonHeight = menuButton.height;
    this.navPaddingBottom = menuButton.top - this.statusBarHeight;
    if (this.navPaddingBottom < 4) this.navPaddingBottom = 4;
    // #endif
    // #ifndef MP-WEIXIN
    this.menuButtonTop = this.statusBarHeight + 4;
    this.menuButtonHeight = 32;
    this.navPaddingBottom = 4;
    // #endif
    
    // Parse 'data' payload if available (New Standard)
    let metrics = {};
    if (options.data) {
      try {
        const payload = JSON.parse(decodeURIComponent(options.data));
        if (payload.metrics) metrics = payload.metrics;
        if (payload.thresholds) this.thresholds = payload.thresholds;
        
        // Legacy Support inside data payload
        if (payload.reactionTimes && !payload.metrics) {
           metrics.reactionTimes = payload.reactionTimes;
           metrics.falseStarts = payload.falseStartCount;
        }
      } catch (e) {
        console.error('Error parsing data payload:', e);
      }
    }

    // Assign Metrics
    if (metrics.reactionTimes) {
      this.reactionTimes = metrics.reactionTimes;
      this.falseStartCount = metrics.falseStarts || 0;
      this.reactionTime = metrics.averageMs || 0;
    } else {
      // Legacy Query Params Support
      if (options.time) {
        this.reactionTime = parseInt(options.time) || 0;
      }
      const timesStr = options.reactionTimes || options.reactiontimes;
      if (timesStr) {
        try {
          const decodedStr = decodeURIComponent(timesStr);
          this.reactionTimes = decodedStr.split(',').map(Number).filter(n => !isNaN(n));
        } catch (e) {
          this.reactionTimes = [];
        }
      }
      if (options.falseStarts) {
        this.falseStartCount = parseInt(options.falseStarts) || 0;
      }
    }
    
    // Fallback calculation if average not provided
    if (this.reactionTime === 0 && this.reactionTimes.length > 0) {
      this.reactionTime = Math.round(this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length);
    }
    
    console.log('Final reactionTimes for analysis:', this.reactionTimes);
    
    // Run Analysis
    this.analysisResult = this.analyzePerformance(this.reactionTimes, this.falseStartCount);
    console.log('Analysis Result:', this.analysisResult);
  },
  onShareAppMessage() {
    console.log('User triggered share');
    return {
      title: `我的神经反应速度：${this.reactionTime}ms！击败了99%的碳基生物！`,
      path: '/pages/index/index'
    };
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

/* Base Theme */
page {
  background-color: #0b1116;
  color: #e6edf3;
  font-family: 'Inter', system-ui, sans-serif;
  height: 100%;
}

.container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #0b1116;
}

.grid-background {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  pointer-events: none;
  z-index: 0;
}

/* Navbar */
.custom-nav {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 32rpx;
  padding-right: 32rpx;
  background: rgba(22, 30, 38, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(48, 54, 61, 0.3);
  z-index: 100;
  box-sizing: border-box;
}

.nav-back {
  padding: 10rpx;
}

.back-arrow {
  width: 20rpx;
  height: 20rpx;
  border-left: 2px solid #8b949e;
  border-bottom: 2px solid #8b949e;
  transform: rotate(45deg);
}

.nav-title {
  color: #fff;
  font-size: 30rpx;
  font-weight: 500;
  letter-spacing: 1px;
}

.nav-spacer { width: 40rpx; }

/* Content Area */
.scroll-content {
  flex: 1;
  padding: 32rpx;
  box-sizing: border-box;
}

/* Neuro Card Style (Shared) */
.neuro-card {
  background: rgba(22, 30, 38, 0.9);
  border: 1px solid #2a3b4c;
  border-radius: 32rpx;
  overflow: hidden;
  position: relative;
}

/* Hero Section */
.hero-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32rpx 48rpx 20rpx; /* Adjusted padding */
  position: relative;
  margin-bottom: 20rpx;
}

.glow-effect {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 384rpx;
  height: 384rpx;
  background-color: rgba(236, 19, 19, 0.4); /* Default fallback */
  border-radius: 50%;
  filter: blur(120rpx);
  z-index: 0;
}

.brain-visual {
  position: relative;
  width: 412rpx;
  height: 412rpx;
  border-radius: 50%;
  border: 1px solid rgba(236, 19, 19, 0.3); /* Default fallback */
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
  text-shadow: 0 0 20rpx rgba(255, 255, 255, 0.5);
}

/* Section 1: Top Visual Area (Clean) */
.top-visual-area {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 20rpx;
  padding-top: 20rpx;
}

.viz-container-clean {
  width: 500rpx;
  height: 500rpx;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brain-viz-large {
  width: 100%;
  height: 100%;
  opacity: 0.9;
  mix-blend-mode: screen;
}

.viz-overlay-clean {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 229, 255, 0.1) 0%, transparent 70%);
  pointer-events: none;
}

/* Removed old top-card styles to avoid confusion/unused code if desired, or just leave them if they might be reused. 
   For now, I'll comment out or overwrite the ones I know are replaced. 
*/
.top-card {
  display: none; /* Hide if still referenced anywhere else, though I removed the HTML */
}


/* Section 2: Main Metric */
.main-metric-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 60rpx;
}

.result-eval-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 16rpx;
  letter-spacing: 2rpx;
}

.metric-row {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 16rpx;
}

.metric-value {
  font-size: 80rpx;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 4rpx;
  /* font-family: 'Roboto Mono', monospace; Removed to match code.html */
}

.metric-unit {
  font-size: 40rpx;
  font-weight: 500;
}

.metric-label {
  font-size: 26rpx;
  color: #8b949e;
  margin-top: 16rpx;
  margin-bottom: 40rpx;
  text-transform: uppercase;
  letter-spacing: 4rpx;
  font-weight: 500;
}

.physio-container {
  margin-top: 40rpx;
  max-width: 560rpx;
  display: flex;
  justify-content: center;
}

.physio-text {
  color: #9ca3af; /* text-gray-400 */
  font-size: 23rpx; /* text-sm */
  line-height: 1.625; /* leading-relaxed */
  text-align: center;
}

/* Removed old warning-badge styles */
.warning-badge-removed {
  display: none;
}

.warning-icon-svg {
  width: 24rpx;
  height: 24rpx;
  border: 2px solid currentColor;
  border-radius: 4rpx;
}

.warning-text {
  font-size: 24rpx;
  font-weight: 700;
}

/* Section 3: Reaction Speed Meter */
.meter-section {
  margin-top: 40rpx;
  margin-bottom: 40rpx;
}

.meter-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 16rpx;
}

.meter-label {
  font-size: 24rpx;
  color: #fff;
  font-weight: 500;
}

.meter-value-text {
  font-size: 24rpx;
  font-weight: 700;
}

.text-neon-red { color: #ff3b30; }

.meter-track-container {
  position: relative;
  height: 24rpx;
  width: 100%;
  background: #161e26;
  border-radius: 999rpx;
  overflow: hidden;
  border: 1px solid #30363d;
}

.meter-gradient-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, #1890ff 0%, #00e5ff 50%, #ff4d4f 100%);
  opacity: 0.9;
}

.meter-indicator-line {
  position: absolute;
  top: 0; bottom: 0;
  width: 4rpx;
  background: #fff;
  box-shadow: 0 0 20rpx rgba(255,255,255,0.8);
  z-index: 10;
  transform: translateX(-50%);
}

.meter-scale {
  display: flex;
  justify-content: space-between;
  margin-top: 8rpx;
}

.meter-scale text {
  font-size: 20rpx;
  color: #8b949e;
  font-family: monospace;
}

/* Section 4: Secondary Metrics Grid - Removed CSS */
/* Footer */
.footer-disclaimer {
  text-align: center;
  padding-top: 24rpx;
}

.footer-disclaimer text {
  font-size: 20rpx;
  color: rgba(139, 148, 158, 0.5);
}

.bottom-spacer {
  height: 380rpx; /* Space for fixed button + TabBar */
}

/* Section 4: Multi-dimensional Analysis */
.analysis-grid {
  display: flex;
  gap: 20rpx;
  margin-top: 32rpx;
  margin-bottom: 32rpx;
}

.analysis-card {
  flex: 1;
  background: rgba(22, 30, 38, 0.6);
  border: 1px solid #2a3b4c;
  border-radius: 24rpx;
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.analysis-label {
  color: #8b949e;
  font-size: 24rpx;
  font-weight: 500;
}

.analysis-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.analysis-value {
  font-size: 40rpx;
  font-weight: bold;
}

.analysis-change {
  font-size: 28rpx;
  font-weight: 500;
}

.analysis-bar-bg {
  width: 100%;
  height: 8rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4rpx;
  overflow: hidden;
  margin-top: 8rpx;
}

.analysis-bar-fill {
  height: 100%;
  border-radius: 4rpx;
  transition: width 0.5s ease-out;
}

/* Colors */
.green-text { color: #10B981 !important; }
.cyan-text { color: #00E5FF !important; }
.red-text { color: #FF3B30 !important; }

.green-bg { background-color: #10B981 !important; }
.cyan-bg { background-color: #00E5FF !important; }
.red-bg { background-color: #FF3B30 !important; }

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
  /* font-family: 'Roboto Mono', monospace; Removed to match page font */
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

/* Removed old action-area styles */
.action-area-removed {
  display: none;
}

.action-btn-hover {
  background: rgba(0, 229, 255, 0.1);
  transform: scale(0.98);
}

.btn-icon-svg {
  width: 36rpx;
  height: 36rpx;
  border: 3rpx solid #00e5ff;
  border-radius: 50%;
}

/* Glitch Effect */
@keyframes glitch-skew {
  0% { transform: skew(0deg); }
  20% { transform: skew(-10deg); }
  40% { transform: skew(10deg); }
  60% { transform: skew(-5deg); }
  80% { transform: skew(5deg); }
  100% { transform: skew(0deg); }
}

@keyframes glitch-anim {
  0% { clip-path: inset(80% 0 0 0); transform: translate(-2px, 1px); }
  20% { clip-path: inset(10% 0 60% 0); transform: translate(2px, -1px); }
  40% { clip-path: inset(50% 0 30% 0); transform: translate(-2px, 2px); }
  60% { clip-path: inset(10% 0 80% 0); transform: translate(2px, -2px); }
  80% { clip-path: inset(40% 0 20% 0); transform: translate(-1px, 1px); }
  100% { clip-path: inset(80% 0 0 0); transform: translate(1px, -1px); }
}

.glitch-effect {
  position: relative;
  animation: glitch-skew 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite;
}

.glitch-effect::before,
.glitch-effect::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: inherit;
}

.glitch-effect::before {
  left: 2px;
  text-shadow: -1px 0 #ff00c1;
  clip-path: inset(44% 0 61% 0);
  animation: glitch-anim 2s infinite linear alternate-reverse;
}

.glitch-effect::after {
  left: -2px;
  text-shadow: -1px 0 #00fff9;
  clip-path: inset(44% 0 61% 0);
  animation: glitch-anim 2s infinite linear alternate-reverse;
}

</style>