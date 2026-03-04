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
          <text class="stat-label">剩余扫描时间</text>
        </view>
        <text class="stat-value">{{ timeLeft }}s</text>
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
      
      <!-- Secondary Action (Visual only as per requirements) -->
      <button class="no-match-btn" hover-class="btn-hover-secondary">
        <image class="btn-icon-sm" :src="icons.close" mode="aspectFit"></image>
        <text class="btn-sub">不匹配</text>
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

// --- Icons (Data URIs) ---
const icons = {
  arrow_back: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22white%22%3E%3Cpath d%3D%22M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z%22%2F%3E%3C%2Fsvg%3E',
  layers: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22%230da6f2%22%3E%3Cpath d%3D%22M11.99 18.54l-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27-7.38 5.74zM12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27L12 16z%22%2F%3E%3C%2Fsvg%3E',
  check_circle: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22%234ade80%22%3E%3Cpath d%3D%22M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z%22%2F%3E%3C%2Fsvg%3E',
  fingerprint: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22white%22%3E%3Cpath d%3D%22M17.81 4.47c-.08 0-.16-.02-.23-.06C15.66 3.42 14 3 12.01 3c-1.98 0-3.86.47-5.57 1.41-.24.13-.54.04-.68-.2-.13-.24-.04-.55.2-.68C7.82 2.52 9.86 2 12.01 2c2.13 0 3.99.47 6.03 1.52.25.13.34.43.21.67-.09.18-.26.28-.44.28zM3.5 9.72c-.1 0-.2-.03-.29-.09-.23-.16-.28-.47-.12-.7.99-1.4 2.25-2.5 3.75-3.27C9.98 4.04 14 4.03 17.15 5.65c1.5.77 2.76 1.86 3.75 3.25.16.22.11.54-.12.7-.23.16-.54.11-.7-.12-.9-1.26-2.04-2.25-3.39-2.94-2.87-1.47-6.54-1.47-9.4.01-1.36.7-2.5 1.7-3.4 2.96-.08.14-.23.21-.39.21zm6.25 12.07c-.13 0-.26-.05-.35-.15-.87-.87-1.34-1.43-2.01-2.64-.69-1.23-1.05-2.73-1.05-4.34 0-2.97 2.54-5.39 5.66-5.39s5.66 2.42 5.66 5.39c0 .28-.22.5-.5.5s-.5-.22-.5-.5c0-2.42-2.09-4.39-4.66-4.39-2.57 0-4.66 1.97-4.66 4.39 0 1.44.32 2.77.93 3.85.64 1.15 1.08 1.64 1.85 2.42.19.2.19.51 0 .71-.11.1-.24.15-.37.15zm7.17-1.85c-1.19 0-2.24-.3-3.1-.89-1.49-1.01-2.38-2.65-2.38-4.39 0-.28.22-.5.5-.5s.5.22.5.5c0 1.41.72 2.74 1.94 3.56.71.48 1.54.71 2.54.71.24 0 .64-.03 1.04-.1.27-.05.53.13.58.41.05.27-.13.53-.41.58-.57.11-1.07.12-1.21.12zM14.91 22c-.04 0-.09-.01-.13-.02-1.59-.44-2.63-1.03-3.72-2.1-1.4-1.39-2.17-3.24-2.17-5.22 0-1.62 1.38-2.94 3.08-2.94 1.7 0 3.08 1.32 3.08 2.94 0 1.07.93 1.94 2.08 1.94.17 0 .24-.01.39-.03.27-.05.53.13.58.41.05.27-.13.53-.41.58-.3.05-.66.09-1.14.09-1.7 0-3.08-1.32-3.08-2.94 0-1.07-.93-1.94-2.08-1.94-1.15 0-2.08.87-2.08 1.94 0 1.71.66 3.31 1.87 4.51.95.94 1.86 1.46 3.27 1.85.27.07.42.35.35.61-.05.23-.26.38-.47.38z%22%2F%3E%3C%2Fsvg%3E',
  close: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22%23cbd5e1%22%3E%3Cpath d%3D%22M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z%22%2F%3E%3C%2Fsvg%3E'
};

const N = 2; // N-Back level
const INTERVAL_MS = 2000;
const FLASH_DURATION_MS = 500;
const TOTAL_TIME = 60;

