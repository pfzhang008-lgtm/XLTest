<template>
  <view class="container">
    <!-- Navbar (Transparent/Custom) -->
    <view class="custom-nav" :style="{ paddingTop: menuButtonTop + 'px', paddingBottom: navPaddingBottom + 'px' }">
      <view class="nav-back" :style="{ height: menuButtonHeight + 'px', width: menuButtonHeight + 'px' }" @click="goBack">
        <text class="back-arrow">←</text>
      </view>
      <text class="nav-title">评估流程说明</text>
    </view>

    <!-- Briefing Content -->
    <scroll-view scroll-y="true" class="main-content" v-if="briefingConfig" :style="{ paddingTop: contentPaddingTop + 'px' }">
      
      <!-- Header Section -->
      <view class="header-section">
        <text class="main-title">{{ briefingConfig.title }}</text>
        <view class="divider"></view>
        <text class="intro-text">{{ briefingConfig.intro }}</text>
      </view>

      <!-- Timeline Section -->
      <view class="timeline-container">
        <view class="timeline-item" v-for="(item, index) in briefingConfig.testItems" :key="index">
          <view class="timeline-left">
            <view class="timeline-dot" :class="{ 'active': index === 0 }"></view>
            <view class="timeline-line" v-if="index !== briefingConfig.testItems.length - 1"></view>
          </view>
          <view class="timeline-content glass-card">
            <view class="item-header">
              <text class="item-name">{{ item.name }}</text>
              <text class="item-time">{{ item.time }}</text>
            </view>
            <text class="item-desc">{{ item.desc }}</text>
          </view>
        </view>
      </view>

      <!-- Warning Section -->
      <view class="warning-box">
        <image class="warning-icon" :src="icons.alert" mode="aspectFit"></image>
        <text class="warning-text">{{ briefingConfig.warning }}</text>
      </view>

      <!-- Footer Spacer -->
      <view class="footer-spacer"></view>
    </scroll-view>

    <!-- Bottom Action Bar -->
    <view class="action-bar safe-area-bottom">
      <button class="start-btn" hover-class="btn-hover" @click="startAssessment">
        <text>{{ startButtonText }}</text>
        <view class="btn-glow"></view>
      </button>
    </view>
  </view>
</template>

<script>
// Import Configs
import mod01Config from '@/data/config_mod01.json';
import mod02Config from '@/data/config_mod02.json';
import mod03Config from '@/data/config_mod03.json';
import mod04Config from '@/data/config_mod04.json';
import mod05Config from '@/data/config_mod05.json';

const configMap = {
  '01': mod01Config,
  '02': mod02Config,
  '03': mod03Config,
  '04': mod04Config,
  '05': mod05Config
};

export default {
  data() {
    return {
      moduleId: '',
      moduleConfig: null,
      briefingConfig: null,
      
      // UI Layout
      statusBarHeight: 20,
      menuButtonTop: 24,
      menuButtonHeight: 32,
      navPaddingBottom: 8,
      contentPaddingTop: 100,
      
      icons: {
        alert: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22%23f59e0b%22%3E%3Cpath d%3D%22M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z%22%2F%3E%3C%2Fsvg%3E'
      },
      isSurveyCompleted: false
    };
  },
  computed: {
    startButtonText() {
      return this.isSurveyCompleted ? '继续评估' : '开始评估';
    }
  },
  onShow() {
    if (this.moduleId) {
      const storageKey = `module_${this.moduleId}_survey_completed`;
      this.isSurveyCompleted = !!uni.getStorageSync(storageKey);
    }
  },
  onLoad(options) {
    // 1. Get Module ID
    this.moduleId = options.moduleId || '';
    console.log('[Briefing] Loaded with Module ID:', this.moduleId);

    if (!this.moduleId || !configMap[this.moduleId]) {
      uni.showToast({ title: '模块参数错误', icon: 'none' });
      setTimeout(() => uni.navigateBack(), 1500);
      return;
    }

    // 2. Load Config
    this.moduleConfig = configMap[this.moduleId];
    this.briefingConfig = this.moduleConfig.briefing;
    console.log('[Briefing] Config Loaded:', this.moduleConfig);

    // 3. Layout Calculation
    const sysInfo = uni.getSystemInfoSync();
    this.statusBarHeight = sysInfo.statusBarHeight || 20;

    // #ifdef MP-WEIXIN
    const menuButton = uni.getMenuButtonBoundingClientRect();
    this.menuButtonTop = menuButton.top;
    this.menuButtonHeight = menuButton.height;
    this.navPaddingBottom = menuButton.top - this.statusBarHeight;
    if (this.navPaddingBottom < 4) this.navPaddingBottom = 4;
    
    const navHeight = this.menuButtonTop + this.menuButtonHeight + this.navPaddingBottom;
    this.contentPaddingTop = navHeight + 20;
    // #endif
    
    // #ifndef MP-WEIXIN
    this.menuButtonTop = this.statusBarHeight + 4;
    this.menuButtonHeight = 32;
    this.navPaddingBottom = 4;
    this.contentPaddingTop = this.statusBarHeight + 32 + 4 + 20;
    // #endif
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    startAssessment() {
      if (!this.moduleConfig) return;

      if (this.isSurveyCompleted) {
        console.log(`[Flow] Module ${this.moduleId} Survey cached, skipping to Child Test`);
        
        const testQueue = this.moduleConfig.testQueue;
        if (testQueue && testQueue.length > 0) {
          const firstTest = testQueue[0];
          let url = '';
          const commonParams = `?moduleId=${this.moduleId}`;
          
          switch(firstTest.type) {
            case 'PVT':
              url = '/pages/neural-link/PVT' + commonParams;
              break;
            case 'SART':
              url = '/pages/neural-link/sart' + commonParams;
              break;
            case 'Stroop':
              url = '/pages/neural-link/Stroop' + commonParams;
              break;
            case 'EmotionalStroop':
              url = '/pages/neural-link/Stroop' + commonParams + '&mode=emotional';
              break;
            case 'Schulte':
              url = '/pages/neural-link/grid' + commonParams;
              break;
            case 'NBack':
              url = '/pages/neural-link/nback' + commonParams;
              break;
          }
          
          if (url) {
            uni.navigateTo({ url });
            return;
          }
        }
      }

      console.log(`[Flow] Starting Assessment -> Navigate to Survey: ${this.moduleConfig.surveyPath}`);
      if (this.moduleConfig.surveyPath) {
        let url = this.moduleConfig.surveyPath;
        if (url.indexOf('?') !== -1) {
             url += `&moduleId=${this.moduleId}`;
        } else {
             url += `?moduleId=${this.moduleId}`;
        }
        uni.navigateTo({
          url: url
        });
      } else {
        uni.showToast({ title: '配置缺失: surveyPath', icon: 'none' });
      }
    }
  }
};

