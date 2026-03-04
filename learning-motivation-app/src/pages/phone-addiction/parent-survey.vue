<template>
  <view class="container">
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="back-btn" @click="goBack">
        <text class="back-arrow">←</text>
      </view>
      <text class="nav-title">家长观察问卷</text>
    </view>
    
    <view class="content">
      <view class="glass-card">
        <text class="card-title">评估说明</text>
        <text class="card-desc">请根据孩子最近一周的表现，客观回答以下问题。</text>
      </view>
      
      <view class="survey-list">
        <view class="question-item">
          <text class="q-text">1. 孩子是否在无法玩游戏时表现出明显的烦躁或焦虑？</text>
          <view class="options">
            <button class="option-btn">从不</button>
            <button class="option-btn">偶尔</button>
            <button class="option-btn">经常</button>
          </view>
        </view>
        
        <view class="question-item">
          <text class="q-text">2. 孩子是否因为游戏而隐瞒真实的上网时间？</text>
          <view class="options">
            <button class="option-btn">从不</button>
            <button class="option-btn">偶尔</button>
            <button class="option-btn">经常</button>
          </view>
        </view>
      </view>
      
      <button class="submit-btn" @click="submit">提交评估</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      statusBarHeight: 20
    }
  },
  onLoad() {
    const sysInfo = uni.getSystemInfoSync();
    this.statusBarHeight = sysInfo.statusBarHeight || 20;
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    submit() {
      uni.showToast({
        title: '评估完成',
        icon: 'success'
      });
      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
    }
  }
}
</script>

<style>
.container {
  min-height: 100vh;
  background-color: #05070A;
  color: #fff;
}
.nav-bar {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  background-color: rgba(5, 7, 10, 0.9);
}
.back-btn {
  width: 70rpx;
  height: 70rpx;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
}
.back-arrow {
  color: #fff;
  font-size: 40rpx;
  font-weight: bold;
  line-height: 1;
}
.nav-title {
  flex: 1;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  margin-right: 40px;
}
.content {
  padding: 20px;
}
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
}
.card-title {
  display: block;
  font-size: 18px;
  color: #00F2FF;
  margin-bottom: 8px;
}
.card-desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}
.question-item {
  margin-bottom: 24px;
}
.q-text {
  display: block;
  font-size: 16px;
  margin-bottom: 12px;
}
.options {
  display: flex;
  gap: 10px;
}
.option-btn {
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  border: none;
}
.submit-btn {
  background: linear-gradient(90deg, #00F2FF, #00A8FF);
  color: #000;
  font-weight: bold;
  margin-top: 32px;
}
</style>
