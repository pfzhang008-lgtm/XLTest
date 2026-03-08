<template>
  <view class="container">
    <!-- Background Effects -->
    <view class="grid-bg"></view>
    <view class="scan-line"></view>

    <!-- Header -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text class="back-arrow">←</text>
      </view>
      <text class="title">记忆锚点追踪 - N-Back</text>
      <view class="placeholder"></view> <!-- Balance layout -->
    </view>

    <!-- Stats Dashboard -->
    <view class="stats-board">
      <view class="stat-card">
        <view class="stat-header">
          <image class="stat-icon" :src="icons.layers" mode="aspectFit"></image>
          <text class="stat-label">当前关卡</text>
        </view>
        <text class="stat-value">2-Back</text>
      </view>
      <view class="stat-card">
        <view class="stat-header">
          <image class="stat-icon" :src="icons.check_circle" mode="aspectFit"></image>
          <text class="stat-label">进度</text>
        </view>
        <text class="stat-value">{{ currentTrial }} / {{ maxTrials }}</text>
      </view>
    </view>

    <!-- Main Content -->
    <view class="main-content" :class="{ 'shake-animation': feedback === 'wrong' }">
      <!-- Instructions & Mode -->
      <view class="instruction-area">
        <view class="mode-tag" :class="modeClass">
          <view class="ping-dot">
            <view class="ping-ring"></view>
            <view class="ping-core"></view>
          </view>
          <text>{{ modeText }}</text>
        </view>
        <view class="instruction-text">
          <text>判断当前亮起的方块位置</text>
          <text>与 <text class="highlight">【上上个】</text> 信号是否一致？</text>
        </view>
      </view>

      <!-- The Grid -->
      <view class="grid-container">
        <!-- Decorative Corners -->
        <view class="corner tl"></view>
        <view class="corner tr"></view>
        <view class="corner bl"></view>
        <view class="corner br"></view>

        <view class="grid-box">
          <view 
            v-for="(item, index) in 9" 
            :key="index"
            class="grid-cell"
            :class="{ 'active-cell': currentActiveIndex === index }"
          >
            <view v-if="currentActiveIndex === index" class="active-inner">
              <view class="pulse-ring"></view>
              <view class="center-dot"></view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- Feedback Text -->
      <view class="feedback-container" v-if="feedbackText">
        <text class="feedback-text" :class="feedback">{{ feedbackText }}</text>
      </view>
    </view>

    <!-- Controls -->
    <view class="controls-footer">
      <button 
        class="match-btn"
        :class="{ 'btn-disabled': isObservationMode, 'btn-success': feedback === 'correct', 'btn-error': feedback === 'wrong' }"
        @click="handleMatch"
        :disabled="isObservationMode"
        hover-class="btn-hover"
      >
        <view class="btn-glow"></view>
        <view class="btn-content">
          <image class="btn-icon" :src="icons.fingerprint" mode="aspectFit"></image>
          <text class="btn-text">匹配 (MATCH)</text>
        </view>
      </button>
      
    </view>
    
    <!-- Countdown Overlay -->
    <CountdownOverlay 
      v-if="showCountdown" 
      @complete="handleCountdownComplete" 
    />
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getNormsByAge } from '@/utils/testConfigManager.js';
import CountdownOverlay from '@/components/CountdownOverlay.vue';

// --- Icons (Static Files) ---
const icons = {
  arrow_back: '/static/icon-arrow-back.svg',
  layers: '/static/icon-layers.svg',
  check_circle: '/static/icon-check-circle.svg',
  fingerprint: '/static/icon-fingerprint.svg',
  close: '/static/icon-close.svg'
};

// Config state
const config = ref(null);
const activeModuleId = ref('');
const step = ref(1);
const N = ref(2); // N-Back level
const intervalMs = ref(2000);
const displayMs = ref(500);
const maxTrials = ref(25);

const currentActiveIndex = ref(-1);
const history = ref([]); // Queue of indices
const currentTrial = ref(0);
const score = ref(0); // Hits
const falseAlarms = ref(0);
const misses = ref(0);
const correctRejections = ref(0); // Track correct rejections for accuracy calc

