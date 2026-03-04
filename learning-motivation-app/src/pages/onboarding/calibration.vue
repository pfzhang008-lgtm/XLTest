<template>
  <view class="calibration-page">
    <view class="back-btn" @click="goBack">
      <text class="back-arrow">←</text>
    </view>
    <ClinicalForm 
      title="[ INITIALIZATION ] 基础档案标定"
      subtitle="系统需要获取基础生理参数，以匹配常模数据。"
      :fields="formFields"
      submitText="确认标定，生成档案"
      @submit="handleCalibration"
    />
  </view>
</template>

<script setup>
import { ref } from 'vue';
import ClinicalForm from '@/components/ClinicalForm.vue';

const formFields = ref([
  {
    type: 'slider',
    key: 'age',
    label: '监测对象生理年龄 (Biological Age)',
    min: 6,
    max: 18,
    unit: '岁',
    defaultValue: 12
  },
  {
    type: 'toggle',
    key: 'sex',
    label: '基础生理性别 (Biological Sex)',
    options: [
      { label: 'MALE 男', value: 'male' },
      { label: 'FEMALE 女', value: 'female' }
    ],
    defaultValue: 'male'
  },
  {
    type: 'radio-list',
    key: 'target',
    label: '核心观测目标 (Primary Anomaly)',
    options: [
      { label: '高频屏幕依赖 (游戏/短视频失控)', value: 'screen_addiction' },
      { label: '持续性注意力断层 (作业拖拉/走神)', value: 'attention_deficit' },
      { label: '情绪唤醒异常 (厌学/易怒/焦虑)', value: 'emotional_instability' }
    ],
    defaultValue: 'screen_addiction'
  }
]);

const goBack = () => {
  uni.navigateBack();
};

// Load saved profile if exists
const savedProfile = uni.getStorageSync('user_profile');
if (savedProfile) {
  console.log('[Calibration] Loading saved profile:', savedProfile);
  formFields.value.forEach(field => {
    if (savedProfile[field.key] !== undefined) {
      field.defaultValue = savedProfile[field.key];
    }
  });
}

const handleCalibration = (data) => {
  console.log('[Calibration] Data received:', data);
  
  // Mock Save
  uni.setStorageSync('user_profile', data);
  uni.setStorageSync('is_calibrated', true);
  
  uni.showToast({
    title: '档案生成中...',
    icon: 'loading',
    duration: 1500
  });

  setTimeout(() => {
    // Check if there's a redirect target
    const redirectUrl = uni.getStorageSync('calibration_redirect');
    if (redirectUrl) {
      uni.removeStorageSync('calibration_redirect');
      uni.navigateTo({
        url: redirectUrl,
        fail: () => {
          // If navigateTo fails (e.g. tabbar page), try switchTab
          uni.switchTab({
            url: redirectUrl,
            fail: () => {
                console.error('Redirect failed', redirectUrl);
                uni.navigateBack();
            }
          });
        }
      });
    } else {
      uni.navigateBack();
    }
  }, 1500);
};
</script>

<style scoped>
.calibration-page {
  min-height: 100vh;
  background-color: #0F172A; /* Dark Slate */
  padding: 40rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  position: relative;
}

.back-btn {
  position: absolute;
  top: 88rpx;
  left: 40rpx;
  width: 70rpx;
  height: 70rpx;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.back-arrow {
  color: #fff;
  font-size: 40rpx;
  font-weight: bold;
  line-height: 1;
}

</style>
