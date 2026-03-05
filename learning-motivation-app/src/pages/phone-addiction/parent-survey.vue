<template>
  <view class="container theme-neuro-sync">
    <!-- Navbar -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="back-btn" @click="goBack">
        <text class="back-arrow">←</text>
      </view>
      <text class="nav-title">家长观察问卷 (升级版)</text>
    </view>

    <!-- Main Content Area -->
    <view class="content-area">
      
      <!-- Progress Header -->
      <view class="progress-header fade-in">
        <text class="progress-label">[系统诊断中]</text>
        <text class="progress-value">进度: <text class="cyan-text">{{ currentQuestionIndex + 1 }}</text>/{{ totalQuestions }}</text>
        <view class="progress-bar-bg">
          <view class="progress-bar-fill" :style="{ width: progressPercent + '%' }"></view>
        </view>
      </view>

      <!-- Question Card (Transition Wrapper) -->
      <view class="card-container">
        <transition name="slide" mode="out-in">
          <view :key="currentQuestion.id" class="question-card glass-panel" v-if="currentQuestion.id">
            <view class="question-header">
              <text class="question-id">Q{{ currentQuestionIndex + 1 }}</text>
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
          <view v-else class="error-state">
            <text class="error-text">题目加载失败，请检查数据源</text>
            <text class="debug-info">Total: {{ totalQuestions }}</text>
          </view>
        </transition>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import surveyData from '../../data/survey_esports.json';

// State
const statusBarHeight = ref(20);
// Extract questions array from the new JSON structure
const questions = ref([]); 
const currentQuestionIndex = ref(0);
const answers = ref({});
const selectedOptionId = ref(null);
const isTransitioning = ref(false);

// Computed
const totalQuestions = computed(() => questions.value.length);
const currentQuestion = computed(() => questions.value[currentQuestionIndex.value] || {});
const progressPercent = computed(() => {
  if (totalQuestions.value === 0) return 0;
  return ((currentQuestionIndex.value + 1) / totalQuestions.value) * 100;
});

// Lifecycle
onMounted(() => {
  console.log('[ParentSurvey] onMounted started');
  const sysInfo = uni.getSystemInfoSync();
  statusBarHeight.value = sysInfo.statusBarHeight || 20;
  
  // Data Loading with detailed logging
  console.log('[ParentSurvey] Raw surveyData:', surveyData);
  if (surveyData && surveyData.questions) {
    questions.value = surveyData.questions;
    console.log('[ParentSurvey] Questions loaded:', questions.value.length);
  } else {
    console.error('[ParentSurvey] Invalid surveyData structure');
    // Fallback/Mock data if json fails
    questions.value = [
      {
        "id": "q1",
        "text": "数据加载异常，这是备用题目：孩子是否在无法玩游戏时表现出烦躁？",
        "options": [
          { "id": "A", "type": "NORMAL", "text": "从不" },
          { "id": "B", "type": "PATHOLOGY", "text": "经常" }
        ]
      }
    ];
  }
});

// Methods
const goBack = () => {
  uni.navigateBack();
};

const handleSelect = (option) => {
  if (isTransitioning.value) return;
  
  console.log('[Interaction] Option selected:', option.id, option.type);
  
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
      // Finish immediately
      finishSurvey();
    }
  }, 300); 
};

const finishSurvey = () => {
  console.log('[ParentSurvey] Survey finished. Answers:', answers.value);
  uni.showToast({
    title: '评估完成',
    icon: 'success',
    duration: 1500
  });
  
  setTimeout(() => {
    uni.navigateBack();
  }, 1500);
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
  align-items: flex-start; /* Changed from center to flex-start to utilize top space */
  justify-content: center;
  position: relative;
  width: 100%;
  padding: 0 16px 32px 16px; /* Added bottom padding */
  box-sizing: border-box;
}

.question-card {
  width: 100%;
  min-height: 60vh; /* Ensure card takes up significant vertical space */
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  margin: 0 auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.question-text {
  font-size: 36rpx; /* Increased font size */
  font-weight: 600;
  line-height: 1.6;
  margin-bottom: 48px; /* Increased spacing */
  color: #fff;
  flex: 1; /* Allow text area to expand */
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