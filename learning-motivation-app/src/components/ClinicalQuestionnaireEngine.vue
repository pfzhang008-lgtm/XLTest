<template>
  <view class="clinical-engine theme-neuro-sync">
    <!-- Navbar -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="back-btn" @click="goBack">
        <text class="back-arrow">←</text>
      </view>
      <text class="nav-title">{{ surveyData?.title || '评估问卷' }}</text>
    </view>

    <!-- Main Content Area -->
    <view class="content-area">
      
      <!-- LOADING STATE (Psychological Trick) -->
      <view v-if="isAnalyzing" class="analyzing-container fade-in">
        <view class="scanner-visual">
          <view class="scan-line"></view>
          <view class="brain-mesh"></view>
        </view>
        <text class="loading-text glitch-effect">{{ loadingText }}</text>
        <view class="loading-bar">
          <view class="loading-progress"></view>
        </view>
      </view>

      <!-- SURVEY STATE -->
      <block v-else>
        <!-- Description / Header Info -->
        <view class="survey-info fade-in" v-if="currentQuestionIndex === 0 && !hasStarted">
           <text class="survey-desc">{{ surveyData?.description }}</text>
           <button class="start-btn" @click="startSurvey">开始评估</button>
        </view>

        <block v-else>
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
              <view :key="currentQuestion.id" class="question-card glass-panel" v-if="currentQuestion && currentQuestion.id">
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
                <text class="error-text">题目加载失败</text>
              </view>
            </transition>
          </view>
        </block>
      </block>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';

const props = defineProps({
  surveyData: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['finish', 'back']);

// State
const statusBarHeight = ref(20);
const questions = ref([]); 
const currentQuestionIndex = ref(0);
const answers = ref({});
const selectedOptionId = ref(null);
const isTransitioning = ref(false);
const hasStarted = ref(true); // Auto-start for now to match previous behavior, or set to false to show description first

// Fake Loading State
const isAnalyzing = ref(false);
const loadingText = ref('正在整合多维硬件测算数据...');

// Computed
const totalQuestions = computed(() => questions.value.length);
const currentQuestion = computed(() => questions.value[currentQuestionIndex.value] || {});
const progressPercent = computed(() => {
  if (totalQuestions.value === 0) return 0;
  return ((currentQuestionIndex.value + 1) / totalQuestions.value) * 100;
});

// Watch for data changes
watch(() => props.surveyData, (newVal) => {
  if (newVal && newVal.questions) {
    questions.value = newVal.questions;
    currentQuestionIndex.value = 0;
    answers.value = {};
    isAnalyzing.value = false;
  }
}, { immediate: true });

// Lifecycle
onMounted(() => {
  const sysInfo = uni.getSystemInfoSync();
  statusBarHeight.value = sysInfo.statusBarHeight || 20;
});

// Methods
const goBack = () => {
  emit('back');
};

const startSurvey = () => {
  hasStarted.value = true;
};

const handleSelect = (option) => {
  if (isTransitioning.value || isAnalyzing.value) return;
  
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
      // Finish - Directly emit results without fake loading
      emit('finish', answers.value);
    }
  }, 300); 
};
</script>

<style scoped>
/* Theme: NEURO_SYNC (Dark Slate + Cyan) */
.theme-neuro-sync {
  background-color: #0f172a; /* Dark Slate */
  color: #e2e8f0; /* Light Slate */
  font-family: 'Inter', sans-serif;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
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
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  flex: 1;
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
  align-items: flex-start;
  justify-content: center;
  position: relative;
  width: 100%;
  padding: 0 16px 32px 16px;
  box-sizing: border-box;
}

.question-card {
  width: 100%;
  min-height: 60vh;
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
  line-height: 1.6;
  margin-bottom: 48px;
  color: #fff;
  flex: 1;
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

/* Analyzing State */
.analyzing-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.scanner-visual {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 2px solid rgba(34, 211, 238, 0.3);
  position: relative;
  margin-bottom: 32px;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(34, 211, 238, 0.1);
}

.scan-line {
  width: 100%;
  height: 4px;
  background: #22d3ee;
  box-shadow: 0 0 10px #22d3ee;
  position: absolute;
  top: 0;
  animation: scan 2s linear infinite;
}

@keyframes scan {
  0% { top: 0%; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}

.loading-text {
  font-size: 32rpx;
  color: #22d3ee;
  text-align: center;
  margin-bottom: 24px;
  font-family: monospace;
  min-height: 48px;
}

.loading-bar {
  width: 200px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.loading-progress {
  height: 100%;
  background: #22d3ee;
  width: 100%;
  animation: progress 4s linear forwards;
}

@keyframes progress {
  0% { width: 0%; }
  100% { width: 100%; }
}

/* Transitions */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(50px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-50px);
}

.fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>