const feedback = ref(null); // 'correct', 'wrong', null
const feedbackText = ref('');
const isGameActive = ref(false);
const showCountdown = ref(true);

let sequenceTimer = null;
let currentRoundMatchPressed = false;

// --- Computed ---
const isObservationMode = computed(() => history.value.length <= N.value);

const modeText = computed(() => {
  return isObservationMode.value ? '观察模式 (Observation)' : '判断模式 (Judgment)';
});

const modeClass = computed(() => {
  return isObservationMode.value ? 'mode-observation' : 'mode-judgment';
});

const progressPercent = computed(() => {
  return Math.min(100, (currentTrial.value / maxTrials.value) * 100);
});

// --- Lifecycle ---
onLoad((options) => {
  // 1. Try options
  if (options && options.moduleId) {
    activeModuleId.value = options.moduleId;
    console.log('N-Back: Set activeModuleId from options:', activeModuleId.value);
  }
  
  if (options && options.step) {
    const parsedStep = parseInt(options.step);
    if (!isNaN(parsedStep)) {
      step.value = parsedStep;
      console.log('N-Back: Set step from options:', step.value);
    } else {
       console.warn('N-Back: Invalid step option, defaulting to 1');
       step.value = 1;
    }
  }

  // 2. Fallback to GlobalData
  if (!activeModuleId.value) {
     const app = getApp();
     if (app && app.globalData && app.globalData.activeModuleId) {
       activeModuleId.value = app.globalData.activeModuleId;
       console.warn('N-Back: Recovered activeModuleId from GlobalData:', activeModuleId.value);
       
       if (app.globalData.activeStep) {
         const globalStep = parseInt(app.globalData.activeStep);
         if (!isNaN(globalStep)) {
           step.value = globalStep;
           console.warn('N-Back: Recovered step from GlobalData:', step.value);
         }
       }
     }
  }

  // 2.1 Fallback to Storage (Most robust)
  if (!activeModuleId.value) {
    const lastId = uni.getStorageSync('last_active_module_id');
    if (lastId) {
      activeModuleId.value = lastId;
      console.warn('N-Back: Recovered activeModuleId from Storage:', activeModuleId.value);
      
      const lastStep = uni.getStorageSync('last_active_step');
      if (lastStep) {
        const storedStep = parseInt(lastStep);
        if (!isNaN(storedStep)) {
          step.value = storedStep;
          console.warn('N-Back: Recovered step from Storage:', step.value);
        }
      }
    }
  }

  // 3. Final Check
  if (!activeModuleId.value) {
    console.error('N-Back: Critical Error - No moduleId found');
    uni.showModal({
      title: '参数丢失',
      content: '测试模块ID丢失，无法保存进度。请返回重新进入。',
      showCancel: false,
      success: () => uni.navigateBack()
    });
    return;
  }

  const userProfile = uni.getStorageSync('user_profile') || {};
  const age = userProfile.age || 18;
  config.value = getNormsByAge(age, 'nback');
  
  if (config.value) {
    N.value = config.value.level || 2;
    maxTrials.value = config.value.totalTrials || 25;
    displayMs.value = config.value.displayMs || 1500;
    intervalMs.value = config.value.intervalMs || 2000;
  }
});

onMounted(() => {
  // startGame(); // Wait for countdown
});

onUnmounted(() => {
  clearTimeout(sequenceTimer);
});

// --- Game Logic ---
const handleCountdownComplete = () => {
  showCountdown.value = false;
  startGame();
};

const startGame = () => {
  console.log('N-Back: Game Started');
  isGameActive.value = true;
  currentTrial.value = 0;
  score.value = 0;
  falseAlarms.value = 0;
  misses.value = 0;
  correctRejections.value = 0;
  history.value = [];
  currentActiveIndex.value = -1;
  
  // Start sequence
  nextStep();
};

