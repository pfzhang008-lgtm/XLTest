<template>
  <view class="container">
    <!-- Grid Background -->
    <view class="grid-bg"></view>

    <!-- Header -->
    <view class="header" :style="{ paddingTop: menuButtonTop + 'px', paddingBottom: navPaddingBottom + 'px' }">
      <view class="header-top" :style="{ height: menuButtonHeight + 'px' }">
        <view class="left-controls">
          <view class="nav-back" @click="goBack">
            <text class="back-arrow">←</text>
          </view>
          
        </view>
        <!-- Timer moved or kept with padding -->
      </view>
      
      <!-- Progress and Status Row -->
      <view class="status-row">
        <view class="timer-pill">
          <text class="material-icons timer-icon">format_list_bulleted</text>
          <text class="timer-text">{{ currentRound }} / {{ maxRounds }}</text>
        </view>
        <view class="system-status">
           <text class="status-text">SYSTEM_ACTIVE</text>
        </view>
      </view>

      <!-- Ruler Progress -->
      <view class="progress-section">
        <view class="ruler-track">
          <view class="ruler-fill" :style="{ width: progressPercent + '%' }">
            <view class="ruler-glow"></view>
          </view>
          <view class="ruler-thumb" :style="{ left: progressPercent + '%' }"></view>
        </view>
        <view class="ruler-ticks">
          <view v-for="i in tickCount" :key="i" class="tick" :class="{ 'tick-major': i % 5 === 0 }"></view>
        </view>
      </view>
      
    </view>

    <!-- Main Stimulus -->
    <view class="stimulus-area">
      <view class="instruction">
        <text>请选择字体的 </text>
        <text class="highlight-cyan">颜色</text>
      </view>

      <view class="word-container" :class="{ 'floating': isFloating }">
        <text 
          class="stimulus-word" 
          :style="{ color: currentInkColor, textShadow: '0 0 40rpx ' + currentInkColor + '80' }"
        >{{ currentWordText }}</text>
      </view>
      
      <!-- Feedback Effect -->
      <view v-if="feedback" class="feedback-overlay" :class="feedback">
        <text class="material-icons feedback-icon">{{ feedback === 'correct' ? 'check_circle' : 'cancel' }}</text>
      </view>
    </view>

    <!-- Controls -->
    <view class="controls-area">
      <view 
        v-for="(btn, index) in currentButtons"
        :key="index"
        class="control-btn"
        :class="btn.class"
        hover-class="btn-hover" 
        @click="handleInput(btn.type)"
      >
        <view class="btn-content">
          <text class="btn-label">{{ btn.label }}</text>
          <text class="btn-sub">{{ btn.sub }}</text>
        </view>
        <view class="btn-corner tl"></view>
        <view class="btn-corner tr"></view>
        <view class="btn-corner bl"></view>
        <view class="btn-corner br"></view>
      </view>
    </view>

    <!-- Footer -->
    <view class="footer">
      <text class="session-info">CURRENT SESSION {{ String(currentRound).padStart(2, '0') }} / {{ maxRounds }}</text>
      <view class="pagination">
        <view 
          v-for="n in 5" 
          :key="n" 
          class="dot" 
          :class="{ active: (currentRound % 5) >= n || (currentRound % 5 === 0 && n === 5) }"
        ></view>
      </view>
    </view>
    
    <!-- Countdown Overlay -->
    <CountdownOverlay 
      v-if="showCountdown" 
      @complete="handleCountdownComplete" 
    />
  </view>
</template>

