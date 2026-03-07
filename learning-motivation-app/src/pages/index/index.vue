<template>
  <view class="page-container">
    <view class="scanlines"></view>
    
    <!-- Clinical Monitor Header (Fixed) -->
    <view class="cyber-header" :style="{ paddingTop: (statusBarHeight || 20) + 'px' }">
      <view class="header-content">
        <text class="sys-title">NEURO-SYNC</text>
        <view class="sys-status">
          <view class="status-dot pulse"></view>
          <text class="status-text">SYSTEM ONLINE</text>
        </view>
      </view>
    </view>

    <!-- Main Content -->
    <scroll-view scroll-y="true" class="main-content">
      <!-- Header Section (Page Title) -->
      <view class="header-section">
        <view class="header-icon-box">
          <image class="header-icon" :src="icons.brain" mode="aspectFit"></image>
        </view>
        <view class="header-text-box">
          <text class="header-title">Neuro Sync</text>
          <text class="header-subtitle">青少年神经动力学评估系统</text>
        </view>
      </view>

      <view class="cards-container">
        <view 
          v-for="(item, index) in modules" 
          :key="index"
          class="assessment-card"
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
                  :style="{ 
                    borderColor: item.borderColor, 
                    backgroundColor: item.dimBg, 
                  }"
                >
                  <text :style="{ color: item.accentColor }">{{ tag }}</text>
                </view>
              </view>
            </view>
            
            <!-- Right Icon -->
            <view class="card-right">
              <image 
                class="card-icon blend-screen" 
                :src="item.image" 
                mode="aspectFit"
                :style="{ filter: 'drop-shadow(0 0 12px ' + item.accentColor + ')' }"
              ></image>
              <text class="action-hint" :style="{ color: item.accentColor }">   </text>
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
      statusBarHeight: 0,
      isCalibrated: false,
      // Icons (SVG Data URIs - Base64 Encoded for WeChat Compatibility)
      icons: {
        // Header Icon
        brain: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzY0NzQ4YiI+PHBhdGggZD0iTTEyIDJDNy41OCAyIDQgNC4yNCA0IDcuNUg0QzMuMjIgNy41IDMuNSA3LjU2IDMuNyA3LjY0QzIuNjkgOC4zMyAyIDEwLjAzIDIgMTJDMiAxMy45NyAyLjY5IDE1LjY3IDMuNyAxNi4zNkMzLjUgMTYuNDQgMy4yMiAxNi41IDQgMTYuNUg0QzQgMTkuNzYgNy41OCAyMiAxMiAyMkMxNi40MiAyMiAyMCAxOS43NiAyMCAxNi41SDIwQzIwLjc4IDE2LjUgMjAuNSAxNi40NCAyMC4zIDE2LjM2QzIxLjMxIDE1LjY3IDIyIDEzLjk3IDIyIDEyQzIyIDEwLjAzIDIxLjMxIDguMzMgMjAuMyA3LjY0QzIwLjUgNy41NiAyMC43OCA3LjUgMjAgNy41SDIwQzIwIDQuMjQgMTYuNDIgMiAxMiAyWk0xMy41IDUuMTNDMTUuNzMgNS40IDE3LjUgNy4yNSAxNy45MyA5LjU1QzE3Ljk2IDkuNzcgMTguMTMgOS45NCAxOC4zNCA5Ljk4QzE5LjE4IDEwLjEzIDE5LjcxIDEwLjg0IDE5LjcxIDExLjc1QzE5LjcxIDEyLjY2IDE5LjE4IDEzLjM3IDE4LjM0IDEzLjUyQzE4LjEzIDEzLjU2IDE3Ljk2IDEzLjk1IDE3LjkzIDEzLjk1QzE3LjUgMTYuMjUgMTUuNzMgMTguMSAxMy41IDE4LjM3VjUuMTNaTTYuMDcgOS41NUM2LjUgNy4yNSA4LjI3IDUuNCAxMC41IDUuMTNWMTguMzdDOC4yNyAxOC4xIDYuNSAxNi4yNSA2LjA3IDEzLjk1QzYuMDQgMTMuNzMgNS44NyAxMy41NiA1LjY2IDEzLjUyQzQuODIgMTMuMzcgNC4yOSAxMi42NiA0LjI5IDExLjc1QzQuMjkgMTAuODQgNC44MiAxMC4xMyA1LjY2IDkuOThDNS44NyA5Ljk0IDYuMDQgOS43NyA2LjA3IDkuNTVaIi8+PC9zdmc+',
        
        // Module Icons
        bolt: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzI1ZjRmNCI+PHBhdGggZD0iTTExIDIxaC0xbDEtN0g3LjVjLS41OCAwLS41Ny0uMzItLjM4LS42Ni4xOS0uMzQuMDUtLjA4LjA3LS4xMkM4LjQ4IDEwLjk0IDEwLjQyIDcuNTQgMTMgM2gxcy0xIDdoMy41Yy40OSAwIC41Ni4zMy40Ny41MWwtLjA3LjE1QzEyLjk2IDE3LjU1IDExIDIxIDExIDIxeiIvPjwvc3ZnPg==',
        
        gamepad: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzI1ZjRmNCI+PHBhdGggZD0iTTIxIDZIM2MtMS4xIDAtMiAuOS0yIDJ2OGMwIDEuMS45IDIgMiAyaDE4YzEuMSAwIDItLjkgMi0yVjhjMC0xLjEtLjktMi0yLTJ6bS0xMCA3SDh2M0g2di0zSDN2LTJoM1Y4aDJ2M2gzdjJ6bTQuNSAyYy0uODMgMC0xLjUtLjY3LTEuNS0xLjVzLjY3LTEuNSAxLjUtMS41IDEuNS42NyAxLjUgMS41LS42NyAxLjUtMS41IDEuNXptNC0zYy0uODMgMC0xLjUtLjY3LTEuNS0xLjVTMTguNjcgOSAxOS41IDlzMS41LjY3IDEuNSAxLjUtLjY3IDEuNS0xLjUgMS41eiIvPjwvc3ZnPg==',

        smartphone: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzlkMDBmZiI+PHBhdGggZD0iTTE3IDEuMDFMNCAxYy0xLjEgMC0yIC45LTIgMnYxOGMwIDEuMS45IDIgMiAyaDEzYzEuMSAwIDItLjkgMi0yVjNjMC0xLjEtLjktMS45OS0yLTEuOTl6TTE3IDE5SDVWNWgxMnYxNHoiLz48L3N2Zz4=',

        psychology: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzlkMDBmZiI+PHBhdGggZD0iTTE4Ljg1IDEwLjM5Yy4zMS0uNzcuMTItMS42Ni0uNDYtMi4yMy0uNTgtLjU3LTEuNDYtLjc2LTIuMjMtLjQ2LTEuNTQuNi0yLjYxIDIuMDgtMi42MSAzLjhoLTJjMC0yLjggMS43Ni01LjIyIDQuMjgtNi4xOSAxLjE4LS40NiAyLjQ5LS4yNCAzLjQ5LjU2IDEgLjgxIDEuNTcgMi4wMSAxLjU1IDMuMjgtLjAyIDEuMjctLjY0IDIuNDMtMS42NiAzLjEyLS45OS42Ny0xLjYgMS43Ny0xLjYgMi45M2gtMmMwLTEuNzguOTYtMy40MSAyLjUtNC40Mi4zNi0uMjMuNjQtLjUzLjc0LS44M3pNMTMgMThoLTJ2Mmgydi0yem0tMS0xNkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnptMCAxOGMtNC40MSAwLTgtMy41OS04LThzMy41OS04IDgtOCA4IDMuNTkgOCA4LTMuNTkgOC04IDh6TTYgMTJjMCAxLjIzLjM2IDIuMzguOTggMy4zNmwxLjctMS43Yy0uNDMtLjQ5LS42OC0xLjEyLS42OC0xLjgxIDAtMS41MSAxLjIzLTIuNzMgMi43NC0yLjczLjU0IDAgMS4wNS4xNiAxLjQ4LjQ0bDEuNjItMS42MkMxMy4wNiA3LjM3IDEyLjA2IDcgMTEgN2MtMi43NiAwLTUgMi4yNC01IDV6Ii8+PC9zdmc+',
        
        sensors: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzEwYjk4MSI+PHBhdGggZD0iTTExIDIydi02aDJ2NmgtMnptLTQtM3YtM2gydjNIN3ptOCAwdi0zaDJ2M2gtMnptLTgtNXYtM2gydjNIN3ptOCAwdi0zaDJ2M2gtMnpNNiA5YzAtMy4zMSAyLjY5LTYgNi02czYgMi42OSA2IDZ2M2gtMlY5YzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0djNINlY5eiIvPjwvc3ZnPg==',
        
        vital: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZjQyNTI1IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTIyIDEyaC00bC0zIDlMOSAzbC0zIDlIMiIvPjwvc3ZnPg==',
        
        play: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzlkMDBmZiI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bS0yIDE0LjV2LTlsNiA0LjUtNiA0LjV6Ii8+PC9zdmc+',
        
        target: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzEwYjk4MSI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgMThjLTQuNDEgMC04LTMuNTktOC04czMuNTktOCA4LTggOCAzLjU5IDggOC0zLjU5IDgtOCA4em0wLTEyYy0yLjIxIDAtNCAxLjc5LTQgNHMxLjc5IDQgNCA0IDQtMS43OSA0LTQtMS43OS00LTQtNHoiLz48L3N2Zz4=',
        
        film: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iIzlkMDBmZiIgZD0iTTE4IDRsMiA0aC0zbC0yLTRoLTJsMiA0aC0zbC0yLTRIOGwyIDRIN0w1IDRINGMtMS4xIDAtMS45OS45LTEuOTkgMkwyIDE4YzAgMS4xLjkgMiAyIDJoMTZjMS4xIDAgMi0uOSAyLTJWNmMwLTEuMS0uOS0yLTItMmgtMnoiLz48cGF0aCBmaWxsPSIjZmZmZmZmIiBkPSJNOS41IDEwdjVsNC0yLjV6Ii8+PC9zdmc+',
        
        scope: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzEwYjk4MSI+PHBhdGggZD0iTTIwLjk0IDExYy0uNDYtNC4xNy0zLjc3LTcuNDgtNy45NC03Ljk0VjFoLTJ2Mi4wNkM2LjgzIDMuNTIgMy41MiA2LjgzIDMuMDYgMTFIMXYyaDIuMDZjLjQ2IDQuMTcgMy43NyA3LjQ4IDcuOTQgNy45NFYyM2gydi0yLjA2YzQuMTctLjQ2IDcuNDgtMy43NyA3Ljk0LTcuOTRIMjN2LTJoLTIuMDZ6TTEyIDE5Yy0zLjg3IDAtNy0zLjEzLTctN3MzLjEzLTcgNy03IDcgMy4xMyA3IDctMy4xMyA3LTcgN3ogTTEyIDEwYTIgMiAwIDEgMCAwIDQgMiAyIDAgMSAwIDAtNHoiLz48L3N2Zz4=',
        
        // Low Battery (Red)
        power: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2Y0MjUyNSI+PHBhdGggZD0iTTE3IDUuMzNDMTcgNC42IDE2LjQgNCAxNS42NyA0SDE0VjJoLTR2Mkg4LjMzQzcuNiA0IDcgNC42IDcgNS4zM1YxN2gxMFY1LjMzeiIgZmlsbC1vcGFjaXR5PSIwLjMiLz48cGF0aCBkPSJNNyAxN2gxMHYzLjY3YzAgLjc0LS42IDEuMzMtMS4zMyAxLjMzSDguMzNjLS43NCAwLTEuMzMtLjYtMS4zMy0xLjMzVjE3eiIvPjwvc3ZnPg=='
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
    this.modules[1].image = this.icons.film; // Changed back to film per user request
    this.modules[2].image = this.icons.scope;
    this.modules[3].image = this.icons.vital;
    this.modules[4].image = this.icons.power;
  },
  onLoad() {
    try {
      const sysInfo = uni.getSystemInfoSync();
      this.statusBarHeight = sysInfo.statusBarHeight || 20;
    } catch (e) {
      this.statusBarHeight = 20;
    }
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
            // Clear redirect if navigation fails
            uni.removeStorageSync('calibration_redirect');
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
          // Clear any stale redirects just in case
          uni.removeStorageSync('calibration_redirect');
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
  padding: 20rpx 30rpx 40rpx 30rpx;
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
  width: 120rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  margin-left: 10rpx;
}

