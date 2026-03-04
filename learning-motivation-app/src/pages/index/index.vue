<template>
  <view class="page-container">
    <!-- Scanline Overlay Effect -->
    <view class="scanlines"></view>
    
    <!-- Main Content -->
    <scroll-view scroll-y="true" class="main-content">
      <view class="cards-container">
        <view 
          v-for="(item, index) in modules" 
          :key="index"
          class="cyber-card"
          :style="{ '--card-color': item.color, '--border-color': item.borderColor, '--card-shadow': item.shadowColor }"
          @click="handleModuleClick(item)"
        >
          <view class="card-content">
            <!-- Left Content -->
            <view class="card-left">
              <view class="card-tag-row">
                <view class="mod-tag" :style="{ borderColor: item.borderColor, color: item.color, backgroundColor: item.dimBg }">
                  <text>MOD_{{ item.id }}</text>
                </view>
                <view class="mod-dot" :style="{ backgroundColor: item.accentColor, boxShadow: '0 0 5px ' + item.accentColor }"></view>
              </view>
              <text class="card-title">{{ item.title }}</text>
              <text class="card-desc">{{ item.desc }}</text>
              <view class="tags-row">
                <view 
                  v-for="(tag, tIndex) in item.tags" 
                  :key="tIndex" 
                  class="feature-tag"
                >
                  <text>{{ tag }}</text>
                </view>
              </view>
            </view>
            
            <!-- Right Icon -->
            <view class="card-right">
              <image 
                class="card-icon blend-screen" 
                :src="item.image" 
                mode="aspectFit"
                :style="{ filter: 'drop-shadow(0 0 2px ' + item.accentColor + ')' }"
              ></image>
            </view>
          </view>
          
          <!-- Footer Status -->
          <view class="card-footer" :style="{ borderColor: item.borderColor, backgroundColor: item.footerBg }">
            <text class="footer-status" style="color: #e2e8f0">STATUS: {{ item.status }}</text>
            <view class="icon-arrow" :style="{ color: item.color }"></view>
          </view>
        </view>
      </view>
      <!-- Spacer for TabBar -->
      <view style="height: 120rpx;"></view>
      
      <!-- Debug Info -->
      <view style="padding: 20rpx; text-align: center;">
        <text style="color: #64748b; font-size: 24rpx; display: block; margin-bottom: 10rpx;">
          SYSTEM STATUS: {{ isCalibrated ? 'CALIBRATED' : 'UNCALIBRATED' }}
        </text>
        <button size="mini" type="warn" @click="clearCalibration">RESET CALIBRATION</button>
      </view>
    </scroll-view>

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
      isCalibrated: false,
      // Icons (SVG Data URIs)
      icons: {
        bolt: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22%2325f4f4%22%3E%3Cpath d%3D%22M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.07-.12C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15C12.96 17.55 11 21 11 21z%22%2F%3E%3C%2Fsvg%3E',
        psychology: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22%239d00ff%22%3E%3Cpath d%3D%22M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z%22%2F%3E%3C%2Fsvg%3E',
        sensors: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22%2310b981%22%3E%3Cpath d%3D%22M11 22v-6h2v6h-2zm-4-3v-3h2v3H7zm8 0v-3h2v3h-2zm-8-5v-3h2v3H7zm8 0v-3h2v3h-2zM6 9c0-3.31 2.69-6 6-6s6 2.69 6 6v3h-2V9c0-2.21-1.79-4-4-4s-4 1.79-4 4v3H6V9z%22%2F%3E%3C%2Fsvg%3E',
        vital: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22%23f42525%22%3E%3Cpath d%3D%22M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5.71 13.29a.996.996 0 0 1-1.41 0L10 14.41l-1.88 1.88a.996.996 0 1 1-1.41-1.41l2.59-2.59c.39-.39 1.02-.39 1.41 0l1.88 1.88 1.88-1.88c.39-.39 1.02-.39 1.41 0 .39.39.39 1.02 0 1.41l-2.59 2.59z%22%2F%3E%3C%2Fsvg%3E',
        play: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22%239d00ff%22%3E%3Cpath d%3D%22M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z%22%2F%3E%3C%2Fsvg%3E',
        target: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22%2310b981%22%3E%3Cpath d%3D%22M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-12c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z%22%2F%3E%3C%2Fsvg%3E',
        film: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22%3E%3Cpath fill%3D%22%239d00ff%22 d%3D%22M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-2z%22%2F%3E%3Cpath fill%3D%22%23ffffff%22 d%3D%22M9.5 10v5l4-2.5z%22%2F%3E%3C%2Fsvg%3E',
        scope: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22%2310b981%22%3E%3Cpath d%3D%22M20.94 11c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z M12 10a2 2 0 1 0 0 4 2 2 0 1 0 0-4z%22%2F%3E%3C%2Fsvg%3E'
      },
      modules: [
        {
          id: '01',
          title: '电竞天赋·脑速评估',
          desc: '测测你的大脑延迟 (Ping) 是多少？',
          tags: ['反应迟钝', '操作变形', '易怒冲动'],
          status: 'READY',
          // Color Palette from code.html
          color: '#e2e8f0', // Slate-200
          accentColor: '#25f4f4', // Cyan
          borderColor: 'rgba(37, 244, 244, 0.3)',
          shadowColor: 'rgba(37, 244, 244, 0.1)',
          dimBg: 'rgba(37, 244, 244, 0.05)',
          footerBg: 'rgba(15, 23, 42, 0.5)',
          image: '' // Set in created
        },
        {
          id: '02',
          title: '短视频·脑雾检测',
          desc: '你的大脑被算法 “养废” 了吗？',
          tags: ['过目即忘', '思维碎片化', '无法深读'],
          status: 'READY',
          color: '#e2e8f0',
          accentColor: '#9d00ff', // Purple
          borderColor: 'rgba(157, 0, 255, 0.3)',
          shadowColor: 'rgba(157, 0, 255, 0.1)',
          dimBg: 'rgba(157, 0, 255, 0.05)',
          footerBg: 'rgba(15, 23, 42, 0.5)',
          image: ''
        },
        {
          id: '03',
          title: '学业专注力诊断',
          desc: '为什么听课总走神，写作业坐不住？',
          tags: ['注意力涣散', '多动坐不住', '粗心马虎'],
          status: 'READY',
          color: '#e2e8f0',
          accentColor: '#10b981', // Emerald
          borderColor: 'rgba(16, 185, 129, 0.3)',
          shadowColor: 'rgba(16, 185, 129, 0.1)',
          dimBg: 'rgba(16, 185, 129, 0.05)',
          footerBg: 'rgba(15, 23, 42, 0.5)',
          image: ''
        },
        {
          id: '04',
          title: '学习心态',
          desc: '别让坏情绪，吞噬了你的天赋。',
          tags: ['考前失眠', '抵触上学', '亲子冲突'],
          status: 'WAITING',
          color: '#e2e8f0',
          accentColor: '#f42525', // Neon Red (Primary)
          borderColor: 'rgba(244, 37, 37, 0.3)',
          shadowColor: 'rgba(244, 37, 37, 0.1)',
          dimBg: 'rgba(244, 37, 37, 0.05)',
          footerBg: 'rgba(15, 23, 42, 0.5)',
          image: ''
        }
      ]
    }
  },
  created() {
    this.modules[0].image = this.icons.bolt;
    this.modules[1].image = this.icons.film;
    this.modules[2].image = this.icons.scope;
    this.modules[3].image = this.icons.vital;
  },
  onShow() {
    uni.hideTabBar();
    // Refresh calibration status on every show
    const status = uni.getStorageSync('is_calibrated');
    this.isCalibrated = !!status; // Convert to boolean
    console.log('[System] Index onShow - Calibration Status:', this.isCalibrated);
  },
  onShareAppMessage() {
    return {
      title: 'Neuro Sync Dashboard',
      path: '/pages/index/index'
    };
  },
  methods: {
    handleModuleClick(item) {
      console.log(`[Interaction] Module Clicked: ${item.title} (ID: ${item.id})`);
      
      // Use reactive property
      const isCalibrated = this.isCalibrated;
      console.log('[System] Calibration Status (Data):', isCalibrated);

      let targetUrl = '';
      if (item.id === '01') {
        targetUrl = '/pages/phone-addiction/index';
      } else if (item.id === '02') {
        targetUrl = '/pages/video_fog/index';
      } else if (item.id === '03') {
        targetUrl = '/pages/academic_focus/index';
      } else if (item.id === '04') {
        targetUrl = '/pages/study_mindset/index';
      } else {
        uni.showToast({ title: 'Module Locked', icon: 'none' });
        return;
      }

      if (!isCalibrated) {
        console.log('[System] User not calibrated, redirecting to calibration.');
        uni.setStorageSync('calibration_redirect', targetUrl);
        uni.hideLoading(); // Hide loading before navigating
        uni.navigateTo({
          url: '/pages/onboarding/calibration',
          fail: (err) => {
            console.error('[Navigation] Failed to navigate to calibration:', err);
            uni.showModal({
              title: 'Navigation Error',
              content: 'Failed to open calibration page: ' + JSON.stringify(err) + '\nPath: /pages/onboarding/calibration',
              showCancel: false
            });
          }
        });
        return;
      }
      
      uni.hideLoading();
      uni.navigateTo({ url: targetUrl });
    },
    clearCalibration() {
      try {
        uni.removeStorageSync('is_calibrated');
        this.isCalibrated = false;
        uni.showToast({ title: 'Status Cleared', icon: 'success' });
      } catch (e) {
        console.error(e);
      }
    }
  }
}
</script>

