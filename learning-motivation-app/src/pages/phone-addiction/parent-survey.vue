<template>
  <view class="container theme-neuro-sync">
    <!-- Navbar -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="back-btn" @click="goBack">
        <text class="back-arrow">←</text>
      </view>
      <text class="nav-title">家长观察问卷</text>
    </view>

    <!-- Main Content Area -->
    <view class="content-area">
      
      <!-- Progress Header -->
      <view v-if="!isLoading" class="progress-header fade-in">
        <text class="progress-label">[系统诊断中]</text>
        <text class="progress-value">进度: <text class="cyan-text">{{ currentQuestionIndex + 1 }}</text>/{{ totalQuestions }}</text>
        <view class="progress-bar-bg">
          <view class="progress-bar-fill" :style="{ width: progressPercent + '%' }"></view>
        </view>
      </view>

      <!-- Question Card (Transition Wrapper) -->
      <view class="card-container" v-if="!isLoading">
        <transition name="slide" mode="out-in">
          <view :key="currentQuestion.id" class="question-card glass-panel">
            <view class="question-header">
              <text class="question-id">Q{{ currentQuestion.id }}</text>
              <view class="question-decoration"></view>
            </view>
            
            <text class="question-text">{{ currentQuestion.text }}</text>
            
            <view class="options-list">
              <view 
                v-for="(option, index) in currentQuestion.options" 
                :key="option.id"
                class="option-item"
                :class="{ 'option-active': selectedOptionId === option.id }"
                @click="handleSelect(option)"
                hover-class="option-hover"
                :hover-stay-time="100"
              >
                <view class="option-marker">
                  <text class="option-letter">{{ option.id }}</text>
                </view>
                <text class="option-text">{{ option.text }}</text>
                <view v-if="selectedOptionId === option.id" class="option-glow"></view>
              </view>
            </view>
          </view>
        </transition>
      </view>

      <!-- Fake Loading Screen -->
      <view v-else class="loading-screen fade-in">
        <view class="loading-content">
          <view class="loader-glitch">
            <view class="glitch-box"></view>
            <view class="glitch-box"></view>
            <view class="glitch-box"></view>
          </view>
          <text class="loading-text glitch-text">{{ loadingMessage }}</text>
          <view class="loading-sub">SYSTEM PROCESSING...</view>
        </view>
      </view>

    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import surveyData from '../../data/survey_esports.json';

// State
const statusBarHeight = ref(20);
const questions = ref(surveyData);
const currentQuestionIndex = ref(0);
const answers = ref({});
const isLoading = ref(false);
const loadingMessage = ref('');
const selectedOptionId = ref(null);
const isTransitioning = ref(false);

// Computed
const totalQuestions = computed(() => questions.value.length);
const currentQuestion = computed(() => questions.value[currentQuestionIndex.value] || {});
const progressPercent = computed(() => ((currentQuestionIndex.value + 1) / totalQuestions.value) * 100);

// Lifecycle
onMounted(() => {
  const sysInfo = uni.getSystemInfoSync();
  statusBarHeight.value = sysInfo.statusBarHeight || 20;
});

// Methods
const goBack = () => {
  uni.navigateBack();
};

const handleSelect = (option) => {
  if (isTransitioning.value) return;
  
  // 1. Visual Feedback
  selectedOptionId.value = option.id;
  isTransitioning.value = true;
  
  // Record Answer
  answers.value[currentQuestion.value.id] = option.type;
  
  // Haptic Feedback
  uni.vibrateShort();

  // 2. Delay for Animation
  setTimeout(() => {
    if (currentQuestionIndex.value < totalQuestions.value - 1) {
      // Next Question
      currentQuestionIndex.value++;
      selectedOptionId.value = null;
      isTransitioning.value = false;
    } else {
      // Finish -> Loading Screen
      startFakeLoading();
    }
  }, 300); // 300ms delay matches requirement
};

const startFakeLoading = () => {
  isLoading.value = true;
  const messages = [
    "正在整合多维硬件测算数据...",
    "正在解析家庭行为观察量表...",
    "正在执行系统级交叉比对...",
    "生成临床诊断档案..."
  ];
  
  let msgIndex = 0;
  loadingMessage.value = messages[0];
  
  const interval = setInterval(() => {
    msgIndex++;
    if (msgIndex < messages.length) {
      loadingMessage.value = messages[msgIndex];
      uni.vibrateShort(); // Haptic tick for effect
    } else {
      clearInterval(interval);
      finishSurvey();
    }
  }, 1000); // 1s per message
};