const endGame = () => {
  console.log('N-Back: Game Ended');
  clearTimeout(sequenceTimer);
  isGameActive.value = false;
  currentActiveIndex.value = -1;
  
  try {
    uni.showLoading({ title: '保存中...', mask: true });
    
    // Calculate accuracy: (Hits + Correct Rejections) / Total Judgments
    // Total Judgments = maxTrials - N (since first N are observation)
    const totalJudgments = Math.max(1, maxTrials.value - N.value);
    
    const accuracy = (score.value + correctRejections.value) / totalJudgments;

    const resultPayload = {
      metrics: {
        totalTrials: maxTrials.value,
        level: N.value,
        hits: score.value,
        falseAlarms: falseAlarms.value,
        misses: misses.value,
        correctRejections: correctRejections.value,
        accuracy: accuracy
      },
      thresholds: {
        excellentAccuracy: config.value ? config.value.excellentAccuracy : 0.8,
        riskAccuracy: config.value ? config.value.riskAccuracy : 0.5
      }
    };

    // Save result and return to briefing
    if (activeModuleId.value) {
      // Ensure step is a valid number
      let currentStepNum = parseInt(step.value);
      if (isNaN(currentStepNum)) {
        console.warn('N-Back: currentStep is NaN, defaulting to 1');
        currentStepNum = 1;
      }

      const dataKey = `module_${activeModuleId.value}_step_${currentStepNum}_data`;
      const stepKey = `module_${activeModuleId.value}_current_step`;
      const nextStep = currentStepNum + 1;
      
      console.log(`[N-Back] Saving results to ${dataKey}`);
      uni.setStorageSync(dataKey, resultPayload);
      uni.setStorageSync(stepKey, nextStep);
    } else {
      console.warn('N-Back: No moduleId found, skipping data save');
    }

    uni.hideLoading();
    uni.showToast({
      title: '测试完成',
      icon: 'success',
      duration: 1500
    });
  } catch (error) {
    console.error('N-Back: Error in endGame:', error);
    uni.hideLoading();
    uni.showToast({
      title: '完成',
      icon: 'none'
    });
  }

  setTimeout(() => {
            console.log('N-Back: Navigating back...');
            const pages = getCurrentPages();
            if (pages.length > 1) {
              uni.navigateBack();
            } else if (activeModuleId.value) {
              uni.redirectTo({
                url: `/pages/assessment/briefing?moduleId=${activeModuleId.value}`
              });
            } else {
              uni.reLaunch({ url: '/pages/index/index' });
            }
          }, 1500);
};

const nextStep = () => {
  if (!isGameActive.value) return;

  // Process previous step results (if not observation mode)
  const historyLen = history.value.length;
  if (historyLen > N.value) {
    // Check if user missed a match in the PREVIOUS step
    // The previous step index was history[historyLen - 1]
    // The target for that step was history[historyLen - 1 - N]
    const prevIndex = history.value[historyLen - 1];
    const prevTarget = history.value[historyLen - 1 - N.value];
    
    if (prevIndex === prevTarget) {
      // It was a match target
      if (!currentRoundMatchPressed) {
        // User didn't press match -> Miss
        misses.value++;
        // Optional: Feedback for miss?
      }
    } else {
      // It was NOT a match target
      if (!currentRoundMatchPressed) {
        // User didn't press match -> Correct Rejection
        correctRejections.value++;
      }
    }
  }

  // Check for end of game
  if (currentTrial.value >= maxTrials.value) {
    endGame();
    return;
  }

  // Reset per-round state
  currentRoundMatchPressed = false;
  feedback.value = null;
  feedbackText.value = '';

  // Determine next index
  let nextIndex;
  
  // Target Probability logic
  // We want to ensure enough targets appear. ~30% chance.
  // Only applicable if we have enough history to form a match (historyLen >= N)
  const canFormMatch = historyLen >= N.value;
  
  if (canFormMatch && Math.random() < 0.3) {
    nextIndex = history.value[historyLen - N.value];
  } else {
    // Random other index
    do {
      nextIndex = Math.floor(Math.random() * 9);
    } while (canFormMatch && nextIndex === history.value[historyLen - N.value] && Math.random() > 0.1); 
  }

  // Update history
  history.value.push(nextIndex);
  currentTrial.value++;
  
  // Flash square
  currentActiveIndex.value = nextIndex;
  
  // Schedule hide
  setTimeout(() => {
    currentActiveIndex.value = -1;
  }, displayMs.value);
  
  // Schedule next step (Display Time + Interval Time)
  // Wait: The requirement says "图片消失后的黑屏间隔时间：改为 config.intervalMs".
  // So total cycle = displayMs + intervalMs
  sequenceTimer = setTimeout(nextStep, displayMs.value + intervalMs.value);
};

