<template>
  <view class="container">
    <!-- Navbar -->
    <view class="custom-nav" :style="{ paddingTop: menuButtonTop + 'px', paddingBottom: navPaddingBottom + 'px' }">
      <view class="nav-back" :style="{ height: menuButtonHeight + 'px', width: menuButtonHeight + 'px' }" @click="goBack">
        <text class="back-arrow">←</text>
      </view>
      <text class="nav-title">家长观察问卷</text>
    </view>

    <!-- Content Area -->
    <view class="content-area" :style="{ paddingTop: contentPaddingTop + 'px' }">
      
      <!-- Step 1: Age Selection (REMOVED - Auto-detected from profile) -->
      <!-- 
      <view v-if="currentStep === 'age'" class="age-selection">
         ... code removed ...
      </view>
      -->

      <!-- Step 2: Survey Questions -->
      <view v-if="currentStep === 'survey'" class="survey-container">
        <!-- Progress Bar -->
        <view class="progress-header">
          <text class="progress-text">问题 {{ currentQuestionIndex + 1 }} / {{ questions.length }}</text>
          <view class="progress-track">
            <view class="progress-fill" :style="{ width: progressPercentage + '%' }"></view>
          </view>
        </view>

        <!-- Question Card -->
        <view class="question-card glass-card">
          <view class="question-header">
            <text class="question-tag">{{ currentQuestion.dimension }}</text>
          </view>
          <text class="question-text">{{ currentQuestion.text }}</text>
        </view>

        <!-- Options List -->
        <view class="options-list">
          <view 
            class="option-item glass-card" 
            :class="{ 'option-selected': isSelected(option) }"
            v-for="(option, index) in currentQuestion.options" 
            :key="index"
            hover-class="option-hover"
            @click="selectOption(option)"
          >
            <view class="option-content">
              <text class="option-label">{{ option.label }}</text>
            </view>
            <view class="option-radio">
              <view class="radio-inner"></view>
            </view>
          </view>
        </view>
        
        <!-- Navigation Actions -->
        <view class="nav-actions" v-if="currentQuestionIndex > 0">
           <view class="prev-btn" hover-class="btn-hover" @click="prevQuestion">
             <text>上一题</text>
           </view>
        </view>
      </view>

      <!-- Step 3: Handover -->
      <view v-if="currentStep === 'handover'" class="handover-container">
        <view class="status-indicator">
          <image class="success-icon" src="data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEyIDIyQzE3LjUyMjggMjIgMjIgMTcuNTIyOCAyMiAxMkMyMiA2LjQ3NzE1IDE3LjUyMjggMiAxMiAyQzYuNDc3MTUgMiAyIDYuNDc3MTUgMiAxMkMyIDE3LjUyMjggNi40NzcxNSAyMiAxMiAyMloiIHN0cm9rZT0iIzI1ZjRmNCIgc3Ryb2tlLXdpZHRoPSIyIi8+PHBhdGggZD0iTTcgMTIuNUwxMC41IDE2TDE3IDgiIHN0cm9rZT0iIzI1ZjRmNCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=" />
          <text class="status-code">[ MODULE 01 COMPLETE ]</text>
          <text class="main-title">监护人主诉已归档</text>
        </view>
        
        <view class="warning-panel">
          <view class="panel-header">
            <text class="warning-icon">⚠</text>
            <text class="panel-title">手机移交注意事项</text>
          </view>
          <view class="panel-body">
            <text class="desc-line">接下来的神经动力学测试必须由 <text class="highlight-child">受测者本人独立完成</text>。</text>
            <text class="desc-line sub-desc">请确保受测者处于无干扰环境，减少诊断报告失真。</text>
          </view>
        </view>

        <button class="cyber-btn" hover-class="btn-hover" @click="startChildTest">
          <text> 确认移交设备 </text>
        </button>
      </view>

    </view>
  </view>
</template>

<script>
import surveyEsports from '../../data/survey_esports.json';
import surveyVideoFog from '../../data/survey_video_fog.json';
import surveyAcademic from '../../data/survey_academic_focus.json';
import surveyExam from '../../data/survey_exam_anxiety.json';
import surveyMindset from '../../data/survey_study_mindset.json';

const surveyMap = {
  '01': surveyEsports,
  '02': surveyVideoFog,
  '03': surveyAcademic,
  '04': surveyExam,
  '05': surveyMindset
};

