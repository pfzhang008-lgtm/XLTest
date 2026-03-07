<template>
  <view class="container">
    <!-- Header -->
    <view class="header" :style="{ paddingTop: menuButtonTop + 'px', paddingBottom: navPaddingBottom + 'px' }">
      <view class="header-content" :style="{ height: menuButtonHeight + 'px' }">
        <view class="back-btn" @click="goBack">
          <text class="back-arrow">←</text>
        </view>
        <text class="page-title">舒尔特方格</text>
      </view>
    </view>

    <!-- Timer Section -->
    <view class="timer-section">
      <view class="timer-display">
        <text class="timer-main">{{ formatTime(minutes) }}:{{ formatTime(seconds) }}</text>
        <text class="timer-ms">.{{ formatMs(milliseconds) }}</text>
      </view>
    </view>

    <!-- Progress Bar Section -->
    <view class="progress-section">
      <view class="progress-info">
        <text class="sequence-text">序列 : <text class="cyan-text">{{ expectedNumber }}</text> / 25</text>
        <text class="focus-text">专注度 : <text class="red-text">临界</text></text>
      </view>
      <view class="progress-bar-bg">
        <view class="progress-bar-fill" :style="{ width: (expectedNumber / 25 * 100) + '%' }"></view>
      </view>
    </view>

    <!-- Instruction -->
    <view class="instruction-container">
      <text class="instruction-text glitch-text">按顺序点击 1-25</text>
    </view>

    <!-- Schulte Grid -->
    <view class="grid-container">
      <view class="schulte-grid">
        <view 
          v-for="(item, index) in gridData" 
          :key="index"
          class="grid-cell"
          hover-class="cell-active"
          :class="[
            { 'cell-highlight-cyan': item.highlightType === 'cyan' },
            { 'cell-highlight-red': item.highlightType === 'red' },
            { 'cell-blur': item.isBlurred },
            { 'cell-correct': item.isCorrect },
            { 'cell-wrong': item.isWrong }
          ]"
          @click="handleCellClick(index)"
        >
          <text class="cell-number">{{ item.value }}</text>
          
          <!-- Red Dot Notification -->
          <view v-if="item.hasDot" class="red-dot"></view>
          
          <!-- Symbol Overlay (e.g. for completed or interference) -->
          <view v-if="item.hasSymbol" class="symbol-overlay">
            <image class="symbol-icon" :src="icons.cross" mode="aspectFit"></image>
          </view>
        </view>
      </view>
    </view>

    <!-- Footer -->
    <view class="footer">
      <text class="noise-label">系统噪声等级</text>
      <view class="noise-viz">
        <view v-for="n in 5" :key="n" class="noise-bar" :style="{ height: getRandomHeight(n) + 'rpx' }"></view>
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
import { getNormsByAge } from '@/utils/testConfigManager.js';
import CountdownOverlay from '@/components/CountdownOverlay.vue';

