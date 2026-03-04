<template>
  <view class="container">
    <!-- Main Content -->
    <view class="content">
      <view class="glass-card gold-theme">
        <view class="title-row">
          <text class="card-title">专家干预</text>
        </view>
        <view class="desc-box">
          <text class="desc-text">天赋重定向与戒断方案中心。</text>
        </view>
      </view>

      <!-- Settings Menu -->
      <view class="menu-list">
        <view class="glass-card menu-item" @click="navigateToCalibration">
          <view class="menu-icon-box">
             <image class="menu-icon" src="data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22%23F59E0B%22%3E%3Cpath d%3D%22M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z%22%2F%3E%3C%2Fsvg%3E" mode="aspectFit"></image>
          </view>
          <view class="menu-content">
            <text class="menu-title">修改基础档案</text>
            <text class="menu-sub">更新生理参数与常模匹配数据</text>
          </view>
          <view class="menu-arrow">></view>
        </view>
      </view>
    </view>
    
    <!-- Custom Tab Bar -->
    <app-tab-bar current-tab="expert"></app-tab-bar>
  </view>
</template>

<script>
import AppTabBar from '@/components/AppTabBar.vue';

export default {
  components: {
    AppTabBar
  },
  onShow() {
    uni.hideTabBar();
  },
  onShareAppMessage() {
    return {
      title: '专家干预 - 学习动力中心',
      path: '/pages/intervention/index'
    };
  },
  methods: {
    navigateToCalibration() {
      uni.navigateTo({
        url: '/pages/onboarding/calibration'
      });
    }
  }
};
</script>

<style>
.container {
  min-height: 100vh;
  background-color: #05070a;
  background-image: 
    linear-gradient(rgba(245, 158, 11, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(245, 158, 11, 0.03) 1px, transparent 1px);
  background-size: 30px 30px;
  color: #e2e8f0;
  padding-bottom: 120rpx; /* Space for TabBar */
}

.content {
  padding: 120rpx 32rpx 32rpx;
}

.glass-card {
  background: rgba(17, 24, 39, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24rpx;
  padding: 40rpx;
  margin-bottom: 32rpx;
}

.menu-list {
  margin-top: 32rpx;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 32rpx;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.menu-item:active {
  background: rgba(245, 158, 11, 0.1);
}

.menu-icon-box {
  width: 80rpx;
  height: 80rpx;
  background: rgba(245, 158, 11, 0.1);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
}

.menu-icon {
  width: 48rpx;
  height: 48rpx;
}

.menu-content {
  flex: 1;
}

.menu-title {
  font-size: 32rpx;
  color: #e2e8f0;
  font-weight: bold;
  display: block;
  margin-bottom: 8rpx;
}

.menu-sub {
  font-size: 24rpx;
  color: #9ca3af;
}

.menu-arrow {
  font-size: 32rpx;
  color: #64748b;
  margin-left: 16rpx;
}

.gold-theme {
  box-shadow: 0 0 20px rgba(245, 158, 11, 0.05);
  border-color: rgba(245, 158, 11, 0.3);
}

.card-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #F59E0B;
  margin-bottom: 20rpx;
  display: block;
}

.desc-text {
  font-size: 28rpx;
  color: #9ca3af;
}
</style>
