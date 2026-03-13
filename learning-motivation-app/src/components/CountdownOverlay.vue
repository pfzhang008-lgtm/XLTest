<template>
  <view class="overlay-container">
    <view class="countdown-wrapper">
      <text class="countdown-text" :class="{ 'pulse-anim': animate }">{{ displayValue }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';

const props = defineProps({
  offsetY: {
    type: String,
    default: '0'
  },
  seconds: {
    type: Number,
    default: 3
  }
});

const emit = defineEmits(['complete']);

const initialCount = Number.isFinite(props.seconds) && props.seconds > 0 ? Math.floor(props.seconds) : 3;
const count = ref(initialCount);
const animate = ref(false);
let timer = null;
let animationTimer = null;

const displayValue = computed(() => {
  return count.value.toString();
});

onMounted(() => {
  animate.value = true;
  
  timer = setInterval(() => {
    // Reset animation trigger
    animate.value = false;
    
    // Force reflow for animation restart (next tick)
    animationTimer = setTimeout(() => {
      count.value--;
      animate.value = true;
      
      if (count.value <= 0) {
        clearInterval(timer);
        timer = null;
        emit('complete');
      }
    }, 50);
    
  }, 1000);
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  if (animationTimer) {
    clearTimeout(animationTimer);
    animationTimer = null;
  }
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.countdown-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.countdown-text {
  font-size: 25vh;
  line-height: 1;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.5);
  text-shadow: none;
  font-family: 'Roboto Mono', monospace;
  opacity: 0;
  transform: scale(0.8);
}

.pulse-anim {
  animation: pulse-entry 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

@keyframes pulse-entry {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
