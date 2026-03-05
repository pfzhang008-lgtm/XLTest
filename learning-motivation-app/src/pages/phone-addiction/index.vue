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
      
      <!-- Module 1: Game -->
      <view class="glass-card cyan-theme">
        
        <view class="card-body">
          <view class="title-row">
            <image class="title-icon" :src="icons.neurology" mode="aspectFit" ></image>
            <text class="card-title">PVT 视动反应测试</text>
            <view class="outline-badge cyan-border">
              <text class="outline-badge-text cyan-text">竞技/反应</text>
            </view>
          </view>
          
          <view class="desc-box">
            <text class="desc-text">
              <text class="code-text cyan-text">[核心指标]</text> 对标职业选手 <text class="highlight-text">140ms</text> 极限阈值。检测你的大脑是“天赋异禀”还是已被“多巴胺劫持”导致降频？
            </text>
          </view>
          
          <button class="tech-button cyan-btn" hover-class="tech-btn-hover" @click="startTest('Game')">
            <view class="btn-glow"></view>
            <text class="btn-text">启动测试</text>
            <image class="btn-icon" :src="icons.bolt" mode="aspectFit"></image>
          </button>
        </view>
        
        <!-- Scan Line Effect -->
        <view class="scan-line cyan-scan"></view>
      </view>

      <!-- Module 2: Short Video -->
      <view class="glass-card emerald-theme">
        
        <view class="card-body">
          <view class="title-row">
            <image class="title-icon" :src="icons.mindfulness" mode="aspectFit"  ></image>
            <text class="card-title">Stroop 冲突抑制测验</text>
            <view class="outline-badge emerald-border">
              <text class="outline-badge-text emerald-text">抗干扰/自控</text>
            </view>
          </view>
          
          <view class="desc-box">
            <text class="desc-text">
              <text class="code-text emerald-text">[抑制原理]</text> 基于动态 Stroop 范式。检测你的大脑前额叶“刹车系统”是否失灵？当本能<text class="highlight-text">冲动与理智</text>指令冲突时，你是否能抵抗算法的潜意识植入？
            </text>
          </view>
          
          <button class="tech-button emerald-btn" hover-class="tech-btn-hover" @click="startTest('ShortVideo')">
            <view class="btn-glow"></view>
            <text class="btn-text emerald-text">启动测试</text>
            <image class="btn-icon" :src="icons.analytics" mode="aspectFit"></image>
          </button>
        </view>
      </view>

      <!-- Module 3: Parent Survey -->
      <view class="glass-card purple-theme">
        
        <view class="card-body">
          <view class="title-row">
            <image class="title-icon" :src="icons.psychology" mode="aspectFit"  ></image>
            <text class="card-title">家长观察问卷</text>
            <view class="outline-badge purple-border">
              <text class="outline-badge-text purple-text">家庭视角/多维度</text>
            </view>
          </view>
          
          <view class="desc-box">
            <text class="desc-text">
              <text class="code-text purple-text">[深度洞察]</text> 您的孩子是真的沉迷游戏，还是在逃避现实？通过 <text class="highlight-text purple-light-text">15 项行为指标</text>，从旁观者角度还原孩子的真实心理状态。
            </text>
          </view>
          
          <button class="tech-button purple-btn" hover-class="tech-btn-hover" @click="startTest('ParentSurvey')">
            <view class="btn-glow"></view>
            <text class="btn-text purple-text">启动评估</text>
            <image class="btn-icon" :src="icons.vital" mode="aspectFit"></image>
          </button>
        </view>
      </view>

      <!-- Footer Spacer -->
      <view class="footer-spacer"></view>
    </scroll-view>

    <!-- Footer -->
    <view class="footer">
      <view class="footer-info">
        <text>DATA SECURED: AES-256</text>
        <text>BIO-SIGNAL: CONNECTED</text>
      </view>
      <view class="footer-bars">
        <view class="bar-container">
          <view class="bar-fill cyan-bg-half"></view>
        </view>
        <view class="bar-empty"></view>
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
      icons: {
        back: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22%23FFFFFF%22%3E%3Cpath d%3D%22M11.67 3.87L9.9 2.1 0 12l9.9 9.9 1.77-1.77L3.54 12z%22%2F%3E%3C%2Fsvg%3E',
        settings: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22%23FFFFFF%22%3E%3Cpath d%3D%22M5 3h2v2H5v14h2v2H5c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2zm14 0c1.1 0 2 .9 2 2v14c0 1.1-.9 2-2 2h-2v-2h2V5h-2V3h2zM9 5h6v14H9V5zm2 2v2h2V7h-2zm0 4v2h2v-2h-2zm0 4v2h2v-2h-2z%22%2F%3E%3C%2Fsvg%3E',
        neurology: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22%2300F2FF%22%3E%3Cpath d%3D%22M12 2C8 2 4 5 4 9c0 2.5 1.5 4.5 3.5 5.5v2h2v-1.5c0-.8.7-1.5 1.5-1.5h2c.8 0 1.5.7 1.5 1.5V17h2v-2c2-1 3.5-3 3.5-5.5 0-4-4-7-8-7z%22%2F%3E%3C%2Fsvg%3E',
        bolt: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22%2300F2FF%22%3E%3Cpath d%3D%22M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.07-.12C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15C12.96 17.55 11 21 11 21z%22%2F%3E%3C%2Fsvg%3E',
        psychology: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22%239d00ff%22%3E%3Cpath d%3D%22M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z%22%2F%3E%3C%2Fsvg%3E',
        vital: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22%239d00ff%22%3E%3Cpath d%3D%22M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5.71 13.29a.996.996 0 0 1-1.41 0L10 14.41l-1.88 1.88a.996.996 0 1 1-1.41-1.41l2.59-2.59c.39-.39 1.02-.39 1.41 0l1.88 1.88 1.88-1.88c.39-.39 1.02-.39 1.41 0 .39.39.39 1.02 0 1.41l-2.59 2.59z%22%2F%3E%3C%2Fsvg%3E',
        sensors: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22%2310b981%22%3E%3Cpath d%3D%22M11 22v-6h2v6h-2zm-4-3v-3h2v3H7zm8 0v-3h2v3h-2zm-8-5v-3h2v3H7zm8 0v-3h2v3h-2zM6 9c0-3.31 2.69-6 6-6s6 2.69 6 6v3h-2V9c0-2.21-1.79-4-4-4s-4 1.79-4 4v3H6V9z%22%2F%3E%3C%2Fsvg%3E',
        mindfulness: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22%2310b981%22%3E%3Ccircle cx%3D%2212%22 cy%3D%2212%22 r%3D%228%22 opacity%3D%220.3%22%2F%3E%3Ccircle cx%3D%2212%22 cy%3D%2212%22 r%3D%224%22%2F%3E%3C%2Fsvg%3E',
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
    handleSettings() {
      console.log('[Interaction] 用户点击了设置按钮 (手机成瘾页)');
    },
    startTest(type) {
      console.log(`[Interaction] 用户点击了启动测试: ${type}`);
      
      let url = '/pages/neural-link/PVT';
      if (type === 'ParentSurvey') {
        url = '/pages/phone-addiction/parent-survey';
      } else if (type === 'ShortVideo') {
        url = '/pages/neural-link/Stroop';
      }
      
      // 跳转到对应测试页
      uni.navigateTo({
        url: url,
        success: (res) => {
          console.log('[Navigation] 跳转成功:', res);
        },
        fail: (err) => {
          console.error('[Navigation] 跳转失败:', err);
          uni.showToast({
            title: '页面跳转失败',
            icon: 'none'
          });
        }
      });
    }
  }
};
</script>