<style>
/* Page & Layout */
.page-container {
  background-color: #0F172A; /* Background Dark */
  min-height: 100vh;
  font-family: 'Noto Sans SC', sans-serif;
  color: #e2e8f0;
  position: relative;
  /* Grid Background */
  background-image: 
    linear-gradient(rgba(30, 41, 59, 0.5) 1px, transparent 1px),
    linear-gradient(90deg, rgba(30, 41, 59, 0.5) 1px, transparent 1px);
  background-size: 20px 20px;
}

/* Scanlines */
.scanlines {
  background: linear-gradient(
    to bottom,
    rgba(255,255,255,0),
    rgba(255,255,255,0) 50%,
    rgba(0,0,0,0.1) 50%,
    rgba(0,0,0,0.1)
  );
  background-size: 100% 3px;
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  pointer-events: none;
  z-index: 50;
}

/* Main Content */
.main-content {
  height: 100vh;
}

.cards-container {
  /* Push content down further */
  padding: calc(var(--status-bar-height) + 80rpx) 30rpx 40rpx 30rpx;
}

/* Cyber Card */
.cyber-card {
  margin-bottom: 30rpx;
  background: rgba(10, 15, 25, 0.95);
  border: 1px solid var(--border-color);
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 0 15rpx var(--card-shadow);
  transition: all 0.3s ease;
  position: relative;
}

