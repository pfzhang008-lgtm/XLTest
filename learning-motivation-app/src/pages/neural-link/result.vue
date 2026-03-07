<template>
  <view class="container">
    <!-- Custom Navigation Bar -->
    <view class="custom-nav" :style="{ paddingTop: statusBarHeight + 'px', height: (statusBarHeight + 44) + 'px' }">
      <view class="nav-back" @click="goBack">
        <text class="back-arrow">←</text>
      </view>
      <text class="nav-title">测试结果</text>
    </view>

    <!-- Main Content -->
    <view class="content" :style="{ paddingTop: (statusBarHeight + 44) + 'px' }">
      
      <!-- Score Card -->
      <view class="score-card">
        <view class="score-circle">
          <text class="score-value">{{ displayScore }}</text>
          <text class="score-unit">{{ displayUnit }}</text>
        </view>
        <text class="score-label">{{ testName }} 测试完成</text>
      </view>

      <!-- Metrics Grid -->
      <view class="metrics-grid">
        <view class="metric-item" v-for="(item, index) in metrics" :key="index">
          <text class="metric-label">{{ item.label }}</text>
          <text class="metric-value">{{ item.value }}</text>
        </view>
      </view>

      <!-- Action Buttons -->
      <view class="actions">
        <button class="btn-primary" hover-class="btn-hover" @click="goBack">
          <text>继续下一项评估</text>
          <text class="btn-icon">→</text>
        </button>
        <button class="btn-secondary" hover-class="btn-hover" @click="retest">
          <text>重新测试</text>
          <text class="material-icons btn-icon-small">refresh</text>
        </button>
      </view>

    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      statusBarHeight: 20,
      moduleId: '',
      step: 1,
      testType: '',
      
      displayScore: '--',
      displayUnit: '',
      testName: '',
      metrics: []
    };
  },
  onLoad(options) {
    console.log('[Result Page] Loaded with options:', options);
    const sysInfo = uni.getSystemInfoSync();
    this.statusBarHeight = sysInfo.statusBarHeight || 20;

    this.moduleId = options.moduleId || '01';
    this.step = parseInt(options.step) || 1;
    this.testType = options.testType || 'Unknown';

    this.loadResultData();
  },
  methods: {
    loadResultData() {
      const key = `module_${this.moduleId}_step_${this.step}_data`;
      console.log('[Result Page] Loading data from key:', key);
      const data = uni.getStorageSync(key);

      if (!data) {
        console.warn('[Result Page] No data found for key:', key);
        this.displayScore = 'N/A';
        return;
      }

      console.log('[Result Page] Data loaded:', data);
      
      // Determine display logic based on testType
      switch (this.testType) {
        case 'PVT':
          this.testName = '视动反应';
          this.displayScore = Math.round(data.metrics.avgTime || 0);
          this.displayUnit = 'ms';
          this.metrics = [
            { label: '最快反应', value: (data.metrics.minTime || 0) + ' ms' },
            { label: '最慢反应', value: (data.metrics.maxTime || 0) + ' ms' },
            { label: '超时次数', value: (data.metrics.lapses || 0) + ' 次' }
          ];
          break;

        case 'Stroop':
          this.testName = '认知干扰';
          if (data.metrics.interference !== undefined) {
             // Emotional Stroop usually
             this.displayScore = Math.round(data.metrics.interference);
             this.displayUnit = 'ms';
             this.metrics = [
               { label: '平均反应', value: Math.round(data.metrics.avgTime || 0) + ' ms' },
               { label: '错误数', value: (data.metrics.errors || 0) + ' 次' }
             ];
          } else {
             // Standard Stroop
             this.displayScore = Math.round(data.metrics.accuracy || 0) + '%';
             this.displayUnit = '准确率';
             this.metrics = [
               { label: '平均反应', value: Math.round(data.metrics.avgTime || 0) + ' ms' },
               { label: '正确数', value: (data.metrics.score || 0) + ' 个' }
             ];
          }
          break;

        case 'SART':
          this.testName = '持续注意力';
          // SART usually focuses on Errors (Commission)
          const totalErrors = (data.metrics.falseAlarms || 0) + (data.metrics.omissions || 0);
          this.displayScore = totalErrors;
          this.displayUnit = '次错误';
          this.metrics = [
            { label: '误按 (冲动)', value: (data.metrics.falseAlarms || 0) + ' 次' },
            { label: '漏按 (走神)', value: (data.metrics.omissions || 0) + ' 次' },
            { label: '平均反应', value: Math.round(data.metrics.avgTime || 0) + ' ms' }
          ];
          break;

        case 'NBack':
          this.testName = '工作记忆';
          this.displayScore = Math.round((data.metrics.accuracy || 0) * 100);
          this.displayUnit = '% 准确率';
          this.metrics = [
            { label: '正确识别', value: (data.metrics.hits || 0) + ' 次' },
            { label: '错误识别', value: (data.metrics.falseAlarms || 0) + ' 次' },
             { label: '平均反应', value: Math.round(data.metrics.avgTime || 0) + ' ms' }
          ];
          break;
          
        case 'Schulte':
          this.testName = '舒尔特方格';
          this.displayScore = Math.round(data.metrics.totalTime || 0);
          this.displayUnit = '秒';
          this.metrics = [
             { label: '平均点击', value: ((data.metrics.totalTime / 25) || 0).toFixed(2) + ' s' }
          ];
          break;

        default:
          this.testName = this.testType;
          this.displayScore = '完成';
          this.displayUnit = '';
      }
    },

    goBack() {
      console.log('[Result Page] Navigating back to briefing');
      uni.navigateBack();
    },

    retest() {
      console.log('[Result Page] Retest requested for:', this.testType);
      // Map testType to page URL
      let url = '';
      switch (this.testType) {
        case 'PVT': url = '/pages/neural-link/PVT'; break;
        case 'Stroop': url = '/pages/neural-link/Stroop'; break;
        case 'SART': url = '/pages/neural-link/sart'; break;
        case 'NBack': url = '/pages/neural-link/nback'; break;
        case 'Schulte': url = '/pages/neural-link/grid'; break;
      }
      
      if (url) {
        // Redirect back to test, keeping same module/step
        // Note: Using redirectTo to replace result page
        url += `?moduleId=${this.moduleId}&step=${this.step}`;
        if (this.testType === 'Stroop' && this.testName.includes('情绪')) {
             url += '&mode=emotional';
        }
        uni.redirectTo({ url });
      }
    }
  }
};
</script>

