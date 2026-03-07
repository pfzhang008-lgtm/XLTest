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
        gamepad: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22%2325f4f4%22%3E%3Cpath d%3D%22M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4-3c-.83 0-1.5-.67-1.5-1.5S18.67 9 19.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z%22%2F%3E%3C%2Fsvg%3E',



        psychology: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22%239d00ff%22%3E%3Cpath d%3D%22M18.85 10.39c.31-.77.12-1.66-.46-2.23-.58-.57-1.46-.76-2.23-.46-1.54.6-2.61 2.08-2.61 3.8h-2c0-2.8 1.76-5.22 4.28-6.19 1.18-.46 2.49-.24 3.49.56 1 .81 1.57 2.01 1.55 3.28-.02 1.27-.64 2.43-1.66 3.12-.99.67-1.6 1.77-1.6 2.93h-2c0-1.78.96-3.41 2.5-4.42.36-.23.64-.53.74-.83zM13 18h-2v2h2v-2zm-1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM6 12c0 1.23.36 2.38.98 3.36l1.7-1.7c-.43-.49-.68-1.12-.68-1.81 0-1.51 1.23-2.73 2.74-2.73.54 0 1.05.16 1.48.44l1.62-1.62C13.06 7.37 12.06 7 11 7c-2.76 0-5 2.24-5 5z%22%2F%3E%3C%2Fsvg%3E',
        sensors: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22%2310b981%22%3E%3Cpath d%3D%22M11 22v-6h2v6h-2zm-4-3v-3h2v3H7zm8 0v-3h2v3h-2zm-8-5v-3h2v3H7zm8 0v-3h2v3h-2zM6 9c0-3.31 2.69-6 6-6s6 2.69 6 6v3h-2V9c0-2.21-1.79-4-4-4s-4 1.79-4 4v3H6V9z%22%2F%3E%3C%2Fsvg%3E',
        vital: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22none%22 stroke%3D%22%23f42525%22 stroke-width%3D%222%22 stroke-linecap%3D%22round%22 stroke-linejoin%3D%22round%22%3E%3Cpath d%3D%22M22 12h-4l-3 9L9 3l-3 9H2%22%2F%3E%3C%2Fsvg%3E',
        play: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22%239d00ff%22%3E%3Cpath d%3D%22M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z%22%2F%3E%3C%2Fsvg%3E',
        target: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22%2310b981%22%3E%3Cpath d%3D%22M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-12c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z%22%2F%3E%3C%2Fsvg%3E',
        film: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22%3E%3Cpath fill%3D%22%239d00ff%22 d%3D%22M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-2z%22%2F%3E%3Cpath fill%3D%22%23ffffff%22 d%3D%22M9.5 10v5l4-2.5z%22%2F%3E%3C%2Fsvg%3E',
        scope: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22%2310b981%22%3E%3Cpath d%3D%22M20.94 11c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z M12 10a2 2 0 1 0 0 4 2 2 0 1 0 0-4z%22%2F%3E%3C%2Fsvg%3E',
        power: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22%23f42525%22%3E%3Cpath d%3D%22M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4zm-1.67 16h-4v-14h4v14z%22%2F%3E%3Cpath d%3D%22M10 14h4v6h-4z%22 opacity%3D%220.3%22%2F%3E%3C%2Fsvg%3E'
      },
      // 5大痛点板块（家长视角：医疗警告风 + 直击痛点）
      modules: [
        {
          id: '01',
          title: '沉迷游戏 · 手机成瘾',
          desc: '一没收手机就暴躁？深度评估行为成瘾与前额叶失控程度。',
          tags: ['情绪失控', '多巴胺劫持', '现实逃避'],
          status: 'READY',
          color: '#e2e8f0',
          accentColor: '#25f4f4', // 赛博青（代表电子屏幕）
          borderColor: 'rgba(37, 244, 244, 0.3)',
          shadowColor: 'rgba(37, 244, 244, 0.1)',
          dimBg: 'rgba(37, 244, 244, 0.05)',
          footerBg: 'rgba(15, 23, 42, 0.5)',
          image: '' // 在 created 中分配图标
        },
        {
          id: '02',
          title: '沉迷刷手机 · 脑雾',
          desc: '看书五分钟就犯困？检测高频刺激导致的大脑内存枯竭。',
          tags: ['过目即忘', '缺乏耐心', '思维碎片化'],
          status: 'READY',
          color: '#e2e8f0',
          accentColor: '#9d00ff', // 荧光紫（代表算法诱惑）
          borderColor: 'rgba(157, 0, 255, 0.3)',
          shadowColor: 'rgba(157, 0, 255, 0.1)',
          dimBg: 'rgba(157, 0, 255, 0.05)',
          footerBg: 'rgba(15, 23, 42, 0.5)',
          image: ''
        },
        {
          id: '03',
          title: '严重分心 · 疑似多动',
          desc: '写作业磨蹭、极其容易走神？排查认知物理硬件与执行功能。',
          tags: ['注意力涣散', '坐不住', '跳行漏字'],
          status: 'READY',
          color: '#e2e8f0',
          accentColor: '#10b981', // 医疗绿（代表临床诊断）
          borderColor: 'rgba(16, 185, 129, 0.3)',
          shadowColor: 'rgba(16, 185, 129, 0.1)',
          dimBg: 'rgba(16, 185, 129, 0.05)',
          footerBg: 'rgba(15, 23, 42, 0.5)',
          image: ''
        },
        {
          id: '04',
          title: '考前焦虑 · 发挥失常',
          desc: '一到大考就紧张空白？探测潜意识阻滞与高压下的脑力冻结。',
          tags: ['大脑空白', '躯体化发烧', '过度紧张'],
          status: 'READY',
          color: '#e2e8f0',
          accentColor: '#f59e0b', // 警示黄（代表高压与焦虑）
          borderColor: 'rgba(245, 158, 11, 0.3)',
          shadowColor: 'rgba(245, 158, 11, 0.1)',
          dimBg: 'rgba(245, 158, 11, 0.05)',
          footerBg: 'rgba(15, 23, 42, 0.5)',
          image: ''
        },
        {
          id: '05',
          title: '严重厌学 · 动力丧失',
          desc: '彻底摆烂、极其抗拒去学校？挖掘潜意识中的校园与心理创伤。',
          tags: ['抗拒上学', '彻底躺平', '亲子对立'],
          status: 'READY',
          color: '#e2e8f0',
          accentColor: '#f42525', // 危险红（代表干预刻不容缓）
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
    this.modules[0].image = this.icons.gamepad;
    this.modules[1].image = this.icons.film;
    this.modules[2].image = this.icons.scope;
    this.modules[3].image = this.icons.vital;
    this.modules[4].image = this.icons.power;
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
      
      let targetUrl = '';
      
      // Unified routing for config-driven modules
      const unifiedModules = ['01', '02', '03', '04', '05'];
      
      if (unifiedModules.includes(item.id)) {
        targetUrl = `/pages/assessment/briefing?moduleId=${item.id}`;
      } else {
        console.warn(`[Interaction] Module ID ${item.id} not linked to a page.`);
        uni.showToast({ title: 'Module Locked / Dev', icon: 'none' });
        return;
      }

      // Check Calibration - REQUIRED for all modules now
      if (!this.isCalibrated) {
        console.log('[System] User not calibrated, redirecting to calibration.');
        uni.setStorageSync('calibration_redirect', targetUrl);
        uni.hideLoading(); 
        uni.navigateTo({
          url: '/pages/onboarding/calibration',
          fail: (err) => {
            console.error('[Navigation] Failed to navigate to calibration:', err);
            uni.showToast({ title: '跳转失败: 基础档案页', icon: 'none' });
          }
        });
        return;
      }

      // Direct navigation
      console.log(`[Navigation] Direct navigation to: ${targetUrl}`);
      uni.navigateTo({
        url: targetUrl,
        fail: (err) => {
          console.error('[Navigation] Failed:', err);
          uni.showToast({
            title: '跳转失败: ' + (err.errMsg || '未知错误'),
            icon: 'none'
          });
        }
      });
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
  padding: calc(var(--status-bar-height) + 140rpx) 30rpx 40rpx 30rpx;
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
  z-index: 60; /* Ensure clickability over scanlines */
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