</script>

<style>
/* 页面容器 */
.container {
  min-height: 100vh;
  background-color: #0f172a;
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
}

/* Custom Navigation */
.custom-nav {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  padding-left: 30rpx;
  box-sizing: border-box;
}

.nav-back {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  margin-right: 20rpx;
}

.back-arrow {
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
}

.nav-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
}

/* Main Content */
.main-content {
  flex: 1;
  padding: 0 40rpx 120rpx;
  box-sizing: border-box;
}

/* Header Section */
.header-section {
  margin-bottom: 60rpx;
}

.main-title {
  font-size: 48rpx;
  font-weight: 700;
  color: #25f4f4; /* Cyber Cyan */
  display: block;
  margin-bottom: 20rpx;
  text-shadow: 0 0 10px rgba(37, 244, 244, 0.3);
}

.divider {
  width: 80rpx;
  height: 6rpx;
  background: #25f4f4;
  margin-bottom: 30rpx;
  border-radius: 3rpx;
}

.intro-text {
  font-size: 28rpx;
  color: #94a3b8;
  line-height: 1.6;
}

/* Timeline Section */
.timeline-container {
  position: relative;
  padding-left: 20rpx;
}

.timeline-item {
  display: flex;
  margin-bottom: 40rpx;
}

.timeline-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 30rpx;
  width: 30rpx;
}

.timeline-dot {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  background: #334155;
  border: 2rpx solid #475569;
  margin-top: 10rpx;
}

.timeline-dot.active {
  background: #25f4f4;
  border-color: #25f4f4;
  box-shadow: 0 0 10px rgba(37, 244, 244, 0.5);
}

.timeline-line {
  flex: 1;
  width: 2rpx;
  background: #334155;
  margin-top: 10rpx;
  margin-bottom: -20rpx; /* Connect to next dot */
}

.timeline-content {
  flex: 1;
  padding: 30rpx;
  background: rgba(30, 41, 59, 0.5);
  border: 1rpx solid rgba(255, 255, 255, 0.1);
  border-radius: 16rpx;
  backdrop-filter: blur(5px);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
}

.item-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #e2e8f0;
}

.item-time {
  font-size: 24rpx;
  color: #64748b;
  background: rgba(0, 0, 0, 0.3);
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.item-desc {
  font-size: 26rpx;
  color: #94a3b8;
  line-height: 1.5;
}

/* Warning Box */
.warning-box {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 16rpx;
  padding: 30rpx;
  display: flex;
  align-items: flex-start;
  margin-top: 40rpx;
}

.warning-icon {
  width: 40rpx;
  height: 40rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.warning-text {
  font-size: 26rpx;
  color: #fbbf24;
  line-height: 1.5;
}

.footer-spacer {
  height: 160rpx;
}

/* Action Bar */
.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(10px);
  padding: 30rpx 40rpx;
  padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 90;
  box-sizing: border-box;
}

.start-btn {
  background: linear-gradient(90deg, #00f2ff, #0066ff);
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
  height: 90rpx;
  line-height: 90rpx;
  border-radius: 45rpx;
  border: none;
  position: relative;
  overflow: hidden;
}

.btn-hover {
  transform: scale(0.98);
  opacity: 0.9;
}

.btn-glow {
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  transform: skewX(-20deg);
  animation: glow 2s infinite;
}

@keyframes glow {
  0% { left: -100%; }
  100% { left: 200%; }
}
</style>