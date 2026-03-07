<template>
  <view class="container">
    <!-- Navbar (Transparent/Custom) -->
    <view class="custom-nav" :style="{ paddingTop: menuButtonTop + 'px', paddingBottom: navPaddingBottom + 'px' }">
      <view class="nav-back" :style="{ height: menuButtonHeight + 'px', width: menuButtonHeight + 'px' }" @click="goBack">
        <text class="back-arrow">←</text>
      </view>
      <text class="nav-title">评估流程说明</text>
    </view>

    <!-- Briefing Content -->
    <scroll-view 
      scroll-y="true" 
      class="main-content" 
      v-if="briefingConfig" 
      :style="{ paddingTop: contentPaddingTop + 'px' }"
      :scroll-into-view="scrollId"
      scroll-with-animation="true"
    >
      
      <!-- Header Section -->
      <view class="header-section">
        <text class="main-title">{{ briefingConfig.title }}</text>
        <view class="divider"></view>
        <text class="intro-text">{{ briefingConfig.intro }}</text>
      </view>

      <!-- Timeline Section -->
    <view class="timeline-container">
      <view 
        class="timeline-item" 
        v-for="(item, index) in pipeline" 
        :key="index"
        :id="'step-' + item.step"
        :class="{
          'completed': item.step < currentStep,
          'current': item.step === currentStep,
          'locked': item.step > currentStep
        }"
      >
        <view class="timeline-left">
          <view class="timeline-dot" :class="{ 'pulse': item.step === currentStep }">
            <text v-if="item.step < currentStep" class="check-mark">✓</text>
          </view>
          <view class="timeline-line" v-if="index !== pipeline.length - 1"></view>
        </view>
        
        <view class="timeline-content glass-card">
          <view class="item-header">
            <view class="header-left">
              <text class="item-name">{{ item.name }}</text>
              <image v-if="item.step > currentStep" class="lock-icon" :src="icons.lock" mode="aspectFit"></image>
            </view>
            <view class="header-right">
              <text class="item-time">{{ item.time }}</text>
              <!-- Modification Button for Step 1 -->
              <view 
                v-if="item.step === 1 && item.role === 'parent' && currentStep === 2" 
                class="modify-btn"
                @click.stop="modifySurvey"
              >
                <text>重新修改</text>
              </view>
            </view>
          </view>
          
          <text class="item-desc">{{ item.desc }}</text>
          
          <!-- Transition Text for Completed Items -->
          <view v-if="item.step < currentStep && item.transitionText" class="transition-box">
            <text class="transition-text">{{ item.transitionText }}</text>
          </view>
          
          <!-- Status Tags -->
          <view v-if="item.step === currentStep" class="status-tag current">
            <text>待开始</text>
          </view>
          <view v-else-if="item.step < currentStep" class="status-tag completed">
            <text>已完成</text>
          </view>
          <view v-else class="status-tag locked">
            <text>未解锁</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Warning Section -->
    <view class="warning-box" v-if="briefingConfig">
      <image class="warning-icon" :src="icons.alert" mode="aspectFit"></image>
      <text class="warning-text">{{ briefingConfig.warning }}</text>
    </view>

    <!-- Footer Spacer -->
    <view class="footer-spacer"></view>
  </scroll-view>

  <!-- Bottom Action Bar -->
  <view class="action-bar safe-area-bottom">
    <button class="start-btn" hover-class="btn-hover" @click="startAssessment">
      <text>{{ startButtonText }}</text>
      <view class="btn-glow"></view>
    </button>
  </view>
</view>
</template>

<script>
// Import Configs
import mod01Config from '@/data/config_mod01.json';
import mod02Config from '@/data/config_mod02.json';
import mod03Config from '@/data/config_mod03.json';
import mod04Config from '@/data/config_mod04.json';
import mod05Config from '@/data/config_mod05.json';

const configMap = {
  '01': mod01Config,
  '02': mod02Config,
  '03': mod03Config,
  '04': mod04Config,
  '05': mod05Config
};

