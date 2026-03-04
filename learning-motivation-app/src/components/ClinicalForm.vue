<template>
  <view class="clinical-form-container">
    <!-- Header -->
    <view class="form-header">
      <text class="form-title">{{ title }}</text>
      <text class="form-subtitle">{{ subtitle }}</text>
    </view>

    <!-- Form Fields -->
    <view class="form-fields">
      <view v-for="(field, index) in fields" :key="index" class="form-field">
        <text class="field-label">{{ field.label }}</text>
        
        <!-- Slider Field (Age) -->
        <view v-if="field.type === 'slider'" class="field-content slider-container">
          <view class="slider-display">
            <text class="slider-value">{{ formData[field.key] }}</text>
            <text class="slider-unit" v-if="field.unit">{{ field.unit }}</text>
          </view>
          <slider 
            :value="formData[field.key]" 
            :min="field.min" 
            :max="field.max" 
            :step="field.step || 1"
            activeColor="#00F2FF" 
            backgroundColor="rgba(255, 255, 255, 0.1)" 
            block-color="#00F2FF" 
            block-size="24"
            @change="(e) => updateField(field.key, e.detail.value)"
            @changing="(e) => updateField(field.key, e.detail.value)"
          />
          <view class="slider-range">
            <text>{{ field.min }}</text>
            <text>{{ field.max }}</text>
          </view>
        </view>

        <!-- Toggle Field (Sex) -->
        <view v-else-if="field.type === 'toggle'" class="field-content toggle-container">
          <view 
            v-for="option in field.options" 
            :key="option.value" 
            class="toggle-btn"
            :class="{ active: formData[field.key] === option.value }"
            @click="updateField(field.key, option.value)"
          >
            <text class="toggle-text">{{ option.label }}</text>
          </view>
        </view>

        <!-- Radio List Field (Observation Target) -->
        <view v-else-if="field.type === 'radio-list'" class="field-content radio-list-container">
          <view 
            v-for="option in field.options" 
            :key="option.value" 
            class="radio-item"
            :class="{ active: formData[field.key] === option.value }"
            @click="updateField(field.key, option.value)"
          >
            <view class="radio-indicator">
              <view class="radio-inner" v-if="formData[field.key] === option.value"></view>
            </view>
            <text class="radio-text">{{ option.label }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Footer CTA -->
    <view class="form-footer">
      <button class="submit-btn" hover-class="btn-hover" @click="handleSubmit">
        <text class="btn-text">{{ submitText }}</text>
        <view class="btn-glow"></view>
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: 'FORM TITLE'
  },
  subtitle: {
    type: String,
    default: 'Form subtitle goes here.'
  },
  fields: {
    type: Array,
    required: true
  },
  submitText: {
    type: String,
    default: 'SUBMIT'
  }
});

const emit = defineEmits(['submit']);

const formData = reactive({});

// Initialize form data with default values
onMounted(() => {
  props.fields.forEach(field => {
    if (field.defaultValue !== undefined) {
      formData[field.key] = field.defaultValue;
    } else if (field.type === 'slider') {
      formData[field.key] = field.min;
    } else {
      formData[field.key] = null;
    }
  });
});

const updateField = (key, value) => {
  formData[key] = value;
};

const handleSubmit = () => {
  emit('submit', { ...formData });
};
</script>

<style scoped>
.clinical-form-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
}

.form-header {
  margin-bottom: 40rpx;
  padding: 0 10rpx;
}

.form-title {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #00F2FF;
  letter-spacing: 2px;
  margin-bottom: 12rpx;
  text-shadow: 0 0 10px rgba(0, 242, 255, 0.3);
}

.form-subtitle {
  display: block;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 40rpx;
  margin-bottom: 60rpx;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.field-label {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  border-left: 3px solid #00F2FF;
  padding-left: 16rpx;
}

/* Slider Styles */
.slider-container {
  background: rgba(255, 255, 255, 0.03);
  padding: 30rpx 20rpx;
  border-radius: 12rpx;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.slider-display {
  display: flex;
  justify-content: center;
  align-items: baseline;
  margin-bottom: 10rpx;
}

.slider-value {
  font-size: 64rpx;
  font-weight: bold;
  color: #00F2FF;
  text-shadow: 0 0 15px rgba(0, 242, 255, 0.4);
}

.slider-unit {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.5);
  margin-left: 8rpx;
}

.slider-range {
  display: flex;
  justify-content: space-between;
  padding: 0 20rpx;
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.3);
}

/* Toggle Styles */
.toggle-container {
  display: flex;
  gap: 20rpx;
}

.toggle-btn {
  flex: 1;
  height: 100rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12rpx;
  transition: all 0.3s ease;
}

.toggle-btn.active {
  background: rgba(0, 242, 255, 0.1);
  border-color: #00F2FF;
  box-shadow: 0 0 15px rgba(0, 242, 255, 0.15) inset;
}

.toggle-text {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.6);
  font-weight: bold;
}

.toggle-btn.active .toggle-text {
  color: #00F2FF;
  text-shadow: 0 0 8px rgba(0, 242, 255, 0.4);
}

/* Radio List Styles */
.radio-list-container {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.radio-item {
  display: flex;
  align-items: center;
  padding: 24rpx 20rpx;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12rpx;
  transition: all 0.2s ease;
}

.radio-item.active {
  background: rgba(0, 242, 255, 0.05);
  border-color: rgba(0, 242, 255, 0.5);
}

.radio-indicator {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  margin-right: 20rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.radio-item.active .radio-indicator {
  border-color: #00F2FF;
}

.radio-inner {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background-color: #00F2FF;
  box-shadow: 0 0 6px #00F2FF;
}

.radio-text {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

.radio-item.active .radio-text {
  color: #fff;
}

/* Footer Button */
.form-footer {
  margin-top: 20rpx;
}

.submit-btn {
  position: relative;
  height: 96rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(90deg, #00F2FF, #00A8FF);
  border-radius: 8rpx;
  border: none;
  overflow: hidden;
}

.btn-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #000;
  z-index: 1;
  letter-spacing: 1px;
}

.btn-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(255,255,255,0) 40%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 60%);
  background-size: 200% 200%;
  animation: shine 3s infinite;
}

.btn-hover {
  transform: scale(0.98);
  opacity: 0.9;
}

@keyframes shine {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
