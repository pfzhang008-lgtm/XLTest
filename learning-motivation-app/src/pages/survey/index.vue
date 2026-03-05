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

const currentSurveyData = ref(null);
const surveyType = ref('');

onLoad((options) => {
  console.log('[SurveyPage] onLoad with options:', options);
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
  switch (type) {
    case 'esports':
      currentSurveyData.value = surveyEsports;
      break;
    case 'videofog':
      currentSurveyData.value = surveyVideoFog;
      break;
    case 'academic':
      currentSurveyData.value = surveyAcademic;
      break;
    case 'mindset':
      currentSurveyData.value = surveyMindset;
      break;
    default:
      console.error('Unknown survey type:', type);
      uni.showToast({
        title: '未知问卷类型',
        icon: 'none'
      });
      setTimeout(() => uni.navigateBack(), 1500);
  }
};

const handleFinish = (answers) => {
  console.log('[SurveyPage] Finished with answers:', answers);
  
  // Encode answers to pass to result page
  // Note: For large payloads, consider using uni.setStorage or a global store.
  // URL length limits might be an issue if answers are very long, but here they are short keys.
  const payload = JSON.stringify(answers);
  
  // Navigate to result page (Assuming result page exists or will be created)
  // User said "ResultPage (which we will build next)"
  // So for now, we'll log it and maybe show a toast or navigate to a placeholder.
  // I'll navigate to a generic result page or back for now, as I don't have the result page path yet.
  // Or better, I'll navigate to `pages/report/index?data=...` assuming that's the next step.
  // But since the user said "which we will build next", I should probably just show a success message 
  // and maybe navigate back or to a temporary success page.
  
  // Actually, let's navigate to a result page with the type and data.
  // Using encodeURIComponent to be safe.
  uni.navigateTo({
    url: `/pages/report/index?type=${surveyType.value}&data=${encodeURIComponent(payload)}`,
    fail: (err) => {
      console.error('Navigation failed, maybe page does not exist yet:', err);
      uni.showToast({
        title: '测评完成 (结果页待开发)',
        icon: 'success'
      });
    }
  });
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