export default {
  components: {
    CountdownOverlay
  },
  data() {
    return {
      showCountdown: true,
      gridData: [],
      expectedNumber: 1,
      startTime: 0,
      currentTime: 0,
      timerInterval: null,
      effectInterval: null,
      statusBarHeight: 20,
      menuButtonTop: 24,
      menuButtonHeight: 32,
      navPaddingBottom: 8,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
      icons: {
        back: "data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 height%3D%2224px%22 viewBox%3D%220 0 24 24%22 width%3D%2224px%22 fill%3D%22%23FFFFFF%22%3E%3Cpath d%3D%22M0 0h24v24H0V0z%22 fill%3D%22none%22%2F%3E%3Cpath d%3D%22M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z%22%2F%3E%3C%2Fsvg%3E",
        cross: "data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 height%3D%2224px%22 viewBox%3D%220 0 24 24%22 width%3D%2224px%22 fill%3D%22rgba(255,255,255,0.3)%22%3E%3Cpath d%3D%22M0 0h24v24H0V0z%22 fill%3D%22none%22%2F%3E%3Cpath d%3D%22M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z%22%2F%3E%3C%2Fsvg%3E"
      },
      errorCount: 0,
      lastClickTimestamp: 0,
      focusSegments: [],
      currentFocusBlock: 0,
      FOCUS_THRESHOLD: 1500, // 1.5 seconds
      mode: '',
      moduleId: '',
      config: null,
      excellentSec: 25,
      riskSec: 45
    };
  },
  onLoad(options) {
    if (options && options.mode) {
      this.mode = options.mode;
    }
    if (options && options.moduleId) {
      this.moduleId = options.moduleId;
    }
    
    // Load config based on age
    const userProfile = uni.getStorageSync('user_profile') || {};
    const age = userProfile.age || 18;
    this.config = getNormsByAge(age, 'schulte');
    
    if (this.config) {
      this.excellentSec = this.config.excellentSec || 25;
      this.riskSec = this.config.riskSec || 45;
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

    this.initGrid();
    // this.startTimer();
    // this.startRandomEffects();
  },
  onUnload() {
    this.clearTimers();
  },
  methods: {
    handleCountdownComplete() {
      this.showCountdown = false;
      this.startTimer();
      this.startRandomEffects();
    },
    goBack() {
      uni.navigateBack();
    },
    formatTime(val) {
      return val < 10 ? `0${val}` : val;
    },
    formatMs(val) {
      return val < 10 ? `0${val}` : val.toString().substring(0, 2);
    },
    getRandomHeight(n) {
      // Simulate noise bars
      return 20 + Math.random() * 40;
    },
    initGrid() {
      console.log('Schulte Grid: Initializing grid with 25 numbers');
      let numbers = Array.from({ length: 25 }, (_, i) => i + 1);
      // Fisher-Yates Shuffle
      for (let i = numbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
      }
      
      this.gridData = numbers.map(num => ({
        value: num,
        highlightType: '', // 'cyan', 'red', ''
        isBlurred: false,
        hasDot: false,
        hasSymbol: false,
        isCorrect: false,
        isWrong: false
      }));
      
      this.expectedNumber = 1;
      this.errorCount = 0;
      this.focusSegments = [];
      this.currentFocusBlock = 0;
      this.lastClickTimestamp = Date.now();
      console.log('Schulte Grid: Grid initialized, waiting for input');
    },
    startTimer() {
      console.log('Schulte Grid: Timer starting...');
      this.startTime = Date.now();
      this.timerInterval = setInterval(() => {
        const diff = Date.now() - this.startTime;
        this.minutes = Math.floor(diff / 60000);
        this.seconds = Math.floor((diff % 60000) / 1000);
        this.milliseconds = Math.floor((diff % 1000) / 10);
      }, 30); // ~30fps update
    },
    startRandomEffects() {
      // Random interference every 2-4 seconds
      const loop = () => {
        const delay = 2000 + Math.random() * 2000;
        this.effectInterval = setTimeout(() => {
          this.triggerInterference();
          loop();
        }, delay);
      };
      loop();
    },
    triggerInterference() {
      // Clear previous effects
      this.gridData.forEach(cell => {
        if (cell.value >= this.expectedNumber) { // Don't clear completed logic if needed
           cell.highlightType = '';
           cell.isBlurred = false;
           cell.hasDot = false;
           cell.hasSymbol = false;
        }
      });

      // 1. Cyan Highlight (Distraction) - 3 to 5 cells
      const cyanCount = 3 + Math.floor(Math.random() * 3);
      for(let i=0; i<cyanCount; i++) {
          this.getRandomCell().highlightType = 'cyan';
      }

      // 2. Red Highlight (Danger/Warning) - 1 cell
      if (Math.random() > 0.5) {
          this.getRandomCell().highlightType = 'red';
      }

      // 3. Blur Effect - REMOVED
      // if (Math.random() > 0.6) {
      //    this.getRandomCell().isBlurred = true;
      // }

      // 4. Red Dot Notification - 1 cell
      if (Math.random() > 0.4) {
          this.getRandomCell().hasDot = true;
      }
      
      // 5. Symbol Overlay - REMOVED
      // if (Math.random() > 0.7) {
      //    this.getRandomCell().hasSymbol = true;
      // }
    },
    getRandomCell() {
      const idx = Math.floor(Math.random() * 25);
      return this.gridData[idx];
    },
    handleCellClick(index) {
      const cell = this.gridData[index];
      const now = Date.now();
      console.log(`Schulte Grid: Cell clicked - Value: ${cell.value}, Expected: ${this.expectedNumber}`);
      
      if (cell.value === this.expectedNumber) {
        // Correct click
        console.log('Schulte Grid: Correct input');
        const interval = now - this.lastClickTimestamp;
        
        if (interval < this.FOCUS_THRESHOLD) {
          // In flow state
          this.currentFocusBlock += interval;
        } else {
          // Focus broken
          if (this.currentFocusBlock > 0) {
            this.focusSegments.push(this.currentFocusBlock);
          }
          this.currentFocusBlock = 0;
        }
        this.lastClickTimestamp = now;

        // Flash effect
        cell.isCorrect = true;
        setTimeout(() => {
          cell.isCorrect = false;
        }, 300); // Increased duration for better visibility

        this.expectedNumber++;
        if (this.expectedNumber > 25) {
          // Save the last focus block if any
          if (this.currentFocusBlock > 0) {
            this.focusSegments.push(this.currentFocusBlock);
          }
          
          setTimeout(() => {
            this.finishTest();
          }, 300);
        }
      } else {
        // Wrong click
        this.errorCount++;
        uni.vibrateShort();
        
        // Visual feedback for wrong click
        cell.isWrong = true;
        setTimeout(() => {
          cell.isWrong = false;
        }, 400);
        
        uni.showToast({ title: '专注!', icon: 'none', duration: 500 });
      }
      
      // Clear interference on click
      if (cell.hasDot || cell.highlightType || cell.isBlurred) {
        cell.hasDot = false;
        cell.highlightType = '';
        cell.isBlurred = false;
      }
    },
    finishTest() {
      console.log('Schulte Grid: Test finished, navigating to results');
      this.clearTimers();
      const timeStr = `${this.minutes}:${this.seconds}.${this.milliseconds}`;
      const totalDuration = (Date.now() - this.startTime) / 1000; // seconds
      
      // Calculate focus duration average
      let avgFocus = 0;
      if (this.focusSegments.length > 0) {
        const sum = this.focusSegments.reduce((a, b) => a + b, 0);
        avgFocus = Math.round(sum / this.focusSegments.length);
      }
      
      console.log(`Schulte Grid: Results - Errors: ${this.errorCount}, AvgFocus: ${avgFocus}ms, Duration: ${totalDuration}s`);
      
      const resultPayload = {
        metrics: {
          totalTime: totalDuration,
          errorCount: this.errorCount,
          avgFocus: avgFocus
        },
        thresholds: {
          excellentSec: this.excellentSec,
          riskSec: this.riskSec
        }
      };

      // Unified flow
      const unifiedPayload = {
          metrics: {
              totalTime: totalDuration,
              errors: this.errorCount,
              avgFocus: avgFocus
          }
      };
      
      const targetModuleId = this.moduleId || '01'; // Default to 01 if missing

      uni.navigateTo({
          url: `/pages/neural-link/result?moduleId=${targetModuleId}&testType=Schulte&data=${encodeURIComponent(JSON.stringify(unifiedPayload))}`
      });
    },
    clearTimers() {
      if (this.timerInterval) clearInterval(this.timerInterval);
      if (this.effectInterval) clearTimeout(this.effectInterval);
    }
  }
};
</script>

<style>
page {
  background-color: #050505;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.container {
  min-height: 100vh;
  background-color: #050505;
  color: white;
  display: flex;
  flex-direction: column;
  padding: 0 32rpx;
  box-sizing: border-box;
}

/* Header */
.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  background-color: rgba(5, 5, 5, 0.8);
  backdrop-filter: blur(10px);
  padding-left: 32rpx;
  padding-right: 32rpx;
  box-sizing: border-box;
}

