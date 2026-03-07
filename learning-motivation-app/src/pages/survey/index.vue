<template>
  <view class="survey-page">
    <ClinicalQuestionnaireEngine 
      v-if="currentSurveyData"
      :surveyData="currentSurveyData"
      @finish="handleFinish"
      @back="handleBack"
    />
    <view v-else class="loading-state">
      <text class="loading-text">正在加载问卷...</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import ClinicalQuestionnaireEngine from '@/components/ClinicalQuestionnaireEngine.vue';

// Import Survey Data
import surveyEsports from '@/data/survey_esports.json';
import surveyVideoFog from '@/data/survey_video_fog.json';
import surveyAcademic from '@/data/survey_academic_focus.json';
import surveyMindset from '@/data/survey_study_mindset.json';
import surveyExam from '@/data/survey_exam_anxiety.json';

const currentSurveyData = ref(null);
const surveyType = ref('');
const moduleId = ref('');
const currentStep = ref(1);

onLoad((options) => {
  console.log('[SurveyPage] onLoad with options:', options);
  if (options.moduleId) {
    moduleId.value = options.moduleId;
  }
  
  if (options.step) {
    currentStep.value = parseInt(options.step);
  }
  
  if (options.type) {
    surveyType.value = options.type;
    loadSurveyData(options.type);
  } else {
    // Default or Error handling
    console.error('No survey type provided');
    uni.showToast({
      title: '参数错误',
      icon: 'none'
    });
    setTimeout(() => uni.navigateBack(), 1500);
  }
});

const loadSurveyData = (type) => {
  let rawData = null;
  switch (type) {
    case 'esports':
      rawData = surveyEsports;
      break;
    case 'videofog':
      rawData = surveyVideoFog;
      break;
    case 'academic':
      rawData = surveyAcademic;
      break;
    case 'mindset':
      rawData = surveyMindset;
      break;
    case 'exam':
      rawData = surveyExam;
      break;
    default:
      console.error('Unknown survey type:', type);
      uni.showToast({
        title: '未知问卷类型',
        icon: 'none'
      });
      setTimeout(() => uni.navigateBack(), 1500);
      return;
  }

  if (rawData) {
    let finalData = null;
    // Check for age-specific versions
    if (rawData.versions) {
      const userProfile = uni.getStorageSync('user_profile') || {};
      const age = userProfile.age ? parseInt(userProfile.age) : 12; // Default to 12 (low_age) if not set
      
      const versionKey = age <= 12 ? 'low_age' : 'high_age';
      const versionData = rawData.versions[versionKey];
      
      console.log(`[SurveyPage] Loading ${versionKey} version for age ${age}`);

      // Merge root properties with version data to flatten structure
      finalData = {
        ...rawData,
        ...versionData
      };
    } else {
      // Direct assignment if no versions (backward compatibility)
      finalData = rawData;
    }

    // NORMALIZE DATA (Fix field mismatches: label->text, score->type, add id)
    // ClinicalQuestionnaireEngine expects: options: [{ id: 'A', text: '...', type: 3 }]
    // JSON provides: options: [{ label: '...', score: 3 }]
    if (finalData && finalData.questions) {
      finalData.questions = finalData.questions.map(q => ({
        ...q,
        options: q.options.map((opt, idx) => ({
          ...opt,
          id: opt.id || String.fromCharCode(65 + idx), // Auto-generate A, B, C...
          text: opt.text || opt.label, // Map label to text
          type: opt.type !== undefined ? opt.type : opt.score // Map score to type (value)
        }))
      }));
    }

    currentSurveyData.value = finalData;
  }
};

const handleFinish = (answers) => {
  console.log('[SurveyPage] Finished with answers:', answers);
  
  // Encode answers to pass to result page
  // Note: For large payloads, consider using uni.setStorage or a global store.
  const payload = JSON.stringify(answers);

  // Cache completion status
  let targetModuleId = moduleId.value;
  
  if (!targetModuleId) {
    switch(surveyType.value) {
        case 'videofog': targetModuleId = '02'; break;
        case 'academic': targetModuleId = '03'; break;
        case 'mindset': targetModuleId = '05'; break;
        case 'exam': targetModuleId = '04'; break;
    }
  }
  
  if (targetModuleId) {
    uni.setStorageSync('module_' + targetModuleId + '_survey_completed', true);
    uni.setStorageSync('module_' + targetModuleId + '_survey_data', answers);
    
    // Update pipeline step
    const nextStep = currentStep.value + 1;
    uni.setStorageSync(`module_${targetModuleId}_current_step`, nextStep);
  }
  
  // Navigate back to the landing page to start the objective assessment
  uni.showToast({
    title: '主诉建档完成',
    icon: 'success',
    duration: 1500
  });
  
  setTimeout(() => {
    uni.navigateBack();
  }, 1500);
};

const handleBack = () => {
  uni.navigateBack();
};
</script>

<style scoped>
.survey-page {
  min-height: 100vh;
  background-color: #0f172a;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.loading-text {
  color: #64748b;
  font-size: 28rpx;
}
</style>