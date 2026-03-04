<template>
  <view class="container">
    <!-- Navbar (Transparent/Custom) -->
    <view class="custom-nav" :style="{ paddingTop: menuButtonTop + 'px', paddingBottom: navPaddingBottom + 'px' }">
      <view class="nav-back" :style="{ height: menuButtonHeight + 'px', width: menuButtonHeight + 'px' }" @click="goBack">
        <text class="back-arrow">←</text>
      </view>
    </view>

    <!-- Main Content -->
    <scroll-view scroll-y="true" class="main-content">
      
      <!-- Module 1: Exam Anxiety -->
      <view class="glass-card purple-theme">
        <view class="card-body">
          <view class="title-row">
            <image class="title-icon" :src="icons.mind" mode="aspectFit"></image>
            <text class="card-title">考前焦虑粉碎</text>
            <view class="outline-badge purple-border">
              <text class="outline-badge-text purple-text">情绪调节</text>
            </view>
          </view>
          
          <view class="desc-box">
            <text class="desc-text">
              <text class="code-text purple-text">[认知重构]</text> 捕捉并粉碎<text class="highlight-text purple-light-text">负面念头</text>，通过可视化交互缓解考前紧张情绪。
            </text>
          </view>
          
          <button class="tech-button purple-btn" hover-class="tech-btn-hover" @click="navigateTo('/pages/exam-anxiety/ExamAnxiety')">
            <view class="btn-glow"></view>
            <text class="btn-text purple-text">启动疗愈</text>
            <image class="btn-icon" :src="icons.bolt" mode="aspectFit"></image>
          </button>
        </view>
        <view class="scan-line purple-scan"></view>
      </view>

      <!-- Module 2: School Refusal -->
      <view class="glass-card cyan-theme">
        <view class="card-body">
          <view class="title-row">
            <image class="title-icon" :src="icons.scan" mode="aspectFit"></image>
            <text class="card-title">厌学倾向扫描</text>
            <view class="outline-badge cyan-border">
              <text class="outline-badge-text cyan-text">动机分析</text>
            </view>
          </view>
          
          <view class="desc-box">
            <text class="desc-text">
              <text class="code-text cyan-text">[深度溯源]</text> 分析抵触上学的<text class="highlight-text">深层原因</text>，是社交压力、学业受挫还是家庭因素？
            </text>
          </view>
          
          <button class="tech-button cyan-btn" hover-class="tech-btn-hover" @click="showDevToast">
            <view class="btn-glow"></view>
            <text class="btn-text">开始扫描</text>
            <image class="btn-icon" :src="icons.vital" mode="aspectFit"></image>
          </button>
        </view>
      </view>

      <!-- Module 3: Parent Survey -->
      <view class="glass-card emerald-theme">
        <view class="card-body">
          <view class="title-row">
            <image class="title-icon" :src="icons.survey" mode="aspectFit"></image>
            <text class="card-title">情绪状态家长问卷</text>
            <view class="outline-badge emerald-border">
              <text class="outline-badge-text emerald-text">家庭视角</text>
            </view>
          </view>
          
          <view class="desc-box">
            <text class="desc-text">
              <text class="code-text emerald-text">[多维评估]</text> 从家长视角记录孩子的<text class="highlight-text">情绪变化</text>与行为异常。
            </text>
          </view>
          
          <button class="tech-button emerald-btn" hover-class="tech-btn-hover" @click="showDevToast">
            <view class="btn-glow"></view>
            <text class="btn-text emerald-text">填写问卷</text>
            <image class="btn-icon" :src="icons.analytics" mode="aspectFit"></image>
          </button>
        </view>
      </view>

      <!-- Footer Spacer -->
      <view class="footer-spacer"></view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      statusBarHeight: 20,
      menuButtonTop: 24,
      menuButtonHeight: 32,
      navPaddingBottom: 8,
      icons: {
        back: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22%23FFFFFF%22%3E%3Cpath d%3D%22M11.67 3.87L9.9 2.1 0 12l9.9 9.9 1.77-1.77L3.54 12z%22%2F%3E%3C%2Fsvg%3E',
        mind: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22%239d00ff%22%3E%3Cpath d%3D%22M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z%22%2F%3E%3C%2Fsvg%3E',
        scan: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22%2300F2FF%22%3E%3Cpath d%3D%22M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z%22%2F%3E%3C%2Fsvg%3E',
        survey: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22%2310b981%22%3E%3Cpath d%3D%22M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z%22%2F%3E%3C%2Fsvg%3E',
        bolt: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22%239d00ff%22%3E%3Cpath d%3D%22M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.07-.12C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15C12.96 17.55 11 21 11 21z%22%2F%3E%3C%2Fsvg%3E',
        vital: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22%2300F2FF%22%3E%3Cpath d%3D%22M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5.71 13.29a.996.996 0 0 1-1.41 0L10 14.41l-1.88 1.88a.996.996 0 1 1-1.41-1.41l2.59-2.59c.39-.39 1.02-.39 1.41 0l1.88 1.88 1.88-1.88c.39-.39 1.02-.39 1.41 0 .39.39.39 1.02 0 1.41l-2.59 2.59z%22%2F%3E%3C%2Fsvg%3E',
        analytics: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22%2310b981%22%3E%3Cpath d%3D%22M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2v-5h2v5zm4 0h-2v-3h2v3z%22%2F%3E%3C%2Fsvg%3E'
      }
    };
  },
  onLoad() {
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
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    navigateTo(url) {
      uni.navigateTo({ url });
    },
    showDevToast() {
      uni.showToast({ title: '开发中', icon: 'none' });
    }
  }
};
</script>