<style>
/* 页面容器 */
.container {
  min-height: 100vh;
  padding-bottom: 120rpx; /* Space for TabBar */
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
/* Navbar */
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
  /* width and height set inline */
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
  padding: 32rpx; /* Adjusted to 32rpx */
  margin-bottom: 24rpx; /* Adjusted to 24rpx */
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
}

.title-row {
  display: flex;
  align-items: center;
  gap: 20rpx; /* Adjusted to 20rpx */
  margin-bottom: 20rpx; /* Adjusted to 20rpx */
}

.title-icon {
  width: 44rpx; /* Adjusted to 44rpx */
  height: 44rpx; /* Adjusted to 44rpx */
}

.card-title {
  font-size: 34rpx; /* Adjusted to 34rpx */
  font-weight: bold;
  color: #ffffff;
  letter-spacing: -0.02em;
}

.desc-box {
  padding: 20rpx; /* Adjusted to 20rpx */
  background: rgba(0, 0, 0, 0.4);
  border-radius: 12rpx;
  border: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 24rpx; /* Adjusted to 24rpx */
}

.desc-text {
  font-size: 24rpx;
  color: #9ca3af;
  line-height: 1.5; /* Adjusted to 1.5 */
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
  height: 88rpx; /* Adjusted to 88rpx */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14rpx; /* Adjusted to 14rpx */
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
  color: #00f2ff; /* Default cyan */
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
.cyan-bg-dim { background-color: rgba(6, 182, 212, 0.3); }
.cyan-text { color: #22d3ee; }
.cyan-btn .btn-text, .cyan-btn .material-symbols-outlined { color: #22d3ee; }

.cyan-scan {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00f2ff, transparent);
  opacity: 0.2;
}

/* Purple Theme */
.purple-theme {
  box-shadow: 0 0 20px rgba(157, 0, 255, 0.05);
}
.purple-bg { background-color: #a855f7; }
.purple-bg-dim { background-color: rgba(168, 85, 247, 0.3); }
.purple-text { color: #c084fc; }
.purple-light-text { color: #d8b4fe; }
.purple-btn .btn-text { color: #c084fc; }

/* Emerald Theme */
.emerald-theme {
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.05);
}
.emerald-text { color: #34d399; }
.emerald-text-dim { color: rgba(16, 185, 129, 0.5); }
.emerald-btn .btn-text { color: #34d399; }

/* Footer */
.footer-spacer {
  height: 80rpx;
}

.footer {
  padding: 32rpx 48rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  opacity: 0.3;
}

.footer-info {
  font-family: monospace;
  font-size: 16rpx;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  color: #fff;
}

.footer-bars {
  display: flex;
  gap: 8rpx;
}

.bar-container {
  width: 48rpx;
  height: 4rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  overflow: hidden;
}

.bar-fill {
  width: 66%;
  height: 100%;
}

.cyan-bg-half { background-color: rgba(6, 182, 212, 0.5); }

.bar-empty {
  width: 48rpx;
  height: 4rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 999px;
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