<script>
import CountdownOverlay from '@/components/CountdownOverlay.vue';
import { getNormsByAge } from '@/utils/testConfigManager.js';
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
  components: {
    CountdownOverlay
  },
  data() {
    return {
      showCountdown: true,
      statusBarHeight: 20,
      menuButtonTop: 24, // Default
      menuButtonHeight: 32, // Default
      navPaddingBottom: 8, // Default
      
      // Game Config
      config: null,
      moduleId: '01',
      step: 1,
      maxRounds: 20,
      timeLimitMs: 3000,
      isEmotionalMode: false,
      
      currentRound: 1,
      startTime: 0,
      totalTime: 0,
      timer: null, // Per-trial timeout
      displayTimer: null, // Visual countdown interval
      displayTime: 3, // Seconds remaining for current trial
      roundTimeout: null, // Exact timeout for the round
      
      // Game State
      currentWordText: '黄',
      currentInkColor: '#00E5FF', // Hex for Blue/Cyan
      currentInkType: 'blue', // 'blue' or 'yellow'
      
      score: 0,
      errors: 0,
      reactionTimes: [],
      roundStartTime: 0,
      
      isFloating: true,
      feedback: null, // 'correct' | 'wrong'
      
      // Assets
      words: ['红', '蓝', '黄'],
      customWords: [], // For Emotional Stroop
      neutralWords: [], // For Emotional Stroop
      colors: {
        blue: '#0099FF', // Bright Blue
        yellow: '#FFFF00', // Bright Yellow
        red: '#FF4444'     // Bright Red
      },
      currentButtons: []
    };
  },
  computed: {
    tickCount() {
      // Limit ticks to avoid crowding, max 20 or actual rounds if less
      return Math.min(20, this.maxRounds);
    },
    progressPercent() {
      return (this.currentRound / this.maxRounds) * 100;
    }
  },
  onLoad(options) {
    // 1. Try options
    if (options && options.moduleId) {
      this.moduleId = options.moduleId;
      console.log('Stroop: Set moduleId from options:', this.moduleId);
    }
    
    if (options && options.step) {
      const parsedStep = parseInt(options.step);
      if (!isNaN(parsedStep)) {
        this.step = parsedStep;
        console.log('Stroop: Set step from options:', this.step);
      } else {
        console.warn('Stroop: Invalid step option, defaulting to 1');
        this.step = 1;
      }
    }

    // 2. Fallback to GlobalData
    if (!options || !options.moduleId) {
       const app = getApp();
       if (app && app.globalData && app.globalData.activeModuleId) {
         this.moduleId = app.globalData.activeModuleId;
         console.warn('Stroop: Recovered moduleId from GlobalData:', this.moduleId);
         
         if (app.globalData.activeStep) {
           const globalStep = parseInt(app.globalData.activeStep);
           if (!isNaN(globalStep)) {
             this.step = globalStep;
             console.warn('Stroop: Recovered step from GlobalData:', this.step);
           }
         }
       }
    }

    // 3. Fallback to Storage (Last Resort)
    if ((!this.moduleId || this.moduleId === '01') && (!options || !options.moduleId)) {
       const lastModuleId = uni.getStorageSync('last_active_module_id');
       if (lastModuleId) {
         this.moduleId = lastModuleId;
         console.warn('Stroop: Recovered moduleId from Storage:', this.moduleId);
         
         const lastStep = uni.getStorageSync('last_active_step');
         if (lastStep) {
            const storageStep = parseInt(lastStep);
            if (!isNaN(storageStep)) {
               this.step = storageStep;
               console.warn('Stroop: Recovered step from Storage:', this.step);
            }
         }
       }
    }

    const sysInfo = uni.getSystemInfoSync();
    this.statusBarHeight = sysInfo.statusBarHeight || 20;

    // Get Menu Button (Capsule) Info for Alignment
    // #ifdef MP-WEIXIN
    const menuButton = uni.getMenuButtonBoundingClientRect();
    this.menuButtonTop = menuButton.top;
    this.menuButtonHeight = menuButton.height;
    this.navPaddingBottom = menuButton.top - this.statusBarHeight;
    if (this.navPaddingBottom < 4) this.navPaddingBottom = 4;
    // #endif
    // #ifndef MP-WEIXIN
    this.menuButtonTop = this.statusBarHeight + 4;
    this.menuButtonHeight = 32;
    this.navPaddingBottom = 4;
    // #endif

    // Check for Emotional Mode
    if (options.mode === 'emotional') {
      this.isEmotionalMode = true;
      const currentModuleConfig = configMap[this.moduleId] || mod01Config;
      
      // 兼容处理：配置文件可能使用 pipeline 或 testQueue
      const flowList = currentModuleConfig.pipeline || currentModuleConfig.testQueue || [];
      const esConfig = flowList.find(t => t.type === 'EmotionalStroop');
      
      if (esConfig) {
        this.customWords = esConfig.customWordBank || [];
        this.neutralWords = esConfig.neutralWordBank || [];
      }
      uni.setNavigationBarTitle({ title: '潜意识情绪探测' });
    }

    // Load User Config
    let userAge = 18;
    const parentSurvey = uni.getStorageSync('parent_survey_result');
    if (parentSurvey && parentSurvey.ageGroup) {
      if (parentSurvey.ageGroup === 'low_age') userAge = 10;
      else if (parentSurvey.ageGroup === 'high_age') userAge = 15;
    } else {
      const userProfile = uni.getStorageSync('user_profile') || {};
      userAge = userProfile.age || 18;
    }
    
    // Get norms for Stroop
    this.config = getNormsByAge(userAge, 'stroop');
    
    if (this.config) {
      this.maxRounds = this.config.totalTrials;
      this.timeLimitMs = this.config.timeLimitMs;
    }

    // this.startGame(); // Moved to handleCountdownComplete
    this.generateRoundData();
  },
  onUnload() {
    this.stopTimer();
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    handleCountdownComplete() {
      this.showCountdown = false;
      this.startGame();
    },
    startGame() {
      this.currentRound = 1;
      this.score = 0;
      this.errors = 0;
      this.reactionTimes = [];
      // this.displayTime = 20; // Removed global timer
      
      this.startTime = Date.now(); // Track total session time
      this.nextRound();
    },
    
    startTimer() {
      // Clear existing timer if any
      this.stopTimer();
      
      // Set display time (seconds)
      this.displayTime = Math.ceil(this.timeLimitMs / 1000);
      
      // Visual Countdown
      this.timerInterval = setInterval(() => {
        if (this.displayTime > 0) {
          this.displayTime--;
        }
      }, 1000);

      // Logical Timeout
      this.roundTimeout = setTimeout(() => {
        this.handleTimeout();
      }, this.timeLimitMs);
    },
    
    stopTimer() {
      if (this.timerInterval) clearInterval(this.timerInterval);
      if (this.roundTimeout) clearTimeout(this.roundTimeout);
    },

    handleTimeout() {
      this.stopTimer();
      this.errors++;
      this.feedback = 'wrong';
      uni.vibrateShort();
      
      // Auto proceed
      setTimeout(() => {
        this.currentRound++;
        this.nextRound();
      }, 300);
    },
    
    generateRoundData() {
      // 1. Decide Target Ink Color
      const targetTypes = ['blue', 'yellow', 'red'];
      const type = targetTypes[Math.floor(Math.random() * targetTypes.length)];
      this.currentInkType = type;
      this.currentInkColor = this.colors[type];
      
      let textType = null;

      if (this.isEmotionalMode) {
        // Emotional Mode: Mix of Emotional and Neutral words
        const allWords = [...this.customWords, ...this.neutralWords];
        if (allWords.length > 0) {
          this.currentWordText = allWords[Math.floor(Math.random() * allWords.length)];
        } else {
          // Fallback if no words loaded
          this.currentWordText = '###';
        }
        // No textType mapping for emotional words (interference is semantic/emotional, not color-conflict)
      } else {
        // Standard Mode
        // 2. Decide Word Text (Distractor)
        // Restricted to red/yellow/blue to ensure we can create a button for it.
        const distractorWords = ['红', '黄', '蓝'];
        this.currentWordText = distractorWords[Math.floor(Math.random() * distractorWords.length)];
        
        // Map Chinese word to color type
        const wordToType = {
          '红': 'red',
          '黄': 'yellow',
          '蓝': 'blue'
        };
        textType = wordToType[this.currentWordText];
      }

      // 3. Randomize Buttons (Only 2 buttons shown at a time)
      const allButtons = [
        { type: 'blue', label: '蓝色', sub: 'SYNC BLUE', class: 'blue-btn' },
        { type: 'yellow', label: '黄色', sub: 'SYNC YELLOW', class: 'yellow-btn' },
        { type: 'red', label: '红色', sub: 'SYNC RED', class: 'red-btn' }
      ];

      // Button A: Correct Answer (Ink Color)
      const correctButton = allButtons.find(b => b.type === this.currentInkType);

      // Button B: Distractor
      let distractorButton = null;
      
      if (!this.isEmotionalMode && textType && textType !== this.currentInkType) {
        // Standard Stroop: Prefer the button that matches the Text Content (Strong Distractor)
        distractorButton = allButtons.find(b => b.type === textType);
      }
      
      if (!distractorButton) {
        // If Emotional Mode OR Text==Ink OR TextType not found
        // Pick a random other color
        const otherButtons = allButtons.filter(b => b.type !== this.currentInkType);
        distractorButton = otherButtons[Math.floor(Math.random() * otherButtons.length)];
      }

      // Shuffle position
      this.currentButtons = [correctButton, distractorButton].sort(() => Math.random() - 0.5);

      this.roundStartTime = Date.now();
      
      // Start Timer
      this.startTimer();
    },

    nextRound() {
      if (this.currentRound > this.maxRounds) {
        this.finishGame();
        return;
      }
      
      this.roundStartTime = Date.now();
      this.feedback = null;
      
      // Start the per-round timer
      this.startTimer();
      
      this.generateRoundData();
    },
    
    handleInput(inputType) {
      if (this.showCountdown) return; // Prevent input during countdown
      if (this.feedback) return; // Prevent double tap
      
      this.stopTimer(); // Stop the timer immediately on input

      const reactionTime = Date.now() - this.roundStartTime;
      this.reactionTimes.push(reactionTime);
      
      const isCorrect = (inputType === this.currentInkType);
      
      if (isCorrect) {
        this.score++;
        this.feedback = 'correct';
      } else {
        this.errors++;
        this.feedback = 'wrong';
        // Haptic feedback
        uni.vibrateShort();
      }
      
      // Delay for visual feedback then next round
      setTimeout(() => {
        this.currentRound++;
        this.nextRound();
      }, 300);
    },
    
    finishGame() {
      this.stopTimer();
      
      try {
        uni.showLoading({ title: '保存中...', mask: true });
        
        const totalTime = Date.now() - this.startTime;
        const avgReaction = this.reactionTimes.length > 0
          ? this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length
          : 0;
        
        // Standardized Payload
        const resultPayload = {
          metrics: {
            totalTrials: this.maxRounds,
            errors: this.errors,
            score: this.score, // correct count
            avgTime: Math.round(avgReaction),
            totalTime: totalTime
          },
          thresholds: {
            excellentErrors: this.config ? this.config.excellentErrors : 0,
            riskErrors: this.config ? this.config.riskErrors : 6,
            timeLimitMs: this.timeLimitMs
          }
        };

        // Save result
        if (this.moduleId) {
          // Ensure step is a valid number
          let currentStepNum = parseInt(this.step);
          if (isNaN(currentStepNum)) {
             console.warn('Stroop: currentStep is NaN, defaulting to 1');
             currentStepNum = 1;
          }

          const dataKey = `module_${this.moduleId}_step_${currentStepNum}_data`;
          const stepKey = `module_${this.moduleId}_current_step`;
          const nextStep = currentStepNum + 1;
          
          console.log(`[Stroop] Saving results to ${dataKey}`);
          uni.setStorageSync(dataKey, resultPayload);
          uni.setStorageSync(stepKey, nextStep);
          
          // Double check save
          const savedData = uni.getStorageSync(dataKey);
          if (!savedData) {
             console.error('[Stroop] CRITICAL: Data save failed immediately after setStorageSync');
             // Retry once
             uni.setStorageSync(dataKey, resultPayload);
          }
        } else {
          console.warn('Stroop: No moduleId found, skipping data save');
        }

        uni.hideLoading();
        uni.showToast({
          title: '测试完成',
          icon: 'success',
          duration: 1500
        });
      } catch (e) {
        console.error('Stroop: Error in finishGame', e);
        uni.hideLoading();
        uni.showToast({
          title: '完成',
          icon: 'none'
        });
      }
      
      setTimeout(() => {
            console.log('Stroop: Navigating back...');
            const pages = getCurrentPages();
            if (pages.length > 1) {
              uni.navigateBack();
            } else if (this.moduleId) {
              uni.redirectTo({
                url: `/pages/assessment/briefing?moduleId=${this.moduleId}`
              });
            } else {
              uni.reLaunch({ url: '/pages/index/index' });
            }
          }, 1500);
    }
  }
};
</script>

