<template>
  <view class="container" :class="{ 'glitch-active': feedback === 'false-alarm' }">
    <!-- Background Elements -->
    <view class="radar-grid"></view>
    <view class="scan-line"></view>
    
    <!-- Glitch Overlay -->
    <view v-if="feedback === 'false-alarm'" class="glitch-overlay">
      <text class="glitch-text" data-text="SYSTEM OVERRIDE">SYSTEM OVERRIDE</text>
      <text class="glitch-sub">禁止操作盟友信号</text>
    </view>

    <!-- Header -->
    <view class="header">
      <view class="header-top">
        <view class="back-btn" @click="goBack">
          <text class="back-arrow">←</text>
        </view>
        <view class="status-icon">
          <view class="radar-ping"></view>
        </view>
        <view class="header-info">
          <text class="header-title">系统扫描中</text>
          <text class="header-sub">LIVE FEED // SART-01</text>
        </view>
        <view class="exit-btn" @click="quitTest">
          <text>终止</text>
        </view>
      </view>
      
      <!-- Progress Bar -->
      <view class="progress-section">
        <view class="progress-label">
          <text>剩余时间</text>
          <text :class="{ 'text-red': timeLeft < 10 }">{{ timeLeft }}s</text>
        </view>
        <view class="progress-track">
          <view class="progress-fill" :style="{ width: progressPercentage + '%' }"></view>
        </view>
      </view>
    </view>

    <!-- Main Radar Scope (Center) -->
    <view class="radar-scope">
      <!-- Radar Rings -->
      <view class="ring ring-1"></view>
      <view class="ring ring-2"></view>
      <view class="ring ring-3"></view>
      
      <!-- Crosshairs -->
      <view class="axis axis-x"></view>
      <view class="axis axis-y"></view>
      
      <!-- Sweeping Line -->
      <view class="radar-sweep"></view>

      <!-- Stimulus Display Area -->
      <view class="stimulus-container">
        <transition name="scale-fade">
          <view v-if="isVisible && currentStimulus" class="stimulus-icon-wrapper" :class="currentStimulus">
            <!-- Threat Icon (Red Triangle) -->
            <image v-if="currentStimulus === 'threat'" class="stimulus-img" :src="icons.threat" mode="aspectFit"></image>
            
            <!-- Ally Icon (Green Circle) -->
            <image v-if="currentStimulus === 'ally'" class="stimulus-img" :src="icons.ally" mode="aspectFit"></image>
            
            <text class="stimulus-label">
              {{ currentStimulus === 'threat' ? '威胁目标' : '盟友信号' }}
            </text>
          </view>
        </transition>
      </view>
      
      <!-- Decor Labels -->
      <text class="decor-label top">N-12.55</text>
      <text class="decor-label bottom">S-44.02</text>
      <text class="decor-label left">W-88</text>
      <text class="decor-label right">E-09</text>
    </view>

    <!-- Feedback Indicator (Center Bottom) -->
    <view class="feedback-area">
      <text v-if="feedback === 'hit'" class="feedback-text text-green">目标捕获 [CAPTURED]</text>
      <text v-if="feedback === 'miss'" class="feedback-text text-yellow">目标丢失 [MISSED]</text>
      <text v-else class="feedback-text placeholder">检测到目标：<text class="highlight-red">A类</text></text>
      <text class="instruction-text">点击下方扫描区域进行拦截</text>
    </view>

    <!-- Interaction Area (Bottom) -->
    <view 
      class="interaction-zone"
      @touchstart="handleTap"
      :class="{ 'zone-active': isPressed }"
      @touchend="isPressed = false"
    >
      <view class="btn-panel">
        <view class="btn-icon-box">
          <image class="btn-icon" :src="icons.fingerprint" mode="aspectFit"></image>
          <view class="scan-beam"></view>
        </view>
        <view class="btn-text-group">
          <text class="btn-main-text">启动拦截扫描</text>
          <text class="btn-sub-text">等待输入中...</text>
        </view>
        <image class="arrow-icon" :src="icons.chevron_right" mode="aspectFit"></image>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