.cyber-card:active {
  transform: scale(0.98);
  box-shadow: 0 0 5rpx var(--card-shadow);
}

.card-content {
  padding: 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}

.card-left {
  flex: 1;
  padding-right: 10rpx;
  min-width: 0;
}

.card-tag-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 10rpx;
}

.mod-tag {
  font-family: 'JetBrains Mono', 'Courier New', Courier, monospace;
  font-size: 22rpx;
  font-weight: bold;
  padding: 4rpx 10rpx;
  border: 1px solid;
  border-radius: 8rpx;
  /* background-opacity removed as it is invalid CSS, handled by rgba color */
}

.mod-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  margin-left: 8rpx; /* Add some spacing if needed, but flex gap handles it */
}

.card-title {
  display: block;
  font-size: 38rpx;
  font-weight: bold;
  margin-bottom: 8rpx;
  color: #fff;
  text-shadow: 0 0 10rpx rgba(255, 255, 255, 0.3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-desc {
  display: block;
  font-size: 26rpx;
  font-family: 'JetBrains Mono', 'Courier New', Courier, monospace;
  color: #9ca3af;
  margin-bottom: 16rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tags-row {
  display: flex;
  flex-wrap: nowrap;
  gap: 12rpx;
  overflow: hidden;
}

.feature-tag {
  padding: 6rpx 12rpx;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8rpx;
  background: rgba(255, 255, 255, 0.05);
  flex-shrink: 0;
}

.feature-tag text {
  font-size: 22rpx;
  color: #9ca3af;
  letter-spacing: 0.5px;
}

.card-right {
  width: 160rpx;
  height: 160rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  margin-left: 10rpx;
}

.card-icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 0.9; /* Slight transparency to reduce glare */
}

.blend-screen {
  mix-blend-mode: screen;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 30rpx;
  border-top: 1px solid;
}

.footer-status {
  font-family: 'JetBrains Mono', 'Courier New', Courier, monospace;
  font-size: 22rpx;
  letter-spacing: 0.05em;
  color: #e2e8f0; /* Ensure default color is off-white */
}

.icon-arrow {
  width: 16rpx;
  height: 16rpx;
  border-right: 2px solid currentColor;
  border-top: 2px solid currentColor;
  transform: rotate(45deg);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