export default {
  data() {
    return {
      moduleId: '',
      moduleConfig: null,
      currentStep: 1,
      
      scrollId: '',
      
      // UI Layout
      statusBarHeight: 20,
      menuButtonTop: 24,
      menuButtonHeight: 32,
      navPaddingBottom: 8,
      contentPaddingTop: 100,
      
      icons: {
        alert: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22%23f59e0b%22%3E%3Cpath d%3D%22M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z%22%2F%3E%3C%2Fsvg%3E',
        lock: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22%2394a3b8%22%3E%3Cpath d%3D%22M12 2C9.243 2 7 4.243 7 7v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7c0-2.757-2.243-5-5-5zm0 2c1.654 0 3 1.346 3 3v3H9V7c0-1.654 1.346-3 3-3zm0 10c1.103 0 2 .897 2 2s-.897 2-2 2-2-.897-2-2 .897-2 2-2z%22%2F%3E%3C%2Fsvg%3E'
      }
    };
  },
  computed: {
    briefingConfig() {
      return this.moduleConfig?.briefing || null;
    },
    pipeline() {
      return this.moduleConfig?.pipeline || [];
    },
    activeItem() {
      return this.pipeline.find(item => item.step === this.currentStep);
    },
    startButtonText() {
      if (!this.moduleConfig) return '加载中...';
      
      const totalSteps = this.pipeline.length;
      if (this.currentStep > totalSteps) {
        return '生成/查看深度诊断报告';
      }
      
      if (this.currentStep === 1) {
        return '开始家长主诉录入';
      }
      
      if (this.currentStep === 2) {
        return '家长录入完毕，交予受测者开始';
      }
      
      return '进入下一阶段测试';
    }
  },
  onLoad(options) {
    if (options.moduleId) {
      this.moduleId = options.moduleId;
      this.moduleConfig = configMap[this.moduleId];
      
      if (!this.moduleConfig) {
        uni.showToast({ title: '模块配置不存在', icon: 'none' });
        setTimeout(() => uni.navigateBack(), 1500);
        return;
      }
    } else {
        uni.showToast({ title: '参数缺失', icon: 'none' });
        setTimeout(() => uni.navigateBack(), 1500);
        return;
    }
    
    // Dynamic Layout Calculation
    try {
      const systemInfo = uni.getSystemInfoSync();
      const menuButton = uni.getMenuButtonBoundingClientRect();
      
      this.statusBarHeight = systemInfo.statusBarHeight;
      this.menuButtonTop = menuButton.top;
      this.menuButtonHeight = menuButton.height;
      
      // Calculate content padding: Nav bottom + Buffer
      // Nav bottom is (menuButton.top + menuButton.height + navPaddingBottom)
      const navBottom = menuButton.top + menuButton.height + this.navPaddingBottom;
      this.contentPaddingTop = navBottom + 20; // 20px extra buffer
    } catch (e) {
      console.error('Layout calc failed:', e);
    }
  },
  onShow() {
    if (this.moduleId) {
      const key = `module_${this.moduleId}_current_step`;
      console.log(`[Briefing] onShow reading key: ${key}`);
      
      let step = uni.getStorageSync(key);
      console.log(`[Briefing] Read Result -> Value: "${step}", Type: ${typeof step}`);

      // Extended Debugging if step is missing or 1 (unexpected reset)
      if (!step || step == 1) {
         try {
           const info = uni.getStorageInfoSync();
           console.log(`[Briefing] Storage Debug Info: Keys count: ${info.keys.length}, Usage: ${info.currentSize}KB`);
           // Check if key exists in list
           if (info.keys.includes(key)) {
              console.warn(`[Briefing] Key ${key} exists in keys list but returned "${step}"!`);
           } else {
              console.warn(`[Briefing] Key ${key} NOT found in storage keys.`);
           }
         } catch (e) {
           console.error('[Briefing] Failed to get storage info', e);
         }
      }
      
      let newStep = 1;
      if (step) {
        newStep = parseInt(step);
      }
      
      // Update step
      let finalStep = isNaN(newStep) ? 1 : newStep;
      console.log(`[Briefing] Parsed step: ${newStep}, Final step: ${finalStep}`);
      
      // Self-healing: Check if data for current step already exists
      // This handles cases where step counter update failed but data was saved
      const currentStepDataKey = `module_${this.moduleId}_step_${finalStep}_data`;
      const currentStepData = uni.getStorageSync(currentStepDataKey);
      
      if (currentStepData) {
        console.warn(`[Briefing] Found data for step ${finalStep} but counter says ${finalStep}. Auto-advancing.`);
        finalStep++;
        // Sync back to storage to fix the counter
        uni.setStorageSync(key, finalStep);
      }

      // Special check for Module 05 (Study Aversion) completion logic
      // Ensures SART (Step 4) completion is recognized even if generic self-healing missed something
      if (this.moduleId === '05' && finalStep === 4) {
         let sartData = uni.getStorageSync('module_05_step_4_data');
         
         // Fallback: Check GlobalData
         if (!sartData) {
            const app = getApp();
            if (app && app.globalData && app.globalData.module_05_step_4_data) {
              console.warn('[Briefing] Recovered SART data from GlobalData');
              sartData = app.globalData.module_05_step_4_data;
              // Sync back to storage
              uni.setStorageSync('module_05_step_4_data', sartData);
            }
         }

         if (sartData) {
             console.warn('[Briefing] Force fixing SART completion status for Module 05');
             finalStep = 5;
             uni.setStorageSync(key, 5);
         }
      }

      this.currentStep = finalStep;
      console.log(`[Briefing] Updated currentStep to ${this.currentStep}`);
      
      // Auto-scroll to relevant step (current or previous if it has feedback)
      // Delay slightly to ensure render
      setTimeout(() => {
        if (this.currentStep > 1) {
          // Scroll to previous step to show feedback/transition text
          this.scrollId = `step-${this.currentStep - 1}`;
        } else {
          this.scrollId = 'step-1';
        }
      }, 300);
    }
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    modifySurvey() {
      if (this.moduleConfig.surveyPath) {
        let url = this.moduleConfig.surveyPath;
        url += url.indexOf('?') !== -1 ? `&moduleId=${this.moduleId}` : `?moduleId=${this.moduleId}`;
        uni.navigateTo({ url });
      }
    },
    startAssessment() {
      const totalSteps = this.pipeline.length;
      
      if (this.currentStep > totalSteps) {
        // Navigate to unified report page
        uni.navigateTo({
            url: `/pages/report/index?moduleId=${this.moduleId}`
        });
        return;
      }
      
      if (!this.activeItem) {
        uni.showToast({ title: '流程状态异常', icon: 'none' });
        return;
      }

      const type = this.activeItem.type;
      let url = '';
      
      switch (type) {
        case 'Survey':
          url = this.moduleConfig.surveyPath;
          break;
        case 'PVT':
          url = '/pages/neural-link/PVT';
          break;
        case 'NBack':
          url = '/pages/neural-link/nback';
          break;
        case 'Stroop':
          url = '/pages/neural-link/Stroop';
          break;
        case 'EmotionalStroop':
          url = '/pages/neural-link/Stroop?mode=emotional';
          break;
        case 'Schulte':
          url = '/pages/neural-link/grid';
          break;
        case 'SART':
          url = '/pages/neural-link/sart';
          break;
        default:
          uni.showToast({ title: '未知测试类型: ' + type, icon: 'none' });
          return;
      }
      
      if (url) {
        // Append moduleId and step
        const separator = url.indexOf('?') !== -1 ? '&' : '?';
        url += `${separator}moduleId=${this.moduleId}&step=${this.currentStep}`;
        
        console.log(`[Flow] Starting ${type} -> ${url}`);
        
        // Backup to GlobalData for robustness
        const app = getApp();
        if (app && app.globalData) {
          app.globalData.activeModuleId = this.moduleId;
          app.globalData.activeStep = this.currentStep;
        }
        
        // Backup to Storage for persistence across re-launches
        uni.setStorageSync('last_active_module_id', this.moduleId);
        uni.setStorageSync('last_active_step', this.currentStep);
        
        uni.navigateTo({ url });
      }
    }
  }
};