.header-content {
  display: flex;
  align-items: center;
  position: relative;
}

.back-btn {
  width: 70rpx;
  height: 70rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transition: all 0.2s;
}

.back-btn:active {
  transform: scale(0.9);
  background: rgba(255, 255, 255, 0.2);
}

.back-arrow {
  color: #fff;
  font-size: 40rpx;
  font-weight: bold;
  line-height: 1;
  margin-bottom: 4rpx;
}

.page-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 32rpx;
  font-weight: 600;
  color: white;
  letter-spacing: 2rpx;
  margin-bottom: 0;
}

/* Timer Section */
.timer-section {
  margin-top: 200rpx; /* Space for fixed header */
  margin-bottom: 40rpx;
  display: flex;
  justify-content: center;
}

.timer-display {
  display: flex;
  align-items: baseline;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
}

.timer-main {
  font-size: 80rpx;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 0 20rpx rgba(6, 182, 212, 0.5);
  letter-spacing: 4rpx;
}

.timer-ms {
  font-size: 40rpx;
  font-weight: normal;
  color: #06b6d4; /* cyan-500 */
  margin-left: 4rpx;
}

/* Progress Section */
.progress-section {
  margin-bottom: 48rpx;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16rpx;
  font-size: 24rpx;
  color: #9ca3af; /* gray-400 */
}