// --- Icons (Data URIs) ---
const icons = {
  threat: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22%23ef4444%22%3E%3Cpath d%3D%22M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z%22%2F%3E%3C%2Fsvg%3E',
  ally: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22%234ade80%22%3E%3Cpath d%3D%22M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z%22%2F%3E%3C%2Fsvg%3E',
  fingerprint: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22%23ef4444%22%3E%3Cpath d%3D%22M17.81 4.47c-.08 0-.16-.02-.23-.06C15.66 3.42 14 3 12.01 3c-1.98 0-3.86.47-5.57 1.41-.24.13-.54.04-.68-.2-.13-.24-.04-.55.2-.68C7.82 2.52 9.86 2 12.01 2c2.13 0 3.99.47 6.03 1.52.25.13.34.43.21.67-.09.18-.26.28-.44.28zM3.5 9.72c-.1 0-.2-.03-.29-.09-.23-.16-.28-.47-.12-.7.99-1.4 2.25-2.5 3.75-3.27C9.98 4.04 14 4.03 17.15 5.65c1.5.77 2.76 1.86 3.75 3.25.16.22.11.54-.12.7-.23.16-.54.11-.7-.12-.9-1.26-2.04-2.25-3.39-2.94-2.87-1.47-6.54-1.47-9.4.01-1.36.7-2.5 1.7-3.4 2.96-.08.14-.23.21-.39.21zm6.25 12.07c-.13 0-.26-.05-.35-.15-.87-.87-1.34-1.43-2.01-2.64-.69-1.23-1.05-2.73-1.05-4.34 0-2.97 2.54-5.39 5.66-5.39s5.66 2.42 5.66 5.39c0 .28-.22.5-.5.5s-.5-.22-.5-.5c0-2.42-2.09-4.39-4.66-4.39-2.57 0-4.66 1.97-4.66 4.39 0 1.44.32 2.77.93 3.85.64 1.15 1.08 1.64 1.85 2.42.19.2.19.51 0 .71-.11.1-.24.15-.37.15zm7.17-1.85c-1.19 0-2.24-.3-3.1-.89-1.49-1.01-2.38-2.65-2.38-4.39 0-.28.22-.5.5-.5s.5.22.5.5c0 1.41.72 2.74 1.94 3.56.71.48 1.54.71 2.54.71.24 0 .64-.03 1.04-.1.27-.05.53.13.58.41.05.27-.13.53-.41.58-.57.11-1.07.12-1.21.12zM14.91 22c-.04 0-.09-.01-.13-.02-1.59-.44-2.63-1.03-3.72-2.1-1.4-1.39-2.17-3.24-2.17-5.22 0-1.62 1.38-2.94 3.08-2.94 1.7 0 3.08 1.32 3.08 2.94 0 1.07.93 1.94 2.08 1.94.17 0 .24-.01.39-.03.27-.05.53.13.58.41.05.27-.13.53-.41.58-.3.05-.66.09-1.14.09-1.7 0-3.08-1.32-3.08-2.94 0-1.07-.93-1.94-2.08-1.94-1.15 0-2.08.87-2.08 1.94 0 1.71.66 3.31 1.87 4.51.95.94 1.86 1.46 3.27 1.85.27.07.42.35.35.61-.05.23-.26.38-.47.38z%22%2F%3E%3C%2Fsvg%3E',
  chevron_right: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22%237f1d1d%22%3E%3Cpath d%3D%22M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z%22%2F%3E%3C%2Fsvg%3E'
};

// --- Game Constants ---
const TOTAL_TIME = 90;
const STIMULUS_DURATION = 800;
const MIN_ISI = 1200;
const MAX_ISI = 2500;
const THREAT_PROBABILITY = 0.85;

// --- State ---
const timeLeft = ref(TOTAL_TIME);
const isGameActive = ref(false);
const progressPercentage = computed(() => (timeLeft.value / TOTAL_TIME) * 100);

const currentStimulus = ref(null); // 'threat' | 'ally' | null
const isVisible = ref(false);
const hasActed = ref(false);
const feedback = ref(null); // 'hit' | 'miss' | 'false-alarm' | null
const isPressed = ref(false);

