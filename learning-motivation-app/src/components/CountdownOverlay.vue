<template>
  <view class="overlay-container">
    <view :style="{ transform: `translateY(${offsetY})` }">
      <text class="countdown-text" :class="{ 'pulse-anim': animate }">{{ displayValue }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';

const props = defineProps({
  offsetY: {
    type: String,
    default: '0'
  }
});

const emit = defineEmits(['complete']);

const count = ref(3);
const animate = ref(false);

const displayValue = computed(() => {
  if (count.value > 0) return count.value.toString();
  return 'GO';
});

onMounted(() => {
  animate.value = true;
  
  const timer = setInterval(() => {
    // Reset animation trigger
    animate.value = false;
    
    // Force reflow for animation restart (next tick)
    setTimeout(() => {
      count.value--;
      animate.value = true;
      
      if (count.value <= 0) {
        clearInterval(timer);
        
        // Show "SYNC" for 400ms then emit complete
        setTimeout(() => {
          emit('complete');
        }, 400);
      }
    }, 50);
    
  }, 1000);
});
</script>

<style scoped>
.overlay-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  background-color: rgba(15, 23, 42, 0.1);
  backdrop-filter: blur(0px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.countdown-text {
  font-size: 200rpx;
  font-weight: bold;
  color: #00F2FF;
  text-shadow: 0 0 40rpx rgba(0, 242, 255, 0.8);
  font-family: 'Roboto Mono', monospace;
  opacity: 0;
  transform: scale(0.5);
}

.pulse-anim {
  animation: pulse-entry 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

@keyframes pulse-entry {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