.cyan-text { color: #06b6d4; font-weight: bold; }
.red-text { color: #ef4444; font-weight: bold; }

.progress-bar-bg {
  width: 100%;
  height: 8rpx;
  background-color: #1f2937; /* gray-800 */
  border-radius: 9999px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #06b6d4, #22d3ee);
  border-radius: 9999px;
  transition: width 0.3s ease;
}

/* Instruction */
.instruction-container {
  display: flex;
  justify-content: center;
  margin-bottom: 32rpx;
}

.instruction-text {
  font-size: 40rpx;
  font-weight: bold;
  color: white;
  letter-spacing: 2rpx;
}

.glitch-text {
  text-shadow: 2px 0 rgba(255,0,0,0.5), -2px 0 rgba(0,255,255,0.5);
}

/* Grid */
.grid-container {
  display: flex;
  justify-content: center;
  padding: 0 32rpx;
  margin-bottom: 48rpx;
  width: 100%;
  box-sizing: border-box;
}

.schulte-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(5, 1fr);
  gap: 16rpx;
  width: 100%;
  max-width: 686rpx;
  aspect-ratio: 1;
}

.grid-cell {
  background-color: #111;
  border: 1px solid #333;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.2s ease;
}

.cell-number {
  font-size: 36rpx;
  font-weight: bold;
  color: #e5e7eb; /* gray-200 */
}

/* Cell States */
.cell-active {
  background-color: #333;
  transform: scale(0.92);
  border-color: #555;
  box-shadow: 0 0 10rpx rgba(255, 255, 255, 0.2);
}

.cell-highlight-cyan {
  background-color: rgba(6, 182, 212, 0.2);
  border-color: #06b6d4;
  box-shadow: 0 0 15rpx rgba(6, 182, 212, 0.3);
}

.cell-highlight-red {
  background-color: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
}

.cell-blur .cell-number {
  filter: blur(4px);
  opacity: 0.5;
}

.cell-correct {
  background-color: rgba(74, 222, 128, 0.8) !important; /* Brighter green */
  border-color: #4ade80 !important;
  box-shadow: 0 0 30rpx rgba(74, 222, 128, 0.8);
  transform: scale(1.1);
  z-index: 10;
  transition: all 0.1s ease-out; /* Faster transition for pop effect */
}

.cell-correct .cell-number {
  color: #000; /* Contrast text */
  text-shadow: none;
}

.cell-wrong {
  background-color: rgba(239, 68, 68, 0.6) !important;
  border-color: #ef4444 !important;
  box-shadow: 0 0 20rpx rgba(239, 68, 68, 0.6);
  animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
  z-index: 10;
}

@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}

/* Overlays */
.red-dot {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 10rpx;
  height: 10rpx;
  background-color: #ef4444;
  border-radius: 50%;
  box-shadow: 0 0 6rpx #ef4444;
}

.symbol-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0,0,0,0.3);
  border-radius: 12rpx;
}

.symbol-icon {
  width: 40%;
  height: 40%;
  opacity: 0.5;
}

/* Footer */
.footer {
  margin-top: auto;
  padding-bottom: 48rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.noise-label {
  font-size: 20rpx;
  color: #4b5563;
}

.noise-viz {
  display: flex;
  align-items: flex-end;
  gap: 8rpx;
  height: 60rpx;
  margin-bottom: 16rpx;
}

.noise-bar {
  width: 8rpx;
  background-color: #ef4444; /* red-500 */
  border-radius: 4rpx;
  opacity: 0.6;
  animation: bounce 0.5s infinite alternate;
}

@keyframes bounce {
  from { transform: scaleY(0.8); }
  to { transform: scaleY(1.2); }
}

.warning-container {
  display: flex;
  align-items: center;
  text-align: center;
  padding: 0 32rpx;
}

.warning-prefix {
  color: #06b6d4;
  font-size: 22rpx;
  font-weight: bold;
  margin-right: 8rpx;
}

.warning-text {
  color: #9ca3af;
  font-size: 22rpx;
}
</style>