// Metrics
const metrics = ref({
  hits: 0,
  omissions: 0, // Inattention
  falseAlarms: 0, // Impulsivity
  correctRejections: 0
});

// Timers
let gameTimer = null;
let stimulusTimer = null;
let isiTimer = null;
let feedbackTimer = null;

// --- Lifecycle ---
onMounted(() => {
  startGame();
});

onUnmounted(() => {
  stopAllTimers();
});

// --- Game Logic ---
const startGame = () => {
  resetState();
  isGameActive.value = true;
  
  // Main countdown
  gameTimer = setInterval(() => {
    timeLeft.value--;
    if (timeLeft.value <= 0) {
      endGame();
    }
  }, 1000);
  
  // Start first round
  scheduleNextRound();
};

const resetState = () => {
  timeLeft.value = TOTAL_TIME;
  metrics.value = { hits: 0, omissions: 0, falseAlarms: 0, correctRejections: 0 };
  currentStimulus.value = null;
  isVisible.value = false;
  hasActed.value = false;
  feedback.value = null;
};

const stopAllTimers = () => {
  clearInterval(gameTimer);
  clearTimeout(stimulusTimer);
  clearTimeout(isiTimer);
  clearTimeout(feedbackTimer);
};

const scheduleNextRound = () => {
  const isi = Math.floor(Math.random() * (MAX_ISI - MIN_ISI + 1)) + MIN_ISI;
  isiTimer = setTimeout(() => {
    showStimulus();
  }, isi);
};

const showStimulus = () => {
  if (!isGameActive.value) return;
  
  // Determine Type
  const isThreat = Math.random() < THREAT_PROBABILITY;
  currentStimulus.value = isThreat ? 'threat' : 'ally';
  
  isVisible.value = true;
  hasActed.value = false;
  feedback.value = null; // Clear previous feedback
  
  // Auto-hide after duration
  stimulusTimer = setTimeout(() => {
    hideStimulus();
  }, STIMULUS_DURATION);
};

const hideStimulus = () => {
  isVisible.value = false;
  
  // Check for Omission (Threat appeared, user did nothing)
  if (currentStimulus.value === 'threat' && !hasActed.value) {
    metrics.value.omissions++;
    feedback.value = 'miss'; // Optional: show miss feedback
    clearFeedbackAfterDelay();
  } else if (currentStimulus.value === 'ally' && !hasActed.value) {
    metrics.value.correctRejections++;
  }
  
  currentStimulus.value = null;
  
  if (isGameActive.value) {
    scheduleNextRound();
  }
};

const handleTap = () => {
  isPressed.value = true;
  if (!isGameActive.value) return;
  
  // If tap happens when no stimulus is visible, we generally ignore it in simple SART, 
  // or count as separate impulsivity. For this spec, only 'Ally' taps are explicitly punished.
  // But if the user taps LATE (after stimulus hidden), it might be an error. 
  // For simplicity, we only judge taps while stimulus is visible.
  
  if (!isVisible.value) return;
  if (hasActed.value) return; // Prevent double taps
  
  hasActed.value = true;
  
  if (currentStimulus.value === 'threat') {
    // HIT (Correct)
    metrics.value.hits++;
    feedback.value = 'hit';
    // Subtle positive feedback?
    // Could add sound here if audio context available
  } else if (currentStimulus.value === 'ally') {
    // FALSE ALARM (Impulsivity) - PUNISHMENT
    metrics.value.falseAlarms++;
    feedback.value = 'false-alarm';
    triggerPunishment();
  }
  
  clearFeedbackAfterDelay();
};

const triggerPunishment = () => {
  // Haptic
  uni.vibrateShort();
  // Visuals handled by template based on feedback === 'false-alarm'
};

const clearFeedbackAfterDelay = () => {
  clearTimeout(feedbackTimer);
  feedbackTimer = setTimeout(() => {
    feedback.value = null;
  }, 1000);
};

const endGame = () => {
  stopAllTimers();
  isGameActive.value = false;
  
  uni.showLoading({ title: '生成专注力报告...', mask: true });
  setTimeout(() => {
    uni.hideLoading();
    uni.redirectTo({ url: '/pages/neural-link/sart-result' });
  }, 1500);
};