const handleMatch = () => {
  if (!isGameActive.value || isObservationMode.value || currentRoundMatchPressed) return;
  console.log('N-Back: User clicked match button');
  
  currentRoundMatchPressed = true;
  
  const historyLen = history.value.length;
  // Current index displayed is history[historyLen - 1]
  const currentIndex = history.value[historyLen - 1];
  // Target is N steps back: history[historyLen - 1 - N]
  const targetIndex = history.value[historyLen - 1 - N.value];

  if (currentIndex === targetIndex) {
    // Hit (Correct)
    console.log('N-Back: Match Result - Correct');
    score.value++;
    triggerFeedback('correct');
  } else {
    // False Alarm (Wrong)
    console.log('N-Back: Match Result - Wrong');
    falseAlarms.value++;
    triggerFeedback('wrong');
  }
};

const triggerFeedback = (type) => {
  feedback.value = type;
  if (type === 'correct') {
    feedbackText.value = '+1';
  } else {
    feedbackText.value = 'MISS'; // Using 'MISS' text for error, though strictly it's an error
    uni.vibrateShort();
  }
  
  // Reset visual feedback after short delay
  setTimeout(() => {
    feedback.value = null;
    feedbackText.value = '';
  }, 500);
};

const goBack = () => {
  console.log('N-Back: User clicked back button');
  uni.navigateBack();
};
</script>

<style scoped>
/* Theme Colors */
:root {
  --primary: #0da6f2;
  --bg-dark: #101c22;
  --neon-green: #4ade80;
  --neon-red: #ef4444;
  --neon-orange: #f97316;
}

.container {
  min-height: 100vh;
  background-color: #05070A;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: 'Noto Sans SC', sans-serif;
}

/* Background Effects */
.grid-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: linear-gradient(to right, rgba(30, 41, 59, 0.5) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(30, 41, 59, 0.5) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
  z-index: 0;
}

.scan-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 20px;
  background: linear-gradient(to bottom, transparent, rgba(13, 166, 242, 0.1), transparent);
  animation: scan 4s linear infinite;
  pointer-events: none;
  z-index: 1;
}

@keyframes scan {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100vh); }
}

/* Header */
.header {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 44px 20px 20px; /* Adjust for status bar */
}