const currentActiveIndex = ref(-1);
const history = ref([]); // Queue of indices
const timeLeft = ref(TOTAL_TIME);
const score = ref(0);
const feedback = ref(null); // 'correct', 'wrong', null
const feedbackText = ref('');
const isGameActive = ref(false);

let gameTimer = null;
let sequenceTimer = null;
let flashTimer = null;
let currentRoundMatchPressed = false;

// --- Computed ---
const isObservationMode = computed(() => history.value.length <= N);

const modeText = computed(() => {
  return isObservationMode.value ? '观察模式 (Observation)' : '判断模式 (Judgment)';
});

const modeClass = computed(() => {
  return isObservationMode.value ? 'mode-observation' : 'mode-judgment';
});

// --- Game Logic ---
const startGame = () => {
  isGameActive.value = true;
  timeLeft.value = TOTAL_TIME;
  score.value = 0;
  history.value = [];
  currentActiveIndex.value = -1;
  
  // Start countdown
  gameTimer = setInterval(() => {
    timeLeft.value--;
    if (timeLeft.value <= 0) {
      endGame();
    }
  }, 1000);

  // Start sequence
  nextStep();
  sequenceTimer = setInterval(nextStep, INTERVAL_MS);
};

const endGame = () => {
  clearInterval(gameTimer);
  clearInterval(sequenceTimer);
  clearTimeout(flashTimer);
  isGameActive.value = false;
  currentActiveIndex.value = -1;
  
  uni.showLoading({ title: '生成脑部扫描报告...', mask: true });
  setTimeout(() => {
    uni.hideLoading();
    uni.redirectTo({ url: '/pages/neural-link/nback-result' });
  }, 1500);
};

const nextStep = () => {
  // Reset per-round state
  currentRoundMatchPressed = false;
  feedback.value = null;
  feedbackText.value = '';

  // Determine next index
  let nextIndex;
  const historyLen = history.value.length;
  
  // Target Probability: ~30% match chance if we have enough history
  if (historyLen >= N && Math.random() < 0.3) {
    nextIndex = history.value[historyLen - N];
  } else {
    // Random other index (try to avoid accidental match to keep probability clean, but simple random is usually fine)
    do {
      nextIndex = Math.floor(Math.random() * 9);
    } while (historyLen >= N && nextIndex === history.value[historyLen - N] && Math.random() > 0.1); // Small chance to allow accidental random match
  }

  // Update history
  history.value.push(nextIndex);
  
  // Flash square
  currentActiveIndex.value = nextIndex;
  
  // Turn off after duration
  flashTimer = setTimeout(() => {
    currentActiveIndex.value = -1;
  }, FLASH_DURATION_MS);
};

const handleMatch = () => {
  if (!isGameActive.value || isObservationMode.value || currentRoundMatchPressed) return;
  
  currentRoundMatchPressed = true;
  
  // Logic: Check if current step matches N steps ago
  // Note: history has already been pushed with the current index in nextStep()
  // So current index is history[history.length - 1]
  // Target index is history[history.length - 1 - N]
  
  const historyLen = history.value.length;
  if (historyLen <= N) return; // Should be covered by isObservationMode but safety check

  const currentIndex = history.value[historyLen - 1];
  const targetIndex = history.value[historyLen - 1 - N];

  if (currentIndex === targetIndex) {
    // Hit (Correct)
    score.value++;
    triggerFeedback('correct');
  } else {
    // False Alarm (Wrong)
    triggerFeedback('wrong');
  }
};

const triggerFeedback = (type) => {
  feedback.value = type;
  if (type === 'correct') {
    feedbackText.value = '+1';
  } else {
    feedbackText.value = 'MISS';
    uni.vibrateShort();
  }
  
  // Reset visual feedback after short delay
  setTimeout(() => {
    feedback.value = null;
    feedbackText.value = '';
  }, 500);
};

const goBack = () => {
  uni.navigateBack();
};

// --- Lifecycle ---
onMounted(() => {
  startGame();
});

onUnmounted(() => {
  clearInterval(gameTimer);
  clearInterval(sequenceTimer);
  clearTimeout(flashTimer);
});
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

.no-match-btn {
  width: 100%;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid #334155;
  border-radius: 12px;
}

.btn-sub {
  color: #cbd5e1;
  font-size: 14px;
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