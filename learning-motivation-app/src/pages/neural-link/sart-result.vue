<template>
  <view class="container">
    <view class="back-btn" @click="goBack">
      <text class="back-arrow">←</text>
    </view>
    <!-- Header: Diagnosis Verdict -->
    <view class="header-section fade-in delay-0">
      <view class="header-label">[DIAGNOSTICS COMPLETE]</view>
      <view class="verdict-block">
        <text class="verdict-text">STATUS: <text :class="diagnosis.statusColor">{{ diagnosis.statusText }}</text></text>
        <text class="verdict-sub">{{ diagnosis.subText }}</text>
      </view>
      
      <!-- Simulated ECG Timeline -->
      <view class="timeline-container">
        <view class="timeline-axis"></view>
        <!-- Generate random spikes based on mock data -->
        <view 
          v-for="(event, index) in timelineEvents" 
          :key="index"
          class="timeline-marker"
          :class="event.type"
          :style="{ left: event.time + '%' }"
        ></view>
        <view class="timeline-scan-line"></view>
        <view class="timeline-labels">
          <text>Start</text>
          <text>End</text>
        </view>
      </view>
    </view>

    <!-- Core Symptom Cards -->
    <view class="cards-section">
      <!-- Card 1: Omission Errors -->
      <view class="symptom-card fade-in delay-1">
        <view class="card-header">
          <text class="card-title">神经掉线 (Neural Lapses)</text>
          <text class="card-value cyan">{{ metrics.omissions }} 次</text>
        </view>
        <view class="diagnosis-text">
          "{{ diagnosis.desc1 }}"
        </view>
        <view class="impact-text">
          <text class="impact-label">现实映射：</text>
          上课看似在听实则发呆；长篇阅读频繁跳行、读不进脑。
        </view>
      </view>

      <!-- Card 2: Commission Errors -->
      <view class="symptom-card fade-in delay-2">
        <view class="card-header">
          <text class="card-title">冲动误报 (Impulsive Actions)</text>
          <text class="card-value red">{{ metrics.falseAlarms }} 次</text>
        </view>
        <view class="diagnosis-text">
          "{{ diagnosis.desc2 }}"
        </view>
        <view class="impact-text">
          <text class="impact-label">现实映射：</text>
          做题不看完题干就盲目下笔；极易受外界微小声音干扰，管不住手。
        </view>
      </view>
    </view>

    <!-- Footer CTA -->
    <view class="footer-section fade-in delay-3">
      <view class="cta-button" @click="startRehab">
        <view class="btn-content">
          <text class="btn-icon">[INITIATE]</text>
          <text class="btn-text">专注力数字复健方案</text>
        </view>
        <view class="btn-sub">Start Rehab Protocol</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

const goBack = () => {
  uni.navigateBack();
};

// Data State
const metrics = ref({
  hits: 0,
  omissions: 0,
  falseAlarms: 0,
  errors: 0,
  events: []
});

const thresholds = ref({
  excellentErrors: 1,
  riskErrors: 3
});

// Computed Diagnosis
const diagnosis = computed(() => {
  const totalErrors = metrics.value.errors;
  
  if (totalErrors <= thresholds.value.excellentErrors) {
    return {
      status: 'OPTIMAL',
      statusText: '神经巅峰',
      statusColor: 'text-green', // Need to add this class
      subText: '多巴胺调节机制极佳',
      desc1: '唤醒度极佳。在高强度持续专注任务中，大脑保持了极高的信噪比。',
      desc2: '前额叶抑制功能强劲。能够有效过滤干扰，精准控制冲动。',
      risk: false
    };
  } else if (totalErrors >= thresholds.value.riskErrors) {
    return {
      status: 'HIGH RISK',
      statusText: '高危预警',
      statusColor: 'highlight-red',
      subText: '多巴胺戒断 / 抑制力受损',
      desc1: '唤醒度低下。在低频刺激环境中，大脑频繁进入待机状态，导致漏报。',
      desc2: '前额叶抑制功能障碍。难以抵抗冲动，极易受外界干扰。',
      risk: true
    };
  } else {
    return {
      status: 'MODERATE',
      statusText: '轻度磨损',
      statusColor: 'text-yellow', // Need to add this class
      subText: '专注力稳定性一般',
      desc1: '唤醒度尚可。但在长时间任务中会出现偶尔的走神。',
      desc2: '前额叶抑制功能一般。偶尔会出现冲动控制失误。',
      risk: false
    };
  }
});

// Mock Data for Timeline (Fallback) or Real Data
const timelineEvents = ref([]);

onLoad((options) => {
  if (options.data) {
    try {
      const data = JSON.parse(decodeURIComponent(options.data));
      if (data.metrics) metrics.value = { ...metrics.value, ...data.metrics };
      if (data.thresholds) thresholds.value = { ...thresholds.value, ...data.thresholds };
      
      // Process events for timeline
      if (data.metrics.events && data.metrics.events.length > 0) {
        processTimelineEvents(data.metrics.events, data.metrics.totalTrials); // Estimate duration?
        // SART doesn't pass total duration, but we can estimate or just use relative time
        // Actually events have timestamp relative to start.
        // We can find max timestamp to normalize.
      } else {
        generateMockTimeline();
      }
    } catch (e) {
      console.error('Failed to parse result data:', e);
      generateMockTimeline();
    }
  } else {
    generateMockTimeline();
  }
});

const processTimelineEvents = (events, totalTrials) => {
  if (!events.length) return;
  const lastEvent = events[events.length - 1];
  const maxTime = lastEvent.timestamp + 2000; // Add buffer
  
  timelineEvents.value = events.map(e => ({
    time: (e.timestamp / maxTime) * 100,
    type: e.type // 'omission' or 'commission'
  }));
};

