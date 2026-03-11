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
      </view>
      
      <!-- Progress and Status Row -->
      <view class="status-row">
        <view class="timer-pill">
          <text class="material-icons timer-icon">format_list_bulleted</text>
          <text class="timer-text">{{ currentRound }} / {{ maxRounds }}</text>
        </view>
        <view class="system-status">
          <text class="status-text">EMOTIONAL_PROTOCOL</text>
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
      <!-- Crosshair for Cooling Phase -->
      <view class="crosshair-container" v-if="showCrosshair">
        <text class="crosshair">+</text>
      </view>

      <!-- Stimulus Word -->
      <view class="word-container" :class="{ 'floating': isFloating }" v-if="!showCrosshair">
        <text 
          class="stimulus-word" 
          :style="{ color: currentInkColor, textShadow: '0 0 40rpx ' + currentInkColor + '80' }"
        >{{ currentWordText }}</text>
      </view>
    </view>

    <!-- Controls -->
    <view class="controls-area" v-if="!showCrosshair">
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
import mod03Config from '@/data/config_mod03.json';
import mod04Config from '@/data/config_mod04.json';

export default {
  components: {
    CountdownOverlay
  },
  data() {
    return {
      showCountdown: true,
      statusBarHeight: 20,
      menuButtonTop: 24, 
      menuButtonHeight: 32, 
      navPaddingBottom: 8, 
      
      // Game Config
      config: null,
      moduleId: '04', // Default to 04 for Emotional
      step: 4,
      maxRounds: 40,
      timeLimitMs: 3000,
      
      currentRound: 1,
      startTime: 0,
      timer: null, 
      roundTimeout: null, 
      
      // Game State
      currentWordText: '###',
      currentInkColor: '#00E5FF', 
      currentInkType: 'blue', 
      
      score: 0,
      errors: 0,
      reactionTimes: [],
      roundStartTime: 0,
      
      isFloating: true,
      feedback: null, 
      
      // State Machine
      showCrosshair: false, // State C/D
      
      // Anti-desensitization history
      recentWords: [],
      
      // Assets
      colors: {
        blue: '#0099FF', // Bright Blue
        yellow: '#FFFF00', // Bright Yellow
        red: '#FF4444'     // Bright Red
      },
      currentButtons: [],
      
      // Words
      customWords: [],
      neutralWords: []
    };
  },
  computed: {
    tickCount() {
      return Math.min(20, this.maxRounds);
    },
    progressPercent() {
      return (this.currentRound / this.maxRounds) * 100;
    }
  },
  onLoad(options) {
    if (options && options.moduleId) {
      this.moduleId = options.moduleId;
    }
    if (options && options.step) {
      this.step = parseInt(options.step);
    }

    const sysInfo = uni.getSystemInfoSync();
    this.statusBarHeight = sysInfo.statusBarHeight || 20;

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

    // Load User Config
    let userAge = 18;
    const userProfile = uni.getStorageSync('user_profile');
    if (userProfile && userProfile.age) {
      userAge = userProfile.age;
    } else {
      const parentSurvey = uni.getStorageSync('parent_survey_result');
      if (parentSurvey && parentSurvey.ageGroup) {
        if (parentSurvey.ageGroup === 'low_age') userAge = 10;
        else if (parentSurvey.ageGroup === 'high_age') userAge = 15;
      }
    }
    
    // Get norms for Emotional Stroop
    this.config = getNormsByAge(userAge, 'emotional_stroop');
    
    if (this.config) {
      this.maxRounds = this.config.totalTrials || 40;
      this.timeLimitMs = this.config.timeLimitMs || 3000;
    }
    
    // Load Words based on Module
    if (this.moduleId === '04') {
      this.customWords = mod04Config.customWordBank || [];
      this.neutralWords = mod04Config.neutralWordBank || [];
    } else if (this.moduleId === '03') {
      // Mod 03 Emotional Stroop is step 5 (index 4)
      if (mod03Config.pipeline && mod03Config.pipeline[4]) {
         this.customWords = mod03Config.pipeline[4].customWordBank || [];
         this.neutralWords = mod03Config.pipeline[4].neutralWordBank || [];
      }
    }
    
    // If words are empty, provide fallback to avoid crash
    if (this.customWords.length === 0) this.customWords = ["焦虑", "紧张", "害怕"];
    if (this.neutralWords.length === 0) this.neutralWords = ["桌子", "椅子", "电脑"];

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
      this.startTime = Date.now(); 
      this.nextRound();
    },
    
    startTimer() {
      this.stopTimer();
      this.roundTimeout = setTimeout(() => {
        this.handleTimeout();
      }, this.timeLimitMs);
    },
    
    stopTimer() {
      if (this.roundTimeout) clearTimeout(this.roundTimeout);
    },

    handleTimeout() {
      this.stopTimer();
      this.errors++;
      this.feedback = 'wrong';
      uni.vibrateShort();
      
      // Timeout also triggers Cooling Phase
      this.triggerCooling();
    },
    
    triggerCooling() {
      // State C & D: Show Crosshair and wait 1200ms
      this.showCrosshair = true;
      
      setTimeout(() => {
        // State E: Next Question
        this.showCrosshair = false;
        this.currentRound++;
        this.nextRound();
      }, 1200);
    },
    
    generateRoundData() {
      // 1. Decide Target Ink Color (The Correct Answer)
      const targetTypes = ['blue', 'yellow', 'red'];
      const type = targetTypes[Math.floor(Math.random() * targetTypes.length)];
      this.currentInkType = type;
      this.currentInkColor = this.colors[type];
      
      // 2. Decide Word Text (Emotional/Neutral)
      const allWords = [...this.customWords, ...this.neutralWords];
      if (allWords.length > 0) {
        // Anti-desensitization: Ensure no consecutive duplicate words (at least 2-3 words separation)
        let candidate = allWords[Math.floor(Math.random() * allWords.length)];
        let attempts = 0;
        
        // Check against recent words
        const avoidCount = Math.min(3, Math.max(0, allWords.length - 1));
        const recent = this.recentWords.slice(-avoidCount);
        
        while (recent.includes(candidate) && attempts < 20) {
          candidate = allWords[Math.floor(Math.random() * allWords.length)];
          attempts++;
        }
        
        this.currentWordText = candidate;
        this.recentWords.push(candidate);
        if (this.recentWords.length > 5) this.recentWords.shift(); // Maintain buffer
      } else {
        this.currentWordText = '###';
      }

      // 3. Setup Buttons (3 Buttons for consistency)
      const allButtons = [
        { type: 'blue', label: '蓝色', class: 'blue-btn' },
        { type: 'yellow', label: '黄色', class: 'yellow-btn' },
        { type: 'red', label: '红色', class: 'red-btn' }
      ];

      // Fixed button order
      this.currentButtons = allButtons;

      this.roundStartTime = Date.now();
      this.startTimer();
    },

    nextRound() {
      if (this.currentRound > this.maxRounds) {
        this.finishGame();
        return;
      }
      this.roundStartTime = Date.now();
      this.feedback = null;
      this.startTimer();
      this.generateRoundData();
    },
    
    handleInput(inputType) {
      if (this.showCountdown) return; 
      if (this.showCrosshair) return; // Cooling phase blocks input
      if (this.feedback) return; 
      
      this.stopTimer();

      const reactionTime = Date.now() - this.roundStartTime;
      this.reactionTimes.push(reactionTime);
      
      const isCorrect = (inputType === this.currentInkType);
      
      if (isCorrect) {
        this.score++;
        this.feedback = 'correct';
      } else {
        this.errors++;
        this.feedback = 'wrong';
        uni.vibrateShort();
      }
      
      this.triggerCooling();
    },
    
    finishGame() {
      this.stopTimer();
      
      try {
        uni.showLoading({ title: '保存中...', mask: true });
        
        const totalTime = Date.now() - this.startTime;
        const avgReaction = this.reactionTimes.length > 0
          ? this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length
          : 0;
        
        const resultPayload = {
          metrics: {
            totalTrials: this.maxRounds,
            errors: this.errors,
            score: this.score,
            avgTime: Math.round(avgReaction),
            totalTime: totalTime
          },
          thresholds: {
            excellentErrors: this.config ? this.config.excellentErrors : 0,
            riskErrors: this.config ? this.config.riskErrors : 6,
            timeLimitMs: this.timeLimitMs
          }
        };

        if (this.moduleId) {
          let currentStepNum = parseInt(this.step);
          if (isNaN(currentStepNum)) currentStepNum = 4; 

          const dataKey = `module_${this.moduleId}_step_${currentStepNum}_data`;
          const stepKey = `module_${this.moduleId}_current_step`;
          const nextStep = currentStepNum + 1;
          
          uni.setStorageSync(dataKey, resultPayload);
          uni.setStorageSync(stepKey, nextStep);
        }

        uni.hideLoading();
        uni.showToast({
          title: '测试完成',
          icon: 'success',
          duration: 1500
        });
      } catch (e) {
        console.error('EmotionalStroop: Error in finishGame', e);
        uni.hideLoading();
      }
      
      setTimeout(() => {
            if (this.moduleId) {
              uni.redirectTo({
                url: `/pages/assessment/briefing?moduleId=${this.moduleId}`
              });
            } else {
              uni.navigateBack();
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
  padding-right: 32rpx;
  z-index: 10;
  display: flex;
  flex-direction: column;
}

.header-top {
  display: flex;
  align-items: center;
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

.stimulus-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 20;
  width: 100%;
}

.crosshair-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.crosshair {
  font-size: 100rpx;
  color: #ffffff;
  font-weight: 300;
  transform: translateY(-180rpx);
}

.word-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 300rpx;
}

.stimulus-word {
  font-size: 144rpx;
  font-weight: 900;
  letter-spacing: 8rpx;
  transition: all 0.2s ease;
}

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
  justify-content: center;
  gap: 0;
  height: 100%;
}

.btn-label {
  font-size: 80rpx;
  font-weight: 700;
  letter-spacing: 4rpx;
}

/* Blue Button Style */
.blue-btn {
  box-shadow: 0 0 30rpx rgba(0, 153, 255, 0.1) inset;
  border-color: rgba(0, 153, 255, 0.3);
}
.blue-btn .btn-label { color: #0099FF; }

/* Yellow Button Style */
.yellow-btn {
  box-shadow: 0 0 30rpx rgba(255, 255, 0, 0.1) inset;
  border-color: rgba(255, 255, 0, 0.3);
}
.yellow-btn .btn-label { color: #FFFF00; }

/* Red Button Style */
.red-btn {
  box-shadow: 0 0 30rpx rgba(255, 68, 68, 0.1) inset;
  border-color: rgba(255, 68, 68, 0.3);
}
.red-btn .btn-label { color: #FF4444; }

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