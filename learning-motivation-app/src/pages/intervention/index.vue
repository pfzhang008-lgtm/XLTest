<template>
  <view class="container">
    <!-- Main Content -->
    <view class="content">
      <!-- Settings Menu -->
      <view class="menu-list">
        <view class="glass-card menu-item" @click="navigateToCalibration">
          <view class="menu-icon-box">
             <image class="menu-icon" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI0Y1OUUwQiI+PHBhdGggZD0iTTMgMTcuMjVWMjFoMy43NUwxNy44MSA5Ljk0bC0zLjc1LTMuNzVMMyAxNy4yNXpNMjAuNzEgNy4wNGMuMzktLjM5LjM5LTEuMDIgMC0xLjQxbC0yLjM0LTIuMzRjLS4zOS0uMzktMS4wMi0uMzktMS40MSAwbC0xLjgzIDEuODMgMy43NSAzLjc1IDEuODMtMS44M3oiLz48L3N2Zz4=" mode="aspectFit"></image>
          </view>
          <view class="menu-content">
            <text class="menu-title">修改孩子基础档案</text>
            <text class="menu-sub">更新生理参数与常模匹配数据</text>
          </view>
          <view class="menu-arrow">></view>
        </view>

        <!-- Data Reset Section -->
        <view class="section-title">数据重置</view>
        
        <view class="module-reset-list">
          <view 
            v-for="(mod, index) in modules" 
            :key="index" 
            class="glass-card reset-card"
          >
            <view class="reset-header">
              <text class="reset-title">{{ mod.title }}</text>
              
            </view>
            
            <view class="reset-actions">
              <button 
                class="reset-btn btn-child" 
                hover-class="btn-hover"
                @click="resetChildData(mod.id)"
              >
                <text>清除测试进度</text>
                <text class="btn-desc">保留家长问卷</text>
              </button>
              
              <button 
                class="reset-btn btn-all" 
                hover-class="btn-hover"
                @click="resetAllModuleData(mod.id)"
              >
                <text>彻底重置</text>
                <text class="btn-desc">含问卷及档案</text>
              </button>
            </view>
          </view>
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
  data() {
    return {
      modules: [
        { id: '01', title: '沉迷游戏 · 手机成瘾' },
        { id: '02', title: '沉迷刷手机 · 脑雾' },
        { id: '03', title: '严重分心 · 疑似多动' },
        { id: '04', title: '考前焦虑 · 发挥失常' },
        { id: '05', title: '严重厌学 · 动力丧失' }
      ]
    };
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
    },
    // Clear only child test data (keep survey)
    resetChildData(moduleId) {
      uni.showModal({
        title: '清除测试进度',
        content: `保留家长问卷，仅清除 模块 ${moduleId} 的孩子测试进度？`,
        confirmText: '清除进度',
        confirmColor: '#F59E0B',
        success: (res) => {
          if (res.confirm) {
            this.performReset(moduleId, true);
          }
        }
      });
    },
    // Clear ALL data for module
    resetAllModuleData(moduleId) {
      uni.showModal({
        title: '彻底重置',
        content: `警告：将清除 模块 ${moduleId} 的所有数据（含家长问卷）。需重新填写问卷才能测试。`,
        confirmText: '彻底清除',
        confirmColor: '#EF4444',
        success: (res) => {
          if (res.confirm) {
            this.performReset(moduleId, false);
          }
        }
      });
    },
    performReset(moduleId, keepSurvey = false) {
      try {
        const idStr = String(moduleId).padStart(2, '0');
        const prefix = `module_${idStr}`; // e.g. module_01
        // survey key pattern: module_01_survey_completed
        const surveyKey = `module_${idStr}_survey_completed`;
        
        const res = uni.getStorageInfoSync();
        let count = 0;
        
        res.keys.forEach(key => {
          // Check if key belongs to this module
          if (key.startsWith(prefix)) {
            // If keepSurvey is true, SKIP survey-related keys
            if (keepSurvey && key.includes('_survey_')) {
              return;
            }
            uni.removeStorageSync(key);
            count++;
          }
        });
        
        // If keeping survey, restore step to 2 (if survey completed)
        if (keepSurvey) {
           const isCompleted = uni.getStorageSync(surveyKey);
           if (isCompleted) {
             uni.setStorageSync(`${prefix}_current_step`, 2);
           }
        }
        
        console.log(`[Reset] Cleared ${count} keys for Module ${moduleId} (Keep Survey: ${keepSurvey})`);
        
        uni.showToast({
          title: keepSurvey ? '进度已重置' : '模块已彻底重置',
          icon: 'none'
        });
      } catch (e) {
        console.error(`[Reset] Error resetting module ${moduleId}:`, e);
        uni.showToast({
          title: '重置失败',
          icon: 'none'
        });
      }
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

/* Section Title */
.section-title {
  font-size: 28rpx;
  color: #94a3b8;
  margin: 48rpx 0 24rpx;
  padding-left: 16rpx;
  border-left: 4rpx solid #F59E0B;
  line-height: 1;
}

/* Module Reset List */
.module-reset-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.reset-card {
  display: flex;
  flex-direction: column;
  padding: 32rpx;
  margin-bottom: 0;
}

.reset-header {
  margin-bottom: 24rpx;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.reset-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #e2e8f0;
}

.reset-subtitle {
  font-size: 24rpx;
  color: #64748b;
  font-family: 'JetBrains Mono', monospace;
}

.reset-actions {
  display: flex;
  gap: 20rpx;
}

.reset-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24rpx 10rpx;
  border-radius: 16rpx;
  line-height: 1.2;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s;
}

.reset-btn::after {
  border: none;
}

.reset-btn text:first-child {
  font-size: 26rpx;
  font-weight: bold;
  margin-bottom: 8rpx;
}

.btn-desc {
  font-size: 20rpx;
  opacity: 0.7;
}

/* Button Variants */
.btn-child {
  color: #F59E0B;
  border-color: rgba(245, 158, 11, 0.3);
}

.btn-child:active {
  background: rgba(245, 158, 11, 0.1);
}

.btn-all {
  color: #EF4444;
  border-color: rgba(239, 68, 68, 0.3);
}

.btn-all:active {
  background: rgba(239, 68, 68, 0.1);
}
</style>