<style>
/* 页面容器 */
.container {
  min-height: 100vh;
  padding-bottom: 120rpx;
  background-color: #05070a;
  background-image: 
    linear-gradient(rgba(0, 242, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 242, 255, 0.03) 1px, transparent 1px);
  background-size: 30px 30px;
  color: #e2e8f0;
  font-family: 'Noto Sans SC', sans-serif;
  display: flex;
  flex-direction: column;
}

/* Header */
.custom-nav {
  width: 100%;
  display: flex;
  align-items: center;
  padding-left: 32rpx;
  padding-right: 32rpx;
  box-sizing: border-box;
  z-index: 100;
}
.nav-back {
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 101;
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

/* Main Content */
.main-content {
  flex: 1;
  padding: 20rpx 32rpx 32rpx;
  box-sizing: border-box;
}

/* Glass Card Common */
.glass-card {
  background: rgba(17, 24, 39, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
}

.title-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.title-icon {
  width: 44rpx;
  height: 44rpx;
}

.card-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #ffffff;
  letter-spacing: -0.02em;
}

.desc-box {
  padding: 20rpx;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 12rpx;
  border: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 24rpx;
}

.desc-text {
  font-size: 24rpx;
  color: #9ca3af;
  line-height: 1.5;
}

.code-text {
  font-size: 22rpx;
  margin-right: 8rpx;
  opacity: 0.8;
}

.highlight-text {
  color: #ffffff;
  font-weight: bold;
}

/* Button */
.tech-button {
  width: 100%;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14rpx;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16rpx;
  position: relative;
  overflow: hidden;
}

.tech-btn-hover {
  opacity: 0.9;
  transform: scale(0.98);
}

.btn-text {
  font-size: 28rpx;
  font-weight: bold;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #00f2ff;
}

.btn-icon {
  width: 32rpx;
  height: 32rpx;
}

/* Themes */
/* Cyan Theme */
.cyan-theme {
  box-shadow: 0 0 20px rgba(0, 242, 255, 0.05);
}
.cyan-bg { background-color: #06b6d4; }
.cyan-text { color: #22d3ee; }
.cyan-btn .btn-text { color: #22d3ee; }

/* Purple Theme */
.purple-theme {
  box-shadow: 0 0 20px rgba(157, 0, 255, 0.05);
}
.purple-text { color: #c084fc; }
.purple-light-text { color: #d8b4fe; }
.purple-btn .btn-text { color: #c084fc; }

.purple-scan {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #9d00ff, transparent);
  opacity: 0.2;
}

/* Emerald Theme */
.emerald-theme {
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.05);
}
.emerald-text { color: #34d399; }
.emerald-btn .btn-text { color: #34d399; }

/* Footer Spacer */
.footer-spacer {
  height: 80rpx;
}

/* Outline Badge */
.outline-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2rpx 12rpx;
  border-radius: 8rpx;
  border: 1px solid;
  height: 34rpx;
  margin-left: 16rpx;
}

.outline-badge-text {
  font-size: 22rpx;
  font-weight: normal;
  line-height: 1;
}

.cyan-border { border-color: #00f2ff; }
.purple-border { border-color: #9d00ff; }
.emerald-border { border-color: #10b981; }
</style>