const finishSurvey = () => {
  // Navigate to Result Page (Mock)
  // In a real app, you would pass answers via query params or global state
  // For now, we go back or to a result page if it exists. 
  // User asked to "emit event or route to ResultPage".
  // Assuming a generic result page or back for now.
  
  uni.showToast({
    title: '诊断完成',
    icon: 'success',
    duration: 2000
  });
  
  setTimeout(() => {
    uni.navigateBack();
  }, 1000);
};
</script>

<style scoped>
/* Theme: NEURO_SYNC (Dark Slate + Cyan) */
.theme-neuro-sync {
  background-color: #0f172a; /* Dark Slate */
  color: #e2e8f0; /* Light Slate */
  font-family: 'Inter', sans-serif;
}

.container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

/* Navbar */
.nav-bar {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  background-color: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(10px);
  z-index: 100;
  border-bottom: 1px solid rgba(34, 211, 238, 0.1);
}

.back-btn {
  width: 70rpx;
  height: 70rpx;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.back-arrow {
  color: #fff;
  font-size: 40rpx;
  font-weight: bold;
  line-height: 1;
}

.nav-title {
  font-size: 32rpx;
  font-weight: 600;
  letter-spacing: 1px;
  color: #fff;
}

/* Content Area */
.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px;
  position: relative;
}

/* Progress Header */
.progress-header {
  margin-bottom: 32px;
}

.progress-label {
  font-size: 24rpx;
  color: #64748b;
  letter-spacing: 2px;
  display: block;
  margin-bottom: 4px;
}

.progress-value {
  font-size: 28rpx;
  font-weight: 600;
  color: #94a3b8;
  display: block;
  margin-bottom: 12px;
}

.cyan-text {
  color: #22d3ee;
}

.progress-bar-bg {
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: #22d3ee;
  box-shadow: 0 0 10px rgba(34, 211, 238, 0.5);
  transition: width 0.3s ease;
}

/* Card Container */
.card-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.question-card {
  width: 100%;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border-radius: 24px;
  padding: 32px;
  position: absolute; /* Essential for transition overlap */
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.glass-panel {
  /* Additional glass effect if needed */
}

.question-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.question-id {
  font-size: 48rpx;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.1);
  font-family: monospace;
}

.question-decoration {
  width: 40px;
  height: 2px;
  background: #22d3ee;
  box-shadow: 0 0 8px #22d3ee;
}

.question-text {
  font-size: 36rpx;
  font-weight: 600;
  line-height: 1.5;
  color: #fff;
  margin-bottom: 40px;
  display: block;
}

/* Options */
.options-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.option-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.option-hover {
  background: rgba(255, 255, 255, 0.08);
}

.option-active {
  background: rgba(34, 211, 238, 0.1);
  border-color: #22d3ee;
  box-shadow: 0 0 15px rgba(34, 211, 238, 0.2);
}

.option-marker {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-weight: 700;
  font-size: 24rpx;
  color: #94a3b8;
}

.option-active .option-marker {
  background: #22d3ee;
  color: #0f172a;
}

.option-text {
  font-size: 28rpx;
  color: #cbd5e1;
}

.option-active .option-text {
  color: #fff;
  font-weight: 500;
}

.option-glow {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: radial-gradient(circle at center, rgba(34, 211, 238, 0.1) 0%, transparent 70%);
  pointer-events: none;
}

/* Transitions */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(100rpx) scale(0.95);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-100rpx) scale(0.95);
}

/* Loading Screen */
.loading-screen {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.loader-glitch {
  display: flex;
  gap: 8px;
  margin-bottom: 32px;
}

.glitch-box {
  width: 12px;
  height: 12px;
  background: #22d3ee;
  animation: pulse 1s infinite alternate;
}

.glitch-box:nth-child(2) { animation-delay: 0.2s; }
.glitch-box:nth-child(3) { animation-delay: 0.4s; }

.loading-text {
  font-size: 32rpx;
  color: #fff;
  font-weight: 600;
  margin-bottom: 8px;
  min-height: 48rpx; /* Prevent layout shift */
}

.loading-sub {
  font-size: 24rpx;
  color: #22d3ee;
  letter-spacing: 2px;
  opacity: 0.7;
}

.fade-in {
  animation: fadeIn 0.5s ease;
}

@keyframes pulse {
  0% { opacity: 0.3; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1); box-shadow: 0 0 10px #22d3ee; }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>