<template>
  <view class="container">
    <!-- Main Content -->
    <view class="content">
      <view class="glass-card gold-theme">
        <view class="title-row">
          <text class="card-title">我的</text>
        </view>
        <view class="desc-box">
          <text class="desc-text">个人中心与数据管理。</text>
        </view>
      </view>

      <!-- Settings Menu -->
      <view class="menu-list">
        <view class="glass-card menu-item" @click="navigateToCalibration">
          <view class="menu-icon-box">
             <image class="menu-icon" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI0Y1OUUwQiI+PHBhdGggZD0iTTMgMTcuMjVWMjFoMy43NUwxNy44MSA5Ljk0bC0zLjc1LTMuNzVMMyAxNy4yNXpNMjAuNzEgNy4wNGMuMzktLjM5LjM5LTEuMDIgMC0xLjQxbC0yLjM0LTIuMzRjLS4zOS0uMzktMS4wMi0uMzktMS40MSAwbC0xLjgzIDEuODMgMy43NSAzLjc1IDEuODMtMS44M3oiLz48L3N2Zz4=" mode="aspectFit"></image>
          </view>
          <view class="menu-content">
            <text class="menu-title">修改基础档案</text>
            <text class="menu-sub">更新生理参数与常模匹配数据</text>
          </view>
          <view class="menu-arrow">></view>
        </view>

        <!-- Data Reset Section -->
        <view class="section-title">数据重置</view>
        
        <!-- Batch Reset -->
        <view class="glass-card menu-item warning-item" @click="resetAllExceptParent">
          <view class="menu-icon-box warning-box">
             <image class="menu-icon" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI0VGNDQ0NCI+PHBhdGggZD0iTTEyIDJDNi40NyAyIDIgNi40NyAyIDEyczQuNDcgMTAgMTAgMTAgMTAtNC40NyAxMC0xMFMxNy41MyAyIDEyIDJ6bTUgMTMuNTlMMTUuNTkgMTcgMTIgMTMuNDEgOC40MSAxNyA3IDE1LjU5IDEwLjU5IDEyIDcgOC40MSA4LjQxIDcgMTIgMTAuNTkgMTUuNTkgNyAxNyA4LjQxIDEzLjQxIDEyIDE3IDE1LjU5eiIvPjwvc3ZnPg==" mode="aspectFit"></image>
          </view>
          <view class="menu-content">
            <text class="menu-title text-warning">重置除家长问卷外所有数据</text>
            <text class="menu-sub">保留基础档案，清除所有神经测试进度</text>
          </view>
          <view class="menu-arrow">></view>
        </view>

        <!-- Module Specific Reset -->
        <view class="grid-container">
          <view 
            class="glass-card grid-item" 
            v-for="i in 5" 
            :key="i"
            @click="resetModuleData(i)"
          >
            <text class="grid-title">重置模块 {{String(i).padStart(2, '0')}}</text>
            <text class="grid-sub">清除 Mod {{String(i).padStart(2, '0')}} 数据</text>
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
    resetModuleData(moduleId) {
      uni.showModal({
        title: '确认重置',
        content: `确定要清除 模块 ${moduleId} 的所有数据吗？此操作不可恢复。`,
        confirmColor: '#EF4444',
        success: (res) => {
          if (res.confirm) {
            this.performReset(moduleId);
          }
        }
      });
    },
    resetAllExceptParent() {
      uni.showModal({
        title: '危险操作',
        content: '确定要清除除家长问卷外的所有测试数据吗？这将重置所有神经测试进度。',
        confirmColor: '#EF4444',
        success: (res) => {
          if (res.confirm) {
            // Reset Mod 02-05
            [2, 3, 4, 5].forEach(id => this.performReset(id, false));
            // Also clear generic test states if any
            uni.removeStorageSync('active_module_id');
            uni.removeStorageSync('current_step');
            uni.showToast({
              title: '重置成功',
              icon: 'success'
            });
          }
        }
      });
    },
    performReset(moduleId, showToast = true) {
      try {
        const idStr = String(moduleId).padStart(2, '0');
        const prefix = `module_${idStr}`;
        const res = uni.getStorageInfoSync();
        
        let count = 0;
        res.keys.forEach(key => {
          if (key.startsWith(prefix)) {
            uni.removeStorageSync(key);
            count++;
          }
        });
        
        console.log(`[Reset] Cleared ${count} keys for Module ${moduleId}`);
        
        if (showToast) {
          uni.showToast({
            title: `模块 ${moduleId} 已重置`,
            icon: 'none'
          });
        }
      } catch (e) {
        console.error(`[Reset] Error resetting module ${moduleId}:`, e);
        if (showToast) {
          uni.showToast({
            title: '重置失败',
            icon: 'none'
          });
        }
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

/* Section Title */
.section-title {
  font-size: 28rpx;
  color: #94a3b8;
  margin: 48rpx 0 24rpx;
  padding-left: 16rpx;
  border-left: 4rpx solid #F59E0B;
  line-height: 1;
}

/* Warning Styles */
.warning-item {
  border-color: rgba(239, 68, 68, 0.3);
}

.warning-item:active {
  background: rgba(239, 68, 68, 0.1);
}

.warning-box {
  background: rgba(239, 68, 68, 0.1);
}

.text-warning {
  color: #EF4444;
}

/* Grid Layout for Modules */
.grid-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.grid-item {
  width: calc(50% - 10rpx);
  padding: 24rpx;
  margin-bottom: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  min-height: 140rpx;
}

.grid-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #e2e8f0;
  margin-bottom: 8rpx;
}

.grid-sub {
  font-size: 22rpx;
  color: #9ca3af;
}
</style>
