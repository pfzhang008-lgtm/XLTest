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
        <text class="result-eval-label">{{ evalLabel }}</text>
        <view class="metric-row">
          <text class="metric-value rank-title" :class="{ 'glitch-effect': diagnosis.isGlitch }" :data-text="diagnosis.title" :style="{ color: diagnosis.color, textShadow: '0 0 30px ' + diagnosis.shadowColor }">{{ diagnosis.title }}</text>
        </view>
      </view>

      <!-- Section 3: Information & Controls -->
      <view class="content-area">
        <!-- Transition Text Card -->
        <view class="info-card" v-if="transitionText">
          <view class="info-header">
            <text class="material-icons info-icon">lightbulb</text>
            <text class="info-title">测试解析</text>
          </view>
          <text class="transition-text">{{ transitionText }}</text>
        </view>

        <!-- Action Buttons -->
        <view class="action-group">
          <!-- Primary Action: Next Test -->
          <button class="btn-primary" @click="handleNext" hover-class="btn-hover">
            <text class="btn-text">进入下一项测试</text>
            <text class="material-icons btn-icon">arrow_forward</text>
          </button>

          <!-- Secondary Action: Retest -->
          <button class="btn-secondary" @click="handleRetest" hover-class="btn-secondary-hover">
            <text class="material-icons btn-icon-small">refresh</text>
            <text class="btn-text-small retest-text">受到干扰？重新测试</text>
          </button>
        </view>
      </view>

      <!-- Footer Disclaimer -->
      
      
      <!-- Bottom Spacer -->
      <view class="bottom-spacer"></view>
    </scroll-view>
  </view>
</template>

<script>
import { evaluateScore } from '@/utils/clinical-evaluator.js';
import mod01Config from '@/data/config_mod01.json';
import mod02Config from '@/data/config_mod02.json';
import mod03Config from '@/data/config_mod03.json';
import mod04Config from '@/data/config_mod04.json';
import mod05Config from '@/data/config_mod05.json';

// Map of module IDs to their config objects
const moduleConfigs = {
  '01': mod01Config,
  '02': mod02Config,
  '03': mod03Config,
  '04': mod04Config,
  '05': mod05Config
};

// Map of test types to their page URLs for retesting
const testPageMap = {
  'PVT': '/pages/neural-link/PVT',
  'SART': '/pages/neural-link/sart',
  'Stroop': '/pages/neural-link/Stroop',
  'EmotionalStroop': '/pages/neural-link/Stroop?mode=emotional',
  'Schulte': '/pages/neural-link/grid',
  'NBack': '/pages/neural-link/nback'
};