<style>
page {
  background-color: #0F172A;
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Custom Navigation */
.custom-nav {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(10px);
  z-index: 100;
  display: flex;
  align-items: center;
  padding-left: 32rpx;
  box-sizing: border-box;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-back {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  margin-right: 20rpx;
}

.back-arrow {
  font-size: 32rpx;
  color: #fff;
}

.nav-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #fff;
}

/* Content Area */
.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx;
}

/* Score Card */
.score-card {
  margin-top: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 60rpx;
}

.score-circle {
  width: 300rpx;
  height: 300rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(0, 229, 255, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle, rgba(0, 229, 255, 0.1) 0%, rgba(15, 23, 42, 0) 70%);
  box-shadow: 0 0 40rpx rgba(0, 229, 255, 0.1);
  margin-bottom: 24rpx;
}

.score-value {
  font-size: 80rpx;
  font-weight: bold;
  color: #00E5FF;
  text-shadow: 0 0 20rpx rgba(0, 229, 255, 0.5);
}

.score-unit {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 8rpx;
}

.score-label {
  font-size: 32rpx;
  color: #fff;
  opacity: 0.9;
}

/* Metrics Grid */
.metrics-grid {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 2 columns */
  gap: 24rpx;
  margin-bottom: 60rpx;
}

.metric-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.metric-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 8rpx;
}

.metric-value {
  font-size: 32rpx;
  color: #fff;
  font-weight: 500;
}

/* Actions */
.actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.btn-primary {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(90deg, #00E5FF 0%, #00B0FF 100%);
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000;
  font-size: 32rpx;
  font-weight: 600;
  box-shadow: 0 8rpx 24rpx rgba(0, 229, 255, 0.25);
  border: none;
}

.btn-secondary {
  width: 100%;
  height: 96rpx;
  background: transparent;
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00E5FF;
  font-size: 30rpx;
  border: 2rpx solid rgba(0, 229, 255, 0.3);
}

.btn-hover {
  opacity: 0.9;
  transform: scale(0.98);
}

.btn-icon {
  margin-left: 12rpx;
  font-weight: bold;
}

.btn-icon-small {
  margin-left: 12rpx;
  font-size: 32rpx;
}
</style>