const generateMockTimeline = () => {
  // Generate random markers for 90s timeline
  // Red markers for errors (Commission/Omission)
  const events = [];
  // 6 Omissions (Cyan - technically lapses)
  for (let i = 0; i < 6; i++) {
    events.push({
      time: Math.random() * 90 / 90 * 100,
      type: 'omission'
    });
  }
  // 8 Commissions (Red - impulsive)
  for (let i = 0; i < 8; i++) {
    events.push({
      time: Math.random() * 90 / 90 * 100,
      type: 'commission'
    });
  }
  timelineEvents.value = events.sort((a, b) => a.time - b.time);
};

const startRehab = () => {
  uni.showToast({
    title: 'Protocol Initiated',
    icon: 'none'
  });
  // Navigate to rehab page or dashboard
  // uni.navigateTo({ url: '/pages/rehab/index' });
};
</script>

<style scoped>
/* Theme Variables */
:root {
  --bg-slate: #0f172a;
  --text-slate: #94a3b8;
  --text-light: #e2e8f0;
  --neon-red: #ff4757;
  --muted-cyan: #22d3ee;
  --border-subtle: rgba(255, 255, 255, 0.1);
  --card-bg: rgba(30, 41, 59, 0.5);
}

.container {
  min-height: 100vh;
  background-color: #05070a;
  color: #fff;
  padding: 40rpx;
  padding-top: 100rpx; /* Added space for back button */
  position: relative;
  overflow: hidden;
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

/* Background Grids & Scans */

/* Animations */
.fade-in {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.8s ease-out forwards;
}
.delay-0 { animation-delay: 0.2s; }
.delay-1 { animation-delay: 0.6s; }
.delay-2 { animation-delay: 1.0s; }
.delay-3 { animation-delay: 1.4s; }

@keyframes fadeInUp {
  to { opacity: 1; transform: translateY(0); }
}

/* Header Section */
  .header-section {
    position: relative;
    padding: 60px 20px 30px;
    background: linear-gradient(180deg, rgba(15, 17, 21, 0.95), rgba(15, 17, 21, 0.8));
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    z-index: 10;
    margin-bottom: 32px;
  }
  
  .header-label {
  font-size: 12px;
  color: #00f0ff;
  letter-spacing: 2px;
  margin-bottom: 8px;
  text-align: center; /* Ensure centered label doesn't overlap back button */
}
.verdict-block {
  margin-bottom: 24px;
}
.verdict-text {
  font-size: 20px;
  color: #e2e8f0;
  font-weight: bold;
  display: block;
  margin-bottom: 4px;
}
.highlight-red {
  color: #ff4757;
}
.verdict-sub {
  font-size: 14px;
  color: #64748b;
}

.text-green { color: #4ade80; }
.text-yellow { color: #facc15; }

/* Timeline */
.timeline-container {
  position: relative;
  height: 60px;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid var(--border-subtle);
  border-radius: 4px;
  margin-top: 16px;
  overflow: hidden;
}
.timeline-axis {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #334155;
}
.timeline-marker {
  position: absolute;
  bottom: 0;
  width: 2px;
  background: #ff4757; /* Default red for commission */
  opacity: 0.8;
  height: 40%; /* Spike height */
  transform: translateX(-50%);
}
.timeline-marker.commission {
  height: 70%;
  background: #ff4757;
  box-shadow: 0 0 4px #ff4757;
}
.timeline-marker.omission {
  height: 40%;
  background: #22d3ee;
  top: 0; /* Drop down from top for omission? Or just smaller spike */
  bottom: auto;
}
.timeline-scan-line {
  position: absolute;
  top: 0; bottom: 0;
  width: 2px;
  background: rgba(255, 255, 255, 0.2);
  left: 0;
  animation: scan 4s linear infinite;
}
@keyframes scan { 0% { left: 0; } 100% { left: 100%; } }

.timeline-labels {
  position: absolute;
  bottom: 2px;
  left: 4px; right: 4px;
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #475569;
}

/* Cards Section */
.cards-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.symptom-card {
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  padding: 16px;
  backdrop-filter: blur(4px);
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
.card-title {
  font-size: 14px;
  color: #e2e8f0;
  font-weight: bold;
}
.card-value {
  font-size: 14px;
  font-weight: bold;
}
.card-value.cyan { color: #22d3ee; }
.card-value.red { color: #ff4757; }

.diagnosis-text {
  font-size: 13px;
  color: #94a3b8;
  line-height: 1.5;
  margin-bottom: 12px;
  font-style: italic;
}
.impact-text {
  font-size: 12px;
  color: #64748b;
  background: rgba(0, 0, 0, 0.2);
  padding: 8px;
  border-radius: 4px;
  line-height: 1.4;
}
.impact-label {
  color: #cbd5e1;
  font-weight: bold;
}

/* Footer CTA */
.footer-section {
  margin-top: 32px;
  margin-bottom: 20px;
}
.cta-button {
  background: #1e293b;
  border: 1px solid #22d3ee;
  border-radius: 4px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.cta-button:active {
  background: #0f172a;
  transform: translateY(1px);
}
.cta-button::after {
  content: '';
  position: absolute;
  top: 0; left: -100%;
  width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.1), transparent);
  animation: shimmer 3s infinite;
}
@keyframes shimmer { 0% { left: -100%; } 100% { left: 100%; } }

.btn-content {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}
.btn-icon {
  font-size: 14px;
  color: #22d3ee;
  font-weight: bold;
}
.btn-text {
  font-size: 16px;
  color: #e2e8f0;
  font-weight: bold;
}
.btn-sub {
  font-size: 10px;
  color: #64748b;
  letter-spacing: 1px;
  text-transform: uppercase;
}

</style>