<style>
/* Font */
@font-face {
  font-family: 'Material Icons';
  src: url(https://fonts.gstatic.com/s/materialicons/v139/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2) format('woff2');
}
.material-icons {
  font-family: 'Material Icons';
  font-size: 24px;
  line-height: 1;
}

page {
  background-color: #020b1c;
  color: #fff;
  font-family: 'Inter', sans-serif;
}

.container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

/* Background */
.grid-bg {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background-image: 
    linear-gradient(rgba(0, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
  z-index: 0;
}

/* Header */
.header {
  padding-left: 32rpx;
  padding-right: 32rpx; /* Ensure padding on right */
  z-index: 10;
  display: flex;
  flex-direction: column;
}

.header-top {
  display: flex;
  align-items: center;
  /* Height is set inline */
}

.left-controls {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.nav-back {
  width: 70rpx;
  height: 70rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  margin-left: 0;
}

.back-arrow {
  color: #fff;
  font-size: 40rpx;
  font-weight: bold;
  line-height: 1;
}

.status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12rpx;
  margin-bottom: 24rpx;
}

.title-box {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.logo-icon {
  color: #00E5FF;
  font-size: 36rpx;
}

.app-title {
  color: #00E5FF;
  font-size: 28rpx;
  font-weight: 700;
  letter-spacing: 2px;
}

.timer-pill {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  padding: 8rpx 24rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.timer-icon {
  font-size: 24rpx;
  color: #ccc;
}

.timer-text {
  font-family: monospace;
  font-size: 28rpx;
  font-weight: 700;
}

/* Ruler Progress */
.progress-section {
  margin-bottom: 12rpx;
}

.ruler-track {
  height: 4rpx;
  background: rgba(255, 255, 255, 0.1);
  position: relative;
  margin-bottom: 8rpx;
}

.ruler-fill {
  height: 100%;
  background: #00E5FF;
  position: relative;
  transition: width 0.3s ease;
}

.ruler-glow {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 20rpx;
  height: 20rpx;
  background: #00E5FF;
  filter: blur(8rpx);
}

.ruler-thumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 12rpx;
  height: 12rpx;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 0 10rpx #00E5FF;
  transition: left 0.3s ease;
}

.ruler-ticks {
  display: flex;
  justify-content: space-between;
  padding: 0 2rpx;
}

.tick {
  width: 1px;
  height: 6rpx;
  background: rgba(255, 255, 255, 0.2);
}

.tick-major {
  height: 10rpx;
  background: rgba(255, 255, 255, 0.4);
}

.system-status {
  display: flex;
  justify-content: space-between;
  font-size: 18rpx;
  color: rgba(255, 255, 255, 0.3);
  letter-spacing: 1px;
  font-family: monospace;
}

/* Stimulus */
.stimulus-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.instruction {
  font-size: 32rpx;
  color: #ccc;
  margin-bottom: 80rpx;
}

.highlight-cyan {
  color: #00E5FF;
  font-weight: bold;
  text-shadow: 0 0 10rpx rgba(0, 229, 255, 0.5);
}

.word-container {
  position: relative;
  transition: transform 0.2s;
}

.floating {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20rpx); }
}

.stimulus-word {
  font-size: 240rpx;
  font-weight: 900;
  line-height: 1;
}

/* Feedback Overlay */
.feedback-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200rpx;
  height: 200rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  z-index: 20;
}

.correct {
  background: rgba(16, 185, 129, 0.2);
  border: 2px solid #10B981;
}

.wrong {
  background: rgba(239, 68, 68, 0.2);
  border: 2px solid #EF4444;
}

.feedback-icon {
  font-size: 80rpx;
}

.correct .feedback-icon { color: #10B981; }
.wrong .feedback-icon { color: #EF4444; }

/* Controls */
.controls-area {
  padding: 40rpx 40rpx 80rpx;
  display: flex;
  gap: 20rpx;
  z-index: 10;
}

.control-btn {
  flex: 1;
  height: 240rpx;
  background: rgba(2, 11, 28, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24rpx;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.1s;
}

.btn-hover {
  transform: scale(0.96);
  background: rgba(255, 255, 255, 0.05);
}

.btn-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.btn-label {
  font-size: 102rpx;
  font-weight: 700;
  letter-spacing: 2px;
}

.btn-sub {
  font-size: 18rpx;
  font-weight: 700;
  letter-spacing: 1px;
  opacity: 0.8;
}

/* Blue Button Style */
.blue-btn {
  box-shadow: 0 0 30rpx rgba(0, 153, 255, 0.1) inset;
  border-color: rgba(0, 153, 255, 0.3);
}
.blue-btn .btn-label { color: #0099FF; }
.blue-btn .btn-sub { color: #0099FF; }

/* Yellow Button Style */
.yellow-btn {
  box-shadow: 0 0 30rpx rgba(255, 255, 0, 0.1) inset;
  border-color: rgba(255, 255, 0, 0.3);
}
.yellow-btn .btn-label { color: #FFFF00; }
.yellow-btn .btn-sub { color: #FFFF00; }

/* Red Button Style */
.red-btn {
  box-shadow: 0 0 30rpx rgba(255, 68, 68, 0.1) inset;
  border-color: rgba(255, 68, 68, 0.3);
}
.red-btn .btn-label { color: #FF4444; }
.red-btn .btn-sub { color: #FF4444; }

/* Tech Corners */
.btn-corner {
  position: absolute;
  width: 12rpx;
  height: 12rpx;
  border-color: inherit;
  border-style: solid;
}
.tl { top: -1px; left: -1px; border-width: 2px 0 0 2px; }
.tr { top: -1px; right: -1px; border-width: 2px 2px 0 0; }
.bl { bottom: -1px; left: -1px; border-width: 0 0 2px 2px; }
.br { bottom: -1px; right: -1px; border-width: 0 2px 2px 0; }

/* Footer */
.footer {
  padding: 0 40rpx 60rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
}

.session-info {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 700;
  letter-spacing: 2px;
}

.pagination {
  display: flex;
  gap: 12rpx;
}

.dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
}

.dot.active {
  background: #00E5FF;
  box-shadow: 0 0 8rpx #00E5FF;
}
</style>