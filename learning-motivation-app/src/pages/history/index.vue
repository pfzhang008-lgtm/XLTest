<template>
  <view class="container">
    <!-- Main Content -->
    <view class="content">
      <view class="glass-card purple-theme">
        <view class="title-row">
          <text class="card-title">历史档案</text>
        </view>
        <view class="desc-box">
          <text class="desc-text">这里将展示您的长期监测数据和认知能力下滑趋势。</text>
        </view>
      </view>
    </view>
    
    <!-- Custom Tab Bar -->
    <app-tab-bar current-tab="history"></app-tab-bar>
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
      title: '历史档案 - 学习动力中心',
      path: '/pages/history/index'
    };
  }
};
</script>

<style>
.container {
  min-height: 100vh;
  background-color: #05070a;
  background-image: 
    linear-gradient(rgba(157, 0, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(157, 0, 255, 0.03) 1px, transparent 1px);
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
}

.purple-theme {
  box-shadow: 0 0 20px rgba(157, 0, 255, 0.05);
  border-color: rgba(157, 0, 255, 0.3);
}

.card-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #c084fc;
  margin-bottom: 20rpx;
  display: block;
}

.desc-text {
  font-size: 28rpx;
  color: #9ca3af;
}
</style>