.card-icon {
  width: 80rpx;
  height: 80rpx;
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

/* Header Styles */
.header-section {
  padding: calc(var(--status-bar-height) + 100rpx) 30rpx 20rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.header-icon-box {
  width: 80rpx;
  height: 80rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-icon {
  width: 50rpx;
  height: 50rpx;
}

.header-text-box {
  display: flex;
  flex-direction: column;
}

.header-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #fff;
  line-height: 1.2;
}

.header-subtitle {
  font-size: 24rpx;
  color: #94a3b8;
  letter-spacing: 1px;
}

/* --- UI Polish Additions --- */

/* 1. Cyber Header */
.cyber-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(15, 23, 42, 0.85); /* Dark blue glass */
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(37, 244, 244, 0.2);
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.5);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30rpx;
  height: 88rpx; /* Standard nav bar height */
}

.sys-title {
  font-family: 'JetBrains Mono', monospace;
  font-weight: bold;
  font-size: 36rpx;
  color: #25f4f4; /* Cyan */
  letter-spacing: 2px;
  text-shadow: 0 0 10rpx rgba(37, 244, 244, 0.6);
}

.sys-status {
  display: flex;
  align-items: center;
  gap: 12rpx;
  border: 1px solid rgba(37, 244, 244, 0.3);
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  background: rgba(37, 244, 244, 0.05);
}

.status-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background-color: #25f4f4;
  box-shadow: 0 0 8rpx #25f4f4;
}

.status-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 20rpx;
  font-weight: bold;
  color: #25f4f4;
  opacity: 0.9;
  letter-spacing: 1px;
}

/* 2. Action Hint */
.action-hint {
  font-family: 'JetBrains Mono', monospace;
  font-size: 18rpx;
  font-weight: bold;
  opacity: 0.9;
  margin-top: 12rpx;
  letter-spacing: 1px;
  text-shadow: 0 0 5rpx currentColor;
  white-space: nowrap;
}

/* 3. Adjust Header Section padding to account for fixed header */
.header-section {
  /* Push content down to clear fixed header (approx 160rpx total) */
  padding-top: calc(var(--status-bar-height) + 160rpx) !important; 
}
</style>