export default {
  data() {
    return {
      moduleId: '01',
      statusBarHeight: 20,
      menuButtonTop: 24,
      menuButtonHeight: 32,
      navPaddingBottom: 8,
      contentPaddingTop: 100,
      
      currentStep: 'loading', // loading, survey, handover
      currentPipelineStep: 1,
      ageGroup: '', // low_age, high_age
      questions: [],
      currentQuestionIndex: 0,
      answers: {},
      totalScore: 0,
      
      // Current survey data object
      currentSurveyData: null,
      
      // Embedded SVGs for icons
      icons: {
        handover: '../../static/icons/handover.png'
      }
    };
  },
  computed: {
    currentQuestion() {
      return this.questions[this.currentQuestionIndex] || {};
    },
    progressPercentage() {
      if (this.questions.length === 0) return 0;
      return ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
    }
  },
  onLoad(options) {
    if (options && options.moduleId) {
      this.moduleId = options.moduleId;
    }
    if (options && options.step) {
      this.currentPipelineStep = parseInt(options.step);
    }
    
    // Select Survey Data based on Module ID
    this.currentSurveyData = surveyMap[this.moduleId] || surveyEsports; // Fallback to 01
    console.log(`[ParentSurvey] Loaded survey for Module ${this.moduleId}:`, this.currentSurveyData.title);
    
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

    this.contentPaddingTop = this.menuButtonTop + this.menuButtonHeight + this.navPaddingBottom + 20;
    
    // Load User Profile for Age
    const userProfile = uni.getStorageSync('user_profile');
    console.log('[ParentSurvey] Loading profile:', userProfile);
    
    if (userProfile && userProfile.age) {
      const age = userProfile.age;
      
      // Determine age group (low_age: <=12, high_age: >12)
      if (typeof age === 'string' && age.startsWith('age_')) {
        this.ageGroup = (age === 'age_6_9' || age === 'age_10_12') ? 'low_age' : 'high_age';
      } else {
        const numericAge = parseInt(age);
        this.ageGroup = numericAge <= 12 ? 'low_age' : 'high_age';
      }
      
      console.log(`[ParentSurvey] Auto-detected age group: ${this.ageGroup} (Age: ${age})`);
      
      // Load questions immediately
      this.loadQuestions(this.ageGroup);
    } else {
      console.warn('[ParentSurvey] Profile missing or invalid age. Redirecting to calibration.');
      uni.showToast({
        title: '需完善基础档案',
        icon: 'none'
      });
      setTimeout(() => {
        // Use redirectTo to avoid stacking on top of survey page if possible, or just navigate
        uni.navigateTo({ url: '/pages/onboarding/calibration' });
      }, 1500);
    }
  },
  methods: {
    loadQuestions(group) {
      if (this.currentSurveyData && this.currentSurveyData.versions && this.currentSurveyData.versions[group]) {
        this.questions = this.currentSurveyData.versions[group].questions;
        this.currentStep = 'survey';
        this.currentQuestionIndex = 0;
      } else {
        console.error('Survey data not found for group:', group);
        uni.showToast({ title: '数据加载错误', icon: 'none' });
      }
    },
    goBack() {
      if (this.currentStep === 'survey') {
        // Confirm exit if in survey
        uni.showModal({
          title: '退出问卷？',
          content: '当前进度将丢失，确定要返回吗？',
          success: (res) => {
            if (res.confirm) {
              uni.navigateBack();
            }
          }
        });
      } else if (this.currentStep === 'handover') {
         // Handover state - prevent back simply
         uni.showToast({ title: '请开始测试', icon: 'none' });
      } else {
        uni.navigateBack();
      }
    },
    // selectAge method removed - age is auto-detected
    isSelected(option) {
      if (!this.currentQuestion) return false;
      const qId = this.currentQuestion.id;
      const answer = this.answers[qId];
      // Compare label as it is unique within options
      return answer && answer.label === option.label;
    },
    selectOption(option) {
      console.log('Selected option:', option);
      // Record answer
      const qId = this.currentQuestion.id;
      // Store complete option info for report
      this.answers[qId] = {
        score: option.score,
        label: option.label,
        dimension: this.currentQuestion.dimension
      };
      // Total score is calculated at finish to allow re-answering

      // Next Question or Finish
      if (this.currentQuestionIndex < this.questions.length - 1) {
        setTimeout(() => {
          this.currentQuestionIndex++;
        }, 200); // Slight delay for visual feedback
      } else {
        this.finishSurvey();
      }
    },
    prevQuestion() {
      if (this.currentQuestionIndex > 0) {
        this.currentQuestionIndex--;
      }
    },
    finishSurvey() {
      // Calculate total score dynamically
      this.totalScore = Object.values(this.answers).reduce((sum, item) => sum + item.score, 0);
      console.log('Survey finished. Total score:', this.totalScore);
      
      // Save results locally
      const resultData = {
        moduleId: this.moduleId,
        surveyId: this.currentSurveyData.surveyId,
        ageGroup: this.ageGroup,
        answers: this.answers,
        totalScore: this.totalScore,
        timestamp: new Date().getTime()
      };
      
      uni.setStorageSync('parent_survey_result', resultData); // Legacy support
      uni.setStorageSync('module_' + this.moduleId + '_survey_data', resultData); // New standard for reset


      // Move to handover step
      this.currentStep = 'handover';
    },
    startChildTest() {
      console.log('Starting child test sequence...');
      
      // Cache completion status
      uni.setStorageSync('module_' + this.moduleId + '_survey_completed', true);
      
      // Update pipeline step
      const nextStep = this.currentPipelineStep + 1;
      uni.setStorageSync(`module_${this.moduleId}_current_step`, nextStep);
      console.log(`[ParentSurvey] Pipeline advanced to step ${nextStep}`);
      
      uni.showToast({
        title: '问卷已完成',
        icon: 'success',
        duration: 1500
      });

      // Navigate back to Briefing Page to continue flow
      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
    }
  }
};
</script>