export default {
  components: {
  },
  data() {
    return {
      statusBarHeight: 20,
      menuButtonTop: 24,
      menuButtonHeight: 32,
      navPaddingBottom: 8,
      
      // Context
      moduleId: '01',
      testType: '',
      
      // Metrics
      score: 0,
      reactionTime: 0,
      totalTime: 0,
      falseStartCount: 0,
      errors: 0,
      accuracy: 0, // Added for N-Back
      
      // Config & Navigation
      age: 12,
      transitionText: '',
      nextTestUrl: '',
      retestUrl: '',
      
      // UI Text
      evalLabel: '评估结果'
    };
  },
  computed: {
    diagnosis() {
      // Special handling for Emotional Stroop
      if (this.testType === 'EmotionalStroop') {
         const result = evaluateScore('EmotionalStroop', 0, this.age);
         return {
            title: result.text,
            subtitle: '潜意识情绪阻抗探测已完成，数据已归档。',
            color: result.color,
            shadowColor: result.color + '99',
            badgeBg: result.color + '1A',
            isGlitch: false
         };
      }

      // Default handling for other tests
      let scoreValue = 0;
      if (this.testType === 'PVT') scoreValue = this.reactionTime;
      else if (this.testType === 'Schulte') scoreValue = this.totalTime;
      else if (this.testType === 'SART') scoreValue = this.errors;
      else if (this.testType === 'NBack') scoreValue = this.accuracy; // Added for N-Back
      else if (this.testType === 'Stroop') scoreValue = this.errors; // Standard Stroop if implemented
      
      const result = evaluateScore(this.testType, scoreValue, this.age);
      
      return {
        title: result.text,
        subtitle: '', // Removed as per previous request
        color: result.color,
        shadowColor: result.color + '99',
        badgeBg: result.color + '1A',
        isGlitch: false
      };
    }
  },
  methods: {
    goHome() {
      uni.reLaunch({ url: '/pages/index/index' });
    },
    handleRetest() {
      if (this.retestUrl) {
        uni.redirectTo({
          url: this.retestUrl
        });
      } else {
        uni.navigateBack();
      }
    },
    handleNext() {
      if (this.nextTestUrl) {
        uni.redirectTo({
          url: this.nextTestUrl
        });
      } else {
        uni.reLaunch({ url: '/pages/report/index' });
      }
    }
  },
  onLoad(options) {
    // 1. Layout Setup
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
    
    // 2. Load User Profile for Age
    const userProfile = uni.getStorageSync('user_profile');
    if (userProfile && userProfile.age) {
      this.age = parseInt(userProfile.age);
    }

    // 3. Parse Options
    this.moduleId = options.moduleId || '01';
    this.testType = options.testType || 'PVT';
    
    // Set Label based on Test Type
    switch(this.testType) {
        case 'PVT': this.evalLabel = '评估结果: 反应状态'; break;
        case 'Schulte': this.evalLabel = '评估结果: 视觉搜索'; break;
        case 'SART': this.evalLabel = '评估结果: 冲动抑制'; break;
        case 'NBack': this.evalLabel = '评估结果: 工作记忆'; break;
        case 'EmotionalStroop': this.evalLabel = '评估结果: 潜意识探测'; break;
        default: this.evalLabel = '评估结果: 综合能力'; break;
    }

    // 4. Parse Data Payload
    if (options.data) {
      try {
        const payload = JSON.parse(decodeURIComponent(options.data));
        // Common metrics extraction
        if (payload.metrics) {
            this.reactionTime = payload.metrics.avgTime || 0;
            this.totalTime = payload.metrics.totalTime || 0;
            this.falseStartCount = payload.metrics.errors || 0;
            this.errors = payload.metrics.errors || 0;
            this.score = payload.metrics.score || 0;
            this.accuracy = payload.metrics.accuracy || 0; // Added for N-Back
        } else {
            // Fallback for direct data passing
            this.reactionTime = payload.avgTime || 0;
            this.falseStartCount = payload.errors || 0;
            this.errors = payload.errors || 0;
        }
      } catch (e) {
        console.error('Failed to parse result data', e);
      }
    } else {
      // Legacy support
      this.reactionTime = parseInt(options.avgTime) || 0;
      this.falseStartCount = parseInt(options.falseStarts) || 0;
    }

    // 5. Load Config & Determine Navigation
    const currentModuleConfig = moduleConfigs[this.moduleId];
    
    if (currentModuleConfig && currentModuleConfig.testQueue) {
      const testQueue = currentModuleConfig.testQueue;
      const currentStepIndex = testQueue.findIndex(item => item.type === this.testType);
      
      if (currentStepIndex !== -1) {
        const currentConfig = testQueue[currentStepIndex];
        this.transitionText = currentConfig.transitionText;
        
        // Determine Next URL
        if (currentStepIndex < testQueue.length - 1) {
          const nextTest = testQueue[currentStepIndex + 1];
          // Map next test type to URL
          if (nextTest.type === 'EmotionalStroop') {
              this.nextTestUrl = '/pages/neural-link/Stroop?mode=emotional&moduleId=' + this.moduleId;
          } else if (testPageMap[nextTest.type]) {
              this.nextTestUrl = testPageMap[nextTest.type] + '?moduleId=' + this.moduleId;
          } else {
              this.nextTestUrl = '/pages/report/index?moduleId=' + this.moduleId;
          }
        } else {
          this.nextTestUrl = '/pages/report/index?moduleId=' + this.moduleId;
        }
      }
    }
    
    // Set Retest URL
    this.retestUrl = testPageMap[this.testType] || '';
    if (this.testType === 'EmotionalStroop') {
        this.retestUrl += '&moduleId=' + this.moduleId; // Ensure mode=emotional is preserved in map, append module
    } else if (this.retestUrl) {
        this.retestUrl += '?moduleId=' + this.moduleId;
    }

    // Cache the result
    if (this.moduleId && this.testType) {
        const resultKey = `module_${this.moduleId}_test_${this.testType}_result`;
        const resultData = {
            testType: this.testType,
            moduleId: this.moduleId,
            score: this.score || 0,
            reactionTime: this.reactionTime || 0,
            totalTime: this.totalTime || 0,
            errors: this.errors || 0,
            diagnosis: this.diagnosis.title,
            timestamp: new Date().getTime()
        };
        uni.setStorageSync(resultKey, resultData);
        console.log(`[Result] Cached result for ${resultKey}`);
    }
  },
  onShareAppMessage() {
    return {
      title: `我的测试结果：${this.diagnosis.title}`,
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
}

.container {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.grid-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
  z-index: 0;
  pointer-events: none;
}

.scroll-content {
  flex: 1;
  width: 100%;
  z-index: 1;
  box-sizing: border-box;
}

/* Navbar */
.custom-nav {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  display: flex;
  align-items: center;
  padding-left: 16px;
  padding-right: 16px;
  box-sizing: border-box;
}

.nav-back {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  backdrop-filter: blur(10px);
}

.back-arrow {
  width: 8px;
  height: 8px;
  border-top: 2px solid #fff;
  border-left: 2px solid #fff;
  transform: rotate(-45deg);
  margin-left: 2px;
}

/* Hero Section */
.hero-section {
  position: relative;
  height: 40vh;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 60rpx;
}

.glow-effect {
  position: absolute;
  width: 300rpx;
  height: 300rpx;
  border-radius: 50%;
  filter: blur(80rpx);
  opacity: 0.3;
  animation: pulse 4s infinite ease-in-out;
}

.brain-visual {
  width: 260rpx;
  height: 260rpx;
  border-radius: 50%;
  border: 2px solid;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(5px);
  overflow: hidden;
}

.brain-image {
  width: 160rpx;
  height: 160rpx;
  opacity: 0.9;
}

.overlay-gradient {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
}

.overlay-icon {
  position: absolute;
  z-index: 3;
}

.large-icon {
  font-size: 80rpx;
  color: #fff;
  opacity: 0.9;
  text-shadow: 0 0 20rpx rgba(255, 255, 255, 0.5);
}

/* Metric Section */
.main-metric-section {
  padding: 0 40rpx;
  margin-bottom: 40rpx;
  text-align: center;
}

.result-eval-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 2rpx;
  text-transform: uppercase;
  display: block;
  margin-bottom: 16rpx;
}

.metric-row {
  display: flex;
  justify-content: center;
  align-items: baseline;
}

.rank-title {
  font-size: 48rpx; /* Reduced from 56rpx */
  font-weight: 700;
  letter-spacing: 1px;
  line-height: 1.2;
}

/* Content Area */
.content-area {
  padding: 0 40rpx;
}

.info-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 40rpx;
  backdrop-filter: blur(10px);
}

