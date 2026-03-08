<template>
  <view class="calibration-page">
    <view class="back-btn" @click="goBack" v-if="!isForceMode">
      <text class="back-arrow">←</text>
    </view>
    <ClinicalForm 
      title="基础档案 [ INITIALIZATION ]"
      subtitle="系统需要获取基础生理参数，以匹配常模数据。"
      :fields="formFields"
      submitText="确认标定，生成档案"
      @submit="handleCalibration"
    />
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import ClinicalForm from '@/components/ClinicalForm.vue';

const isForceMode = ref(false);

onLoad((options) => {
  if (options && options.mode === 'force') {
    isForceMode.value = true;
  }
});

const formFields = ref([
  {
    type: 'radio-list',
    key: 'age',
    label: '生理年龄 (Biological Age)',
    options: [
      { label: '儿童期 (6-9岁)', value: 'age_6_9' },
      { label: '前青春期 (10-12岁)', value: 'age_10_12' },
      { label: '青春期 (13-15岁)', value: 'age_13_15' },
      { label: '成年前期 (16岁+)', value: 'age_16_plus' }
    ],
    defaultValue: 'age_10_12'
  },
  {
    type: 'toggle',
    key: 'sex',
    label: '生理性别 (Biological Sex)',
    options: [
      { label: 'MALE 男', value: 'male' },
      { label: 'FEMALE 女', value: 'female' }
    ],
    defaultValue: 'male'
  }
]);

const goBack = () => {
  uni.navigateBack();
};

// Load saved profile if exists
try {
  const savedProfile = uni.getStorageSync('user_profile');
  if (savedProfile) {
    console.log('[Calibration] Loading saved profile:', savedProfile);
    formFields.value.forEach(field => {
      if (savedProfile[field.key] !== undefined) {
        let value = savedProfile[field.key];
        
        // Legacy Age Migration (Number -> Key)
        if (field.key === 'age' && typeof value === 'number') {
           if (value <= 9) value = 'age_6_9';
           else if (value <= 12) value = 'age_10_12';
           else if (value <= 15) value = 'age_13_15';
           else value = 'age_16_plus';
        }
        
        field.defaultValue = value;
      }
    });
  }
} catch (e) {
  console.error('Error loading profile:', e);
}

const handleCalibration = (data) => {
  console.log('[Calibration] Data received:', data);
  
  // Save Profile
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
      // Use redirectTo to replace calibration page in stack, preventing loop
      uni.redirectTo({
        url: redirectUrl,
        fail: (err) => {
          console.error('Redirect failed:', err);
          // If redirectTo fails (e.g. tabbar page), try switchTab
          uni.switchTab({
            url: redirectUrl,
            fail: () => {
                console.error('SwitchTab failed', redirectUrl);
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
  flex-direction: column;
  justify-content: center; /* Center vertically */
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
  transition: background 0.3s;
}

.back-btn:active {
  background: rgba(255, 255, 255, 0.2);
}

.back-arrow {
  color: #fff;
  font-size: 40rpx;
  font-weight: bold;
  line-height: 1;
}
</style>