<style>
/* Base Layout */
.container {
  min-height: 100vh;
  background-color: #050505; /* Deep Black Background */
  color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

/* Navbar */
.custom-nav {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  background: rgba(5, 5, 5, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.nav-back {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 16px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.back-arrow {
  color: #fff;
  font-size: 18px;
  font-weight: bold;
}

.nav-title {
  margin-left: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}

/* Content Area */
.content-area {
  padding-left: 20px;
  padding-right: 20px;
  padding-bottom: 40px;
}

/* Section Titles */
.section-title {
  display: block;
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 8px;
}

.section-subtitle {
  display: block;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 30px;
}

/* Glass Card Style */
.glass-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

/* Survey Container */
.progress-header {
  margin-bottom: 24px;
}

.progress-text {
  font-size: 12px;
  color: rgba(37, 244, 244, 0.8);
  margin-bottom: 8px;
  display: block;
}

.progress-track {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #25f4f4;
  transition: width 0.3s ease;
  box-shadow: 0 0 8px rgba(37, 244, 244, 0.5);
}

.question-card {
  padding: 24px;
  margin-bottom: 24px;
  min-height: 120px;
  display: flex;
  flex-direction: column;
}

.question-header {
  margin-bottom: 12px;
}

.question-tag {
  display: inline-block;
  padding: 4px 10px;
  background: rgba(37, 244, 244, 0.1);
  border: 1px solid rgba(37, 244, 244, 0.3);
  color: #25f4f4;
  font-size: 10px;
  border-radius: 4px;
  text-transform: uppercase;
}

.question-text {
  font-size: 18px;
  line-height: 1.5;
  font-weight: 500;
  color: #fff;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-item {
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s ease;
}

.option-hover {
  background: rgba(37, 244, 244, 0.05);
  border-color: rgba(37, 244, 244, 0.3);
}

.option-content {
  flex: 1;
  padding-right: 16px;
}

.option-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.4;
}

.option-radio {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.option-hover .option-radio {
  border-color: #25f4f4;
}

.option-selected {
  background: rgba(37, 244, 244, 0.15) !important;
  border-color: rgba(37, 244, 244, 0.6) !important;
}

.option-selected .option-radio {
  border-color: #25f4f4;
  background: #25f4f4;
}

.option-selected .radio-inner {
  width: 8px;
  height: 8px;
  background: #000;
  border-radius: 50%;
}

/* Navigation Actions */
.nav-actions {
  margin-top: 32px;
  display: flex;
  justify-content: center;
  padding-bottom: 24px;
}

.prev-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 32px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  transition: all 0.2s ease;
}

.prev-btn:active {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(0.98);
}

/* Handover Screen Refactored */
.handover-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px 40px;
  min-height: 60vh;
}

.status-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 50px;
}

.success-icon {
  width: 64px;
  height: 64px;
  margin-bottom: 20px;
  filter: drop-shadow(0 0 8px rgba(37, 244, 244, 0.5));
}

.status-code {
  font-family: 'Courier New', Courier, monospace;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 2px;
  margin-bottom: 12px;
}

.main-title {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 1px;
}

.warning-panel {
  width: 100%;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.3);
  padding: 24px;
  margin-bottom: 40px;
  position: relative;
  box-sizing: border-box;
}

.warning-panel::before {
  content: '';
  position: absolute;
  top: -1px;
  right: -1px;
  width: 20px;
  height: 20px;
  background: linear-gradient(225deg, rgba(245, 158, 11, 0.5) 50%, transparent 50%);
  z-index: 1;
}

.panel-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  border-bottom: 1px solid rgba(245, 158, 11, 0.2);
  padding-bottom: 12px;
}

.warning-icon {
  font-size: 18px;
  color: #F59E0B;
  margin-right: 8px;
}

.panel-title {
  font-size: 14px;
  font-weight: 700;
  color: #F59E0B;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.panel-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.desc-line {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
}

.highlight-child {
  color: #25f4f4; /* Cyan */
  font-weight: 700;
  text-shadow: 0 0 5px rgba(37, 244, 244, 0.3);
  margin: 0 4px;
}

.sub-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 4px;
}

.cyber-btn {
  width: 100%;
  height: 60px;
  background: #0f172a;
  border: 1px solid #25f4f4;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 10px rgba(37, 244, 244, 0.2);
  transition: all 0.2s ease;
  margin-top: 20px;
}

.cyber-btn text {
  font-family: 'Courier New', Courier, monospace;
  font-size: 16px;
  font-weight: 700;
  color: #25f4f4;
  letter-spacing: 1px;
}

.cyber-btn:active {
  background: rgba(37, 244, 244, 0.1);
  box-shadow: 0 0 20px rgba(37, 244, 244, 0.4);
}

.btn-hover {
  transform: scale(0.99);
  opacity: 0.95;
}
</style>