.back-btn {
  width: 70rpx;
  height: 70rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-arrow {
  color: #fff;
  font-size: 40rpx;
  font-weight: bold;
  line-height: 1;
}

/* Icons */
.icon-img {
  width: 24px;
  height: 24px;
}

.stat-icon {
  width: 16px;
  height: 16px;
}

.btn-icon {
  width: 28px;
  height: 28px;
}

.btn-icon-sm {
  width: 20px;
  height: 20px;
}

.title {
  font-size: 18px;
  font-weight: bold;
  color: #fff;
}

.placeholder {
  width: 40px;
}

/* Stats Dashboard */
.stats-board {
  position: relative;
  z-index: 10;
  display: flex;
  gap: 16px;
  padding: 0 20px;
  margin-bottom: 24px;
}

.stat-card {
  flex: 1;
  background: rgba(16, 28, 34, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(13, 166, 242, 0.2);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 6px;
}

.text-primary { color: #0da6f2; }
.text-green { color: #4ade80; }

.stat-label {
  font-size: 12px;
  color: #94a3b8;
  text-transform: uppercase;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #fff;
  font-family: monospace;
}

/* Main Content */
.main-content {
  position: relative;
  z-index: 10;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  gap: 24px;
}

.shake-animation {
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}

@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}

/* Instructions */
.instruction-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.mode-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
  border: 1px solid;
}

.mode-observation {
  background: rgba(13, 166, 242, 0.1);
  border-color: rgba(13, 166, 242, 0.2);
  color: #0da6f2;
}

.mode-judgment {
  background: rgba(249, 115, 22, 0.1);
  border-color: rgba(249, 115, 22, 0.3);
  color: #f97316;
}

.ping-dot {
  position: relative;
  width: 8px;
  height: 8px;
}

.ping-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.75;
  animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.ping-core {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: currentColor;
}

@keyframes ping {
  75%, 100% { transform: scale(2); opacity: 0; }
}

.instruction-text {
  text-align: center;
  font-size: 16px;
  color: #e2e8f0;
  line-height: 1.5;
}

.highlight {
  color: #0da6f2;
  font-weight: bold;
}

/* Grid */
.grid-container {
  width: 320px;
  height: 320px;
  position: relative;
  padding: 4px;
  border: 1px solid rgba(13, 166, 242, 0.3);
  border-radius: 16px;
  background: #101c22;
  box-shadow: 0 0 40px -10px rgba(13, 166, 242, 0.3);
}

.corner {
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid #0da6f2;
}

.tl { top: -1px; left: -1px; border-right: none; border-bottom: none; border-top-left-radius: 8px; }
.tr { top: -1px; right: -1px; border-left: none; border-bottom: none; border-top-right-radius: 8px; }
.bl { bottom: -1px; left: -1px; border-right: none; border-top: none; border-bottom-left-radius: 8px; }
.br { bottom: -1px; right: -1px; border-left: none; border-top: none; border-bottom-right-radius: 8px; }

.grid-box {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 8px;
  width: 100%;
  height: 100%;
  padding: 8px;
  box-sizing: border-box;
}

.grid-cell {
  background: rgba(16, 28, 34, 0.8);
  border: 1px solid rgba(51, 65, 85, 0.5);
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  box-shadow: inset 0 0 15px rgba(13, 166, 242, 0.05);
}

.active-cell {
  background-color: rgba(13, 166, 242, 0.2);
  border-color: #0da6f2;
  box-shadow: 0 0 20px rgba(13, 166, 242, 0.6), inset 0 0 10px rgba(13, 166, 242, 0.4);
}

.active-inner {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pulse-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(13, 166, 242, 0.1);
  animation: pulse 2s infinite;
}

.center-dot {
  width: 8px;
  height: 8px;
  background: #0da6f2;
  border-radius: 50%;
  box-shadow: 0 0 10px #0da6f2;
}

@keyframes pulse {
  50% { opacity: .5; }
}

/* Controls */
.controls-footer {
  position: relative;
  z-index: 10;
  padding: 24px;
  padding-bottom: 40px;
  background: linear-gradient(to top, #101c22, rgba(16, 28, 34, 0.95), transparent);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.match-btn {
  width: 100%;
  height: 80px;
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  background: rgba(13, 166, 242, 0.2);
  border: 1px solid rgba(13, 166, 242, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-glow {
  position: absolute;
  inset: 0;
  background: rgba(13, 166, 242, 0.2);
  filter: blur(20px);
}

.btn-content {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(to bottom, rgba(13, 166, 242, 0.8), #0da6f2);
  width: 100%;
  height: 100%;
  justify-content: center;
}

.btn-text {
  color: white;
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 1px;
}

.btn-disabled {
  opacity: 0.5;
  filter: grayscale(1);
}

.btn-success .btn-content {
  background: linear-gradient(to bottom, rgba(74, 222, 128, 0.8), #4ade80);
}

.btn-error .btn-content {
  background: linear-gradient(to bottom, rgba(239, 68, 68, 0.8), #ef4444);
}

.btn-hover {
  transform: scale(0.98);
}

.feedback-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 20;
}

.feedback-text {
  font-size: 48px;
  font-weight: bold;
  text-shadow: 0 0 20px currentColor;
  animation: floatUp 0.5s ease-out forwards;
}

.correct { color: #4ade80; }
.wrong { color: #ef4444; }

@keyframes floatUp {
  0% { transform: translateY(0) scale(0.5); opacity: 0; }
  50% { opacity: 1; transform: translateY(-20px) scale(1.2); }
  100% { transform: translateY(-50px) scale(1); opacity: 0; }
}
</style>