.info-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.info-icon {
  font-size: 32rpx;
  color: #FFD60A;
  margin-right: 12rpx;
}

.info-title {
  font-size: 28rpx;
  color: #FFD60A;
  font-weight: 600;
}

.transition-text {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  white-space: pre-wrap;
  text-align: justify;
}

/* Action Buttons */
.action-group {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  margin-bottom: 60rpx;
}

.btn-primary {
  width: 100%;
  height: 110rpx;
  background: linear-gradient(135deg, #00E5FF 0%, #2979FF 100%);
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  box-shadow: 0 8rpx 32rpx rgba(0, 229, 255, 0.25);
  position: relative;
  overflow: hidden;
}

.btn-hover {
  transform: translateY(2rpx);
  box-shadow: 0 4rpx 16rpx rgba(0, 229, 255, 0.2);
  opacity: 0.95;
}

.btn-text {
  font-size: 34rpx;
  font-weight: 600;
  color: #000;
  margin-right: 12rpx;
}

.btn-icon {
  font-size: 40rpx;
  color: #000;
}

.btn-secondary {
  width: 100%;
  height: 90rpx;
  background: rgba(0, 229, 255, 0.05);
  border: 1px solid rgba(0, 229, 255, 0.3);
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-secondary-hover {
  background: rgba(0, 229, 255, 0.1);
}

.btn-icon-small {
  font-size: 32rpx;
  color: #00E5FF;
  margin-right: 10rpx;
}

.btn-text-small {
  font-size: 28rpx;
  color: #00E5FF;
  font-weight: 500;
}

.retest-text {
  font-family: 'Inter', system-ui, sans-serif;
  letter-spacing: 1px;
}

/* Animations */
@keyframes pulse {
  0% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.1); opacity: 0.4; }
  100% { transform: scale(1); opacity: 0.3; }
}

.glitch-effect {
  animation: glitch 1s infinite;
}

@keyframes glitch {
  0% { text-shadow: 2px 2px #ff00c1, -2px -2px #00fff9; }
  2% { text-shadow: 2px 2px #ff00c1, -2px -2px #00fff9; }
  5% { text-shadow: none; }
  100% { text-shadow: none; }
}

.bottom-spacer {
  height: 40rpx;
}

</style>