const quitTest = () => {
  stopAllTimers();
  uni.navigateBack();
};
</script>

<style scoped>
/* Theme Colors */
:root {
  --bg-dark: #0f1115;
  --radar-red: #ef4444;
  --radar-green: #4ade80;
  --radar-dim: rgba(239, 68, 68, 0.2);
}

.container {
  min-height: 100vh;
  background-color: #0f1115;
  color: #fff;
  font-family: 'Noto Sans SC', sans-serif;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

/* Background */
.radar-grid {
  position: absolute; inset: 0;
  background-image: 
    linear-gradient(rgba(239, 68, 68, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(239, 68, 68, 0.05) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
}
.scan-line {
  position: absolute; top: 0; left: 0; right: 0; height: 100vh;
  background: linear-gradient(to bottom, transparent, rgba(239, 68, 68, 0.05), transparent);
  animation: scan 4s linear infinite;
  pointer-events: none;
}
@keyframes scan { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }

/* Header */
.header {
  padding: 44px 20px 20px;
  z-index: 10;
}
.back-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.back-arrow {
  color: #fff;
  font-size: 36rpx;
  font-weight: bold;
}

.header-top {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}
.status-icon { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; position: relative; }
.radar-ping {
  width: 100%; height: 100%;
  border: 2px solid #ef4444;
  border-radius: 50%;
  position: relative;
}
.radar-ping::after {
  content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: 40%; height: 40%; background: #ef4444; border-radius: 50%;
  animation: ping 1.5s infinite;
}
@keyframes ping { 0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; } 100% { transform: translate(-50%, -50%) scale(2); opacity: 0; } }

.header-info { flex: 1; margin-left: 12px; }
.header-title { font-size: 20px; font-weight: bold; display: block; }
.header-sub { font-size: 10px; color: #00f0ff; letter-spacing: 2px; }
.exit-btn { font-size: 14px; color: #9ca3af; padding: 4px 8px; }

.progress-section { margin-top: 10px; }
.progress-label { display: flex; justify-content: space-between; font-size: 12px; color: #9ca3af; margin-bottom: 4px; }
.text-red { color: #ef4444; font-weight: bold; animation: pulse-fast 0.5s infinite; }
.progress-track { height: 4px; background: rgba(255, 255, 255, 0.1); border-radius: 2px; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(to right, #ef4444, #00f0ff); transition: width 1s linear; }

/* Radar Scope */
.radar-scope {
  position: relative;
  width: 300px; height: 300px;
  margin: 20px auto;
  display: flex; align-items: center; justify-content: center;
}
.ring {
  position: absolute; border-radius: 50%; border: 1px dashed rgba(239, 68, 68, 0.3);
  top: 50%; left: 50%; transform: translate(-50%, -50%);
}
.ring-1 { width: 100px; height: 100px; }
.ring-2 { width: 200px; height: 200px; opacity: 0.6; }
.ring-3 { width: 300px; height: 300px; opacity: 0.3; border-style: solid; }

.axis { position: absolute; background: rgba(239, 68, 68, 0.2); }
.axis-x { top: 50%; left: 0; width: 100%; height: 1px; }
.axis-y { top: 0; left: 50%; width: 1px; height: 100%; }

.radar-sweep {
  position: absolute; top: 50%; left: 50%; width: 150px; height: 150px;
  background: conic-gradient(from 0deg, transparent 270deg, rgba(239, 68, 68, 0.4));
  transform-origin: top left;
  animation: sweep 4s linear infinite;
  border-radius: 0 0 150px 0; /* Quarter circle shape hack or just mask */
  /* Better sweep implementation */
  width: 150px; height: 150px;
  background: linear-gradient(90deg, transparent, rgba(239, 68, 68, 0.1));
  transform-origin: 0 0;
  animation: radar-spin 3s linear infinite;
  clip-path: polygon(0 0, 100% 0, 100% 100%);
}
@keyframes radar-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.decor-label { position: absolute; font-size: 10px; color: #00f0ff; background: #0f1115; padding: 2px; }
.top { top: -10px; } .bottom { bottom: -10px; } .left { left: -20px; top: 50%; } .right { right: -20px; top: 50%; }

/* Stimulus */
.stimulus-container {
  position: relative; z-index: 20;
  width: 120px; height: 120px;
  display: flex; align-items: center; justify-content: center;
}
.stimulus-icon-wrapper {
  display: flex; flex-direction: column; align-items: center;
  animation: popIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.stimulus-img { width: 80px; height: 80px; margin-bottom: 8px; filter: drop-shadow(0 0 10px currentColor); }
.threat .stimulus-img { color: #ef4444; }
.ally .stimulus-img { color: #4ade80; }
.stimulus-label { font-size: 14px; font-weight: bold; letter-spacing: 1px; }
.threat .stimulus-label { color: #ef4444; text-shadow: 0 0 5px #ef4444; }
.ally .stimulus-label { color: #4ade80; text-shadow: 0 0 5px #4ade80; }

@keyframes popIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.scale-fade-enter-active, .scale-fade-leave-active { transition: all 0.2s; }
.scale-fade-enter-from, .scale-fade-leave-to { opacity: 0; transform: scale(0.5); }

/* Feedback Area */
.feedback-area {
  text-align: center; height: 60px; display: flex; flex-direction: column; justify-content: center;
  margin-bottom: 20px;
}
.feedback-text { font-size: 16px; font-weight: bold; display: block; margin-bottom: 4px; }
.text-green { color: #4ade80; }
.text-yellow { color: #facc15; }
.placeholder { color: #9ca3af; font-size: 14px; }
.highlight-red { color: #ef4444; font-weight: bold; }
.instruction-text { font-size: 12px; color: #6b7280; }

/* Interaction Zone */
.interaction-zone {
  flex: 1;
  margin: 0 20px 30px;
  background: linear-gradient(180deg, rgba(239, 68, 68, 0.05) 0%, rgba(239, 68, 68, 0.1) 100%);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.1s;
  position: relative; overflow: hidden;
}
.zone-active {
  background: rgba(239, 68, 68, 0.2);
  transform: scale(0.98);
  border-color: rgba(239, 68, 68, 0.6);
}
.btn-panel { display: flex; align-items: center; gap: 16px; pointer-events: none; }
.btn-icon-box {
  width: 64px; height: 64px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid rgba(239, 68, 68, 0.3);
  position: relative;
  overflow: hidden;
}
.btn-icon { width: 32px; height: 32px; opacity: 0.8; }
.scan-beam {
  position: absolute; top: 0; left: 0; width: 100%; height: 2px;
  background: #ef4444;
  box-shadow: 0 0 8px #ef4444;
  animation: beam-scan 1.5s linear infinite;
}
@keyframes beam-scan { 0% { top: 0; opacity: 0; } 50% { opacity: 1; } 100% { top: 100%; opacity: 0; } }

.btn-text-group { display: flex; flex-direction: column; }
.btn-main-text { font-size: 20px; font-weight: bold; color: #fff; }
.btn-sub-text { font-size: 12px; color: #00f0ff; letter-spacing: 1px; }
.arrow-icon { width: 24px; height: 24px; opacity: 0.5; }

/* Glitch Overlay */
.glitch-active {
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}
.glitch-overlay {
  position: absolute; inset: 0; z-index: 999;
  background: rgba(239, 68, 68, 0.2);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  pointer-events: none;
  mix-blend-mode: hard-light;
}
.glitch-text {
  font-size: 32px; font-weight: 900; color: #fff;
  text-shadow: 2px 2px #ff0000, -2px -2px #0000ff;
  animation: glitch-skew 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite;
}
.glitch-sub {
  color: #fff; font-size: 14px; background: #ef4444; padding: 2px 8px; margin-top: 8px;
}

@keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }
@keyframes glitch-skew { 0% { transform: skew(0deg); } 20% { transform: skew(-20deg); } 40% { transform: skew(10deg); } 60% { transform: skew(-5deg); } 80% { transform: skew(5deg); } 100% { transform: skew(0deg); } }
@keyframes pulse-fast { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

</style>