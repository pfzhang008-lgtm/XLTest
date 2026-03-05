<template>
  <view class="overlay-container">
    <!-- State 1: Instructions -->
    <view v-if="mode === 'instruction'" class="instruction-card">
      <view class="card-header">
        <text class="title">{{ title }}</text>
        <view class="divider"></view>
      </view>

      <view class="rules-container">
        <view v-for="(rule, index) in rules" :key="index" class="rule-item">
          <text class="rule-bullet">></text>
          <rich-text :nodes="rule" class="rule-text"></rich-text>
        </view>
      </view>

      <view class="footer">
        <text class="duration">{{ duration }}</text>
        <view class="action-btn" @click="startCountdown">
          <text class="btn-text">我已理解，启动监测</text>
          <view class="btn-shine"></view>
        </view>
      </view>
    </view>

    <!-- State 2: Countdown -->
    <view v-else-if="mode === 'countdown'" class="countdown-container">
      <text class="countdown-text">{{ countdownText }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  rules: {
    type: Array,
    default: () => []
  },
  duration: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['test-start']);

const mode = ref('instruction');
const count = ref(3);

const countdownText = computed(() => {
  if (count.value > 0) return count.value.toString();
  return '监测开始';
});

const startCountdown = () => {
  mode.value = 'countdown';
  
  const timer = setInterval(() => {
    count.value--;
    if (count.value <= 0) {
      clearInterval(timer);
      // Show "监测开始" for 500ms then emit
      setTimeout(() => {
        emit('test-start');
      }, 500);
    }
  }, 1000);
};
</script>

<style scoped>
.overlay-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  background-color: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.instruction-card {
  width: 85%;
  max-width: 600rpx;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 24rpx;
  padding: 48rpx;
  display: flex;
  flex-direction: column;
  gap: 32rpx;
  box-shadow: 0 0 40rpx rgba(0, 0, 0, 0.5);
}

.card-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #00F2FF;
  letter-spacing: 2px;
  text-transform: uppercase;
  text-shadow: 0 0 10rpx rgba(0, 242, 255, 0.5);
  text-align: center;
  display: block;
}

.divider {
  height: 2rpx;
  background: linear-gradient(90deg, transparent, rgba(0, 242, 255, 0.5), transparent);
  width: 100%;
}

.rules-container {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.rule-item {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 16rpx;
}

.rule-bullet {
  color: #00F2FF;
  font-weight: bold;
  font-size: 28rpx;
  line-height: 1.5;
}

.rule-text {
  flex: 1;
  color: rgba(255, 255, 255, 0.85);
  font-size: 28rpx;
  line-height: 1.5;
}

.footer {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  margin-top: 16rpx;
}

.duration {
  font-size: 24rpx;
  color: rgba(148, 163, 184, 0.8);
  text-align: center;
  letter-spacing: 1px;
}

.action-btn {
  position: relative;
  width: 100%;
  height: 96rpx;
  background: linear-gradient(90deg, rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.2));
  border: 1px solid rgba(6, 182, 212, 0.5);
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.action-btn:active {
  background: linear-gradient(90deg, rgba(6, 182, 212, 0.3), rgba(59, 130, 246, 0.3));
  transform: scale(0.98);
}

.btn-text {
  color: #00F2FF;
  font-size: 30rpx;
  font-weight: bold;
  letter-spacing: 2px;
  text-transform: uppercase;
  z-index: 2;
}

.btn-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transform: skewX(-20deg);
  animation: shine 3s infinite;
}

@keyframes shine {
  0% { left: -100%; }
  20% { left: 200%; }
  100% { left: 200%; }
}

.countdown-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.countdown-text {
  font-size: 120rpx;
  font-weight: bold;
  color: #FFFFFF;
  text-shadow: 0 0 40rpx #00F2FF;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
}
</style>