</script>

<style>
/* 页面容器 */
.container {
  min-height: 100vh;
  background-color: #0f172a;
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
}

/* 导航栏 */
.custom-nav {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
}

.nav-back {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
}

.back-arrow {
  color: #fff;
  font-size: 20px;
}

.nav-title {
  margin-left: 12px;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  width: 100%;
  box-sizing: border-box;
}

/* 头部 */
.header-section {
  padding: 0 24px;
  margin-bottom: 32px;
}

.main-title {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  display: block;
  margin-bottom: 16px;
}

.divider {
  width: 40px;
  height: 4px;
  background: #06b6d4;
  border-radius: 2px;
  margin-bottom: 16px;
}

.intro-text {
  font-size: 14px;
  color: #94a3b8;
  line-height: 1.6;
}

/* 时间轴容器 */
.timeline-container {
  padding: 0 24px;
}

.timeline-item {
  display: flex;
  margin-bottom: 24px;
  opacity: 1;
  transition: all 0.3s ease;
}

/* Completed State */
.timeline-item.completed {
  opacity: 0.8;
}

.timeline-item.completed .glass-card {
  background: rgba(16, 185, 129, 0.05); /* Very subtle green tint */
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.timeline-item.completed .item-name {
  color: #6ee7b7; /* Green-300 */
}

.timeline-item.completed .timeline-dot {
  background: #10b981;
  border-color: #34d399;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
}

/* Current State (Active) */
.timeline-item.current {
  transform: scale(1.02);
  z-index: 10;
}

.timeline-item.current .glass-card {
  background: rgba(6, 182, 212, 0.15); /* Cyan tint */
  border: 1px solid #06b6d4;
  box-shadow: 0 0 20px rgba(6, 182, 212, 0.2);
}

.timeline-item.current .item-name {
  color: #22d3ee;
  font-size: 18px;
  font-weight: 700;
}

.timeline-item.current .timeline-dot {
  background: #06b6d4;
  border-color: #22d3ee;
  box-shadow: 0 0 15px rgba(6, 182, 212, 0.6);
}

/* Locked State (Future) */
.timeline-item.locked {
  opacity: 0.4;
  filter: grayscale(1);
}

.timeline-item.locked .glass-card {
  background: rgba(15, 23, 42, 0.4);
  border: 1px dashed rgba(255, 255, 255, 0.1); /* Dashed border for future */
}

.timeline-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 16px;
  padding-top: 24px;
}

.timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #334155;
  border: 2px solid #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  transition: all 0.3s ease;
}



.check-mark {
  color: #fff;
  font-size: 8px;
}

/* Pulse Animation */
.timeline-dot.pulse {
  animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
  0% { box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(6, 182, 212, 0); }
  100% { box-shadow: 0 0 0 0 rgba(6, 182, 212, 0); }
}

.timeline-line {
  flex: 1;
  width: 2px;
  background: #334155;
  margin-top: 4px;
  min-height: 40px;
}

/* 卡片样式 */
.glass-card {
  flex: 1;
  background: rgba(30, 41, 59, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  position: relative;
  transition: all 0.3s ease;
}



.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.header-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.header-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.item-name {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin-right: 8px;
}

.lock-icon {
  width: 14px;
  height: 14px;
  opacity: 0.6;
}

.item-time {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 4px;
}

.item-desc {
  font-size: 13px;
  color: #94a3b8;
  line-height: 1.5;
  display: block;
}

/* Modify Button */
.modify-btn {
  margin-top: 4px;
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.modify-btn text {
  font-size: 10px;
  color: #e2e8f0;
}

/* Transition Text */
.transition-box {
  margin-top: 12px;
  padding: 10px;
  background: rgba(6, 182, 212, 0.1);
  border-radius: 8px;
  border-left: 3px solid #06b6d4;
}

.transition-text {
  font-size: 12px;
  color: #22d3ee;
  line-height: 1.4;
}

/* Status Tag */
.status-tag {
  position: absolute;
  top: 0;
  right: 0;
  padding: 4px 8px;
  border-radius: 0 16px 0 8px;
}

.status-tag.current {
  background: #06b6d4;
  box-shadow: 0 0 10px rgba(6, 182, 212, 0.4);
}

.status-tag.completed {
  background: #10b981;
}

.status-tag.locked {
  background: #475569;
  opacity: 0.8;
}

.status-tag text {
  font-size: 10px;
  color: #fff;
  font-weight: 600;
}

/* 警告框 */
.warning-box {
  margin: 0 24px 24px;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: flex-start;
}

.warning-icon {
  width: 20px;
  height: 20px;
  margin-right: 12px;
  flex-shrink: 0;
  margin-top: 2px;
}

.warning-text {
  font-size: 13px;
  color: #fbbf24;
  line-height: 1.5;
}

.footer-spacer {
  height: 100px;
}

/* 底部操作栏 */
.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 16px 24px;
  background: linear-gradient(to top, #0f172a 90%, rgba(15, 23, 42, 0));
  box-sizing: border-box;
  z-index: 99;
}

.start-btn {
  background: #06b6d4;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  height: 50px;
  border-radius: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(6, 182, 212, 0.3);
}

.btn-hover {
  transform: scale(0.98);
  opacity: 0.9;
}

.btn-glow {
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  100% { left: 200%; }
}
</style>