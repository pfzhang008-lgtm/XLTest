<template>
  <view class="container">
    <!-- Background Effects -->
    <view class="tech-grid-bg"></view>
    <view class="scan-line"></view>

    <!-- Header -->
    <view class="header">
      <view class="system-status">
        <view class="status-dot pulse"></view>
        <text class="status-text">SYSTEM_READY</text>
        <view class="status-dots">
          <view class="dot"></view>
          <view class="dot"></view>
          <view class="dot"></view>
        </view>
      </view>
      
      <view class="title-section">
        <text class="main-title">N-Back</text>
        <text class="sub-title">深度扫描报告</text>
      </view>

      <view class="warning-badge" :style="{ borderColor: cognitiveStatus === 'RISK' ? 'rgba(255, 59, 59, 0.3)' : (cognitiveStatus === 'EXCELLENT' ? 'rgba(74, 222, 128, 0.3)' : 'rgba(0, 240, 255, 0.3)'), background: cognitiveStatus === 'RISK' ? 'rgba(255, 59, 59, 0.1)' : (cognitiveStatus === 'EXCELLENT' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(0, 240, 255, 0.1)') }">
        <view class="ping-wrapper">
          <view class="ping-ring" :style="{ backgroundColor: cognitiveStatus === 'RISK' ? '#ff3b3b' : (cognitiveStatus === 'EXCELLENT' ? '#4ade80' : '#00f0ff') }"></view>
          <view class="ping-core" :style="{ backgroundColor: cognitiveStatus === 'RISK' ? '#ff3b3b' : (cognitiveStatus === 'EXCELLENT' ? '#4ade80' : '#00f0ff') }"></view>
        </view>
        <text :class="statusClass">{{ statusTitle }}</text>
      </view>
    </view>

    <!-- Dashboard -->
    <view class="dashboard">
      <view class="metrics-grid">
        <!-- Metric 1: Test Params -->
        <view class="glass-panel metric-card">
          <view class="card-icon-wrapper">
            <image class="card-icon" :src="icons.grid_view" mode="aspectFit"></image>
          </view>
          <text class="card-label">测试参数</text>
          <view class="card-value-group">
            <text class="card-value-lg">{{ metrics.level }}-Back</text>
            <text class="card-value-sm text-cyan">视觉位置 / 空间</text>
          </view>
          <view class="card-line-cyan"></view>
        </view>

        <!-- Metric 2: Duration -->
        <view class="glass-panel metric-card">
          <view class="card-icon-wrapper">
            <image class="card-icon" :src="icons.timer" mode="aspectFit"></image>
          </view>
          <text class="card-label">总测试项</text>
          <view class="card-value-group row">
            <text class="card-value-lg font-mono">{{ metrics.totalTrials }}</text>
            <text class="card-value-xs text-dim">TRIALS</text>
          </view>
          <view class="card-line-purple"></view>
        </view>
      </view>

      <!-- Brain Scan Visual -->
      <view class="scan-visual">
        <view class="scan-line-overlay"></view>
        <!-- Use a placeholder image or CSS representation if image fails -->
        <image class="brain-bg" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvqzrRWPxDQqsx6YbeYj3zj5mohRgVAUtlu7NQcpaViAofu0uy4i-4VwdyoJV5Wem74sI6QSmn_zWrct0-sb1TOkHfGpqMF_PZWKdpCMzwyOHRd2TB-fKMRd672L8SzLs31Bu7onDaxTcgoFszl4ESsE2s9yUltx-jsoSEThrtfeZIkzEpHnMHMJPNkqpRzqYDP9hWmIf5ENCsvUMdjyU8CZp-n7THhsy2wX0AMLkVICXhRUp8VkJqzaMd3tlafriSzHl0-WtnOqw" mode="aspectFill"></image>
        <view class="scan-overlay-gradient"></view>
        
        <view class="scan-ui">
          <view class="brain-circle pulse-slow">
             <view class="inner-circle">
               <image class="brain-icon" :src="icons.psychology" mode="aspectFit"></image>
             </view>
          </view>
          
          <view class="scan-data top-left">
            <view class="data-row">
              <view class="status-indicator red"></view>
              <text class="data-text red">CORTEX_ACTIVITY_LOW</text>
            </view>
            <view class="data-bar-container">
               <view class="data-bar red w-30"></view>
            </view>
          </view>
          
          <view class="scan-data bottom-right">
             <text class="data-text cyan block mb-1">SYNAPTIC_DELAY: 240ms</text>
             <text class="data-text dim">SCAN_COMPLETE</text>
          </view>
        </view>
      </view>

      <!-- Diagnostic Card 1: Retention Rate -->
      <view class="glass-panel diag-card fadeInUp delay-1" :class="cognitiveStatus === 'RISK' ? 'border-l-red' : (cognitiveStatus === 'EXCELLENT' ? 'border-l-green' : 'border-l-cyan')">
        <view class="diag-header">
          <view>
            <view class="diag-title-row">
              <text class="diag-title">信息暂存率</text>
              <text class="tag">WM_BUFFER</text>
            </view>
          </view>
          <view class="chart-circle">
             <!-- Simple CSS Circle Chart -->
             <view class="circle-bg"></view>
             <svg class="circle-svg" viewBox="0 0 48 48">
               <circle cx="24" cy="24" r="20" fill="none" stroke="#2a2e36" stroke-width="4"></circle>
               <circle cx="24" cy="24" r="20" fill="none" :stroke="cognitiveStatus === 'RISK' ? '#ff3b3b' : (cognitiveStatus === 'EXCELLENT' ? '#4ade80' : '#00f0ff')" stroke-width="4" 
                       stroke-dasharray="125.6" :stroke-dashoffset="125.6 * (1 - retentionRate/100)"
                       stroke-linecap="round" transform="rotate(-90 24 24)"></circle>
             </svg>
             <text class="chart-value">{{ retentionRate }}%</text>
          </view>
        </view>
        
        <view class="diag-content">
          <view class="diag-label" :class="cognitiveStatus === 'RISK' ? 'red' : (cognitiveStatus === 'EXCELLENT' ? 'text-green' : 'cyan')">
            <image class="icon-sm" :src="icons.diagnosis" mode="aspectFit"></image>
            <text v-if="cognitiveStatus === 'RISK'">[诊断] 漏斗型大脑</text>
            <text v-else-if="cognitiveStatus === 'EXCELLENT'">[诊断] 照相机记忆</text>
            <text v-else>[诊断] 正常记忆波动</text>
          </view>
          <text class="diag-desc">
            <template v-if="cognitiveStatus === 'RISK'">
              典型短视频投喂后遗症。高频瞬时刺激导致海马体长时记忆编码受阻，信息随进随出，无法形成有效沉淀。
            </template>
            <template v-else-if="cognitiveStatus === 'EXCELLENT'">
              你的大脑工作记忆区如同高性能缓存，能精准捕捉并暂存连续信息，展现出极强的短期记忆编码能力。
            </template>
            <template v-else>
              你的工作记忆处于正常范围。在信息量不过载的情况下能保持稳定追踪，但在高负荷下可能会有遗漏。
            </template>
          </text>
        </view>
      </view>

      <!-- Diagnostic Card 2: Overlap Index -->
      <view class="glass-panel diag-card fadeInUp delay-2" :class="ghostingLevel === 'HIGH' ? 'border-l-red' : (ghostingLevel === 'MEDIUM' ? 'border-l-orange' : 'border-l-green')">
        <view class="diag-header">
          <view>
            <view class="diag-title-row">
              <text class="diag-title">认知重影指数</text>
              <text class="tag">GHOSTING</text>
            </view>
          </view>
          <view class="risk-indicator">
            <text class="risk-text" :class="ghostingLevel === 'HIGH' ? 'red' : (ghostingLevel === 'MEDIUM' ? 'text-orange' : 'text-green')">{{ ghostingLevel }}</text>
            <view class="risk-bars">
              <view class="bar" :class="ghostingLevel === 'HIGH' || ghostingLevel === 'MEDIUM' || ghostingLevel === 'LOW' ? (ghostingLevel === 'HIGH' ? 'red' : (ghostingLevel === 'MEDIUM' ? 'orange' : 'green')) : 'dim'"></view>
              <view class="bar" :class="ghostingLevel === 'HIGH' || ghostingLevel === 'MEDIUM' ? (ghostingLevel === 'HIGH' ? 'red' : (ghostingLevel === 'MEDIUM' ? 'orange' : 'green')) : 'dim'"></view>
              <view class="bar" :class="ghostingLevel === 'HIGH' ? 'red' : 'dim'"></view>
            </view>
          </view>
        </view>
        
        <view class="diag-content">
          <view class="diag-label" :class="ghostingLevel === 'HIGH' ? 'red' : (ghostingLevel === 'MEDIUM' ? 'text-orange' : 'text-green')">
            <image class="icon-sm" :src="icons.warning" mode="aspectFit"></image>
            <text v-if="ghostingLevel === 'HIGH'">[警报] 思维黏连</text>
            <text v-else-if="ghostingLevel === 'MEDIUM'">[警告] 信号干扰</text>
            <text v-else>[正常] 信号清晰</text>
          </view>
          <text class="diag-desc">
            <template v-if="ghostingLevel === 'HIGH'">
              抗干扰能力极弱。面对复杂长文本时大脑易“死机”，旧信息未清除即叠加新信息，导致思维混乱。
            </template>
            <template v-else-if="ghostingLevel === 'MEDIUM'">
              存在一定的信号干扰。偶尔会将相似的信息混淆，尤其是在快速切换任务时容易出现判断失误。
            </template>
            <template v-else>
              抗干扰能力强。能有效过滤无关信息，准确区分当前任务与历史信息，思维清晰互不干扰。
            </template>
          </text>
        </view>
      </view>
      
      <!-- Actions -->
      <view class="actions fadeInUp delay-3">
        <button class="action-btn" hover-class="btn-hover">
          <view class="shimmer-bg"></view>
          <view class="btn-inner">
             <image class="btn-icon" :src="icons.science" mode="aspectFit"></image>
             <text>生成综合干预方案</text>
          </view>
        </button>
        
        <view class="secondary-link" hover-class="link-hover">
           <text>结合家长问卷获取完整报告</text>
           <image class="link-icon" :src="icons.chevron_right" mode="aspectFit"></image>
        </view>
      </view>

    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

// --- Icons (Data URIs) ---
const icons = {
  grid_view: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22%238b9bb4%22%3E%3Cpath d%3D%22M3 3v8h8V3H3zm6 6H5V5h4v4zm-6 4v8h8v-8H3zm6 6H5v-4h4v4zm4-16v8h8V3h-8zm6 6h-4V5h4v4zm-6 4v8h8v-8h-8zm6 6h-4v-4h4v4z%22%2F%3E%3C%2Fsvg%3E',
  timer: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22%238b9bb4%22%3E%3Cpath d%3D%22M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z%22%2F%3E%3C%2Fsvg%3E',
  psychology: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22%2300f0ff%22%3E%3Cpath d%3D%22M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 2.05c3.27.34 5.94 2.82 6.6 6.09.28 1.4-.04 2.76-.79 3.86l-1.46-1.46c.12-.26.25-.52.25-.79 0-2.21-1.79-4-4-4-.27 0-.53.13-.79.25L11.51 6.5c1.1-.75 2.46-1.07 3.86-.79-.81-.66-1.83-1.06-2.92-1.06-.15 0-.3.01-.45.02zm-3.09.61c.27-.12.53-.25.79-.25 2.21 0 4 1.79 4 4 0 .27-.13.53-.25.79l1.46 1.46c.75-1.1 1.07-2.46.79-3.86.66.81 1.06 1.83 1.06 2.92 0 .15-.01.3-.02.45L15.35 9.7c-.34-3.27-2.82-5.94-6.09-6.6l1.46 1.46c-.26-.12-.52-.25-.81-.25zM12 18c-3.31 0-6-2.69-6-6 0-1.06.29-2.06.8-2.92l1.52 1.52c-.21.43-.32.91-.32 1.4 0 1.66 1.34 3 3 3 .49 0 .97-.11 1.4-.32l1.52 1.52c-.86.51-1.86.8-2.92.8zm2.92-2.08c-.43.21-.91.32-1.4.32-1.66 0-3-1.34-3-3 0-.49.11-.97.32-1.4l-1.52-1.52c-.51.86-.8 1.86-.8 2.92 0 3.31 2.69 6 6 6 1.06 0 2.06-.29 2.92-.8l-1.52-1.52z%22%2F%3E%3C%2Fsvg%3E',
  diagnosis: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22%2300f0ff%22%3E%3Cpath d%3D%22M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm5 16H7V5h10v14zm-2-7h-2v2c0 .55-.45 1-1 1s-1-.45-1-1v-2H9c-.55 0-1-.45-1-1s.45-1 1-1h2V8c0-.55.45-1 1-1s1 .45 1 1v2h2c.55 0 1 .45 1 1s-.45 1-1 1zm0-4h-2v-2h2v2z%22%2F%3E%3C%2Fsvg%3E',
  warning: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22%23ef4444%22%3E%3Cpath d%3D%22M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z%22%2F%3E%3C%2Fsvg%3E',
  science: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22white%22%3E%3Cpath d%3D%22M19.8 18.4L14 10.67V6.5l1.35-1.69c.26-.33.03-.81-.4-.81H9.05c-.43 0-.66.49-.39.81L10 6.5v4.17L4.2 18.4c-.49.66-.02 1.6.8 1.6h14c.82 0 1.29-.94.8-1.6z%22%2F%3E%3C%2Fsvg%3E',
  chevron_right: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22%2300f0ff%22%3E%3Cpath d%3D%22M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z%22%2F%3E%3C%2Fsvg%3E'
};

// --- State ---
const metrics = ref({
  totalTrials: 25,
  level: 2,
  hits: 0,
  falseAlarms: 0,
  misses: 0,
  correctRejections: 0,
  accuracy: 0
});

const thresholds = ref({
  excellentAccuracy: 0.8,
  riskAccuracy: 0.5
});

const cognitiveStatus = computed(() => {
  const acc = metrics.value.accuracy;
  if (acc >= thresholds.value.excellentAccuracy) return 'EXCELLENT';
  if (acc <= thresholds.value.riskAccuracy) return 'RISK';
  return 'NORMAL';
});

const retentionRate = computed(() => {
  return Math.round(metrics.value.accuracy * 100);
});

// Overlap Index (Ghosting) based on False Alarms
// More false alarms = higher ghosting
const ghostingLevel = computed(() => {
  const faRate = metrics.value.falseAlarms / (metrics.value.totalTrials || 1);
  if (faRate > 0.3) return 'HIGH';
  if (faRate > 0.1) return 'MEDIUM';
  return 'LOW';
});

const statusTitle = computed(() => {
  if (cognitiveStatus.value === 'EXCELLENT') return 'STATUS: [优秀] 记忆回路清晰';
  if (cognitiveStatus.value === 'RISK') return 'STATUS: [高危] 深度脑雾现象';
  return 'STATUS: [正常] 记忆功能稳定';
});

const statusClass = computed(() => {
  if (cognitiveStatus.value === 'EXCELLENT') return 'text-green';
  if (cognitiveStatus.value === 'RISK') return 'warning-text';
  return 'text-cyan';
});

// --- Lifecycle ---
onLoad((options) => {
  if (options.data) {
    try {
      const payload = JSON.parse(decodeURIComponent(options.data));
      // Standardized payload support
      if (payload.metrics && payload.thresholds) {
        metrics.value = { ...metrics.value, ...payload.metrics };
        thresholds.value = { ...thresholds.value, ...payload.thresholds };
      } 
      // Legacy support (if any old format exists, though we refactored nback.vue)
      else if (payload.accuracy !== undefined) {
         metrics.value.accuracy = payload.accuracy;
         if (payload.level) metrics.value.level = payload.level;
      }
    } catch (e) {
      console.error('Failed to parse result data', e);
    }
  }
});

</script>

<style scoped>
/* Base Theme */
:root {
  --bg-main: #0f1115;
  --bg-card: #181b21;
  --neon-cyan: #00f0ff;
  --neon-red: #ff3b3b;
  --neon-purple: #7b61ff;
  --text-dim: #8b9bb4;
}

.container {
  min-height: 100vh;
  background-color: #0f1115;
  color: #e2e8f0;
  font-family: 'Noto Sans SC', sans-serif;
  padding: 32px 24px;
  position: relative;
  overflow-x: hidden;
}

/* Background Effects */
.tech-grid-bg {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 20px 20px;
  pointer-events: none;
  z-index: 0;
}

.scan-line {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 2px;
  background: rgba(0, 240, 255, 0.5);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.8);
  animation: scan 3s linear infinite;
  pointer-events: none;
  z-index: 1;
}

@keyframes scan {
  0% { top: 0; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}

/* Header */
.header {
  margin-bottom: 24px;
  position: relative;
  z-index: 10;
}

.system-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.status-dot {
  width: 8px; height: 8px;
  background-color: #00f0ff;
  border-radius: 50%;
}

.pulse { animation: pulse 2s infinite; }
@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }

.status-text {
  font-size: 10px;
  letter-spacing: 2px;
  color: #00f0ff;
  text-transform: uppercase;
  font-weight: 500;
  margin-left: 8px;
  flex: 1;
}

.status-dots {
  display: flex; gap: 4px;
}
.dot { width: 4px; height: 4px; background-color: #475569; border-radius: 50%; }

.title-section { margin-bottom: 12px; }
.main-title { display: block; font-size: 30px; font-weight: bold; line-height: 1.2; color: #fff; }
.sub-title { 
  display: block; font-size: 30px; font-weight: bold; line-height: 1.2;
  background: linear-gradient(to right, #ffffff, #64748b);
  -webkit-background-clip: text;
  color: transparent;
}

.warning-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: rgba(255, 59, 59, 0.1);
  border: 1px solid rgba(255, 59, 59, 0.3);
  border-radius: 4px;
  box-shadow: 0 0 15px rgba(255, 59, 59, 0.15);
}

.ping-wrapper { position: relative; width: 8px; height: 8px; display: flex; align-items: center; justify-content: center; }
.ping-ring {
  position: absolute; width: 100%; height: 100%;
  background-color: #ff3b3b;
  border-radius: 50%;
  opacity: 0.75;
  animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}
.ping-core { position: relative; width: 8px; height: 8px; background-color: #ff3b3b; border-radius: 50%; }
@keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }

.warning-text {
  color: #ff3b3b;
  font-size: 11px;
  font-weight: bold;
  letter-spacing: 1px;
  text-transform: uppercase;
}

/* Dashboard */
.dashboard { display: flex; flex-direction: column; gap: 24px; position: relative; z-index: 10; }

.glass-panel {
  background: rgba(24, 27, 33, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  overflow: hidden;
}

/* Metrics Grid */
.metrics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.metric-card { padding: 12px; height: 80px; position: relative; display: flex; flex-direction: column; justify-content: space-between; }

.card-icon-wrapper { position: absolute; top: 8px; right: 8px; opacity: 0.2; }
.card-icon { width: 18px; height: 18px; }

.card-label { font-size: 10px; color: #8b9bb4; text-transform: uppercase; letter-spacing: 1px; }
.card-value-group { margin-top: auto; }
.row { display: flex; align-items: baseline; gap: 4px; }
.card-value-lg { font-size: 18px; font-weight: bold; color: #fff; display: block; }
.card-value-sm { font-size: 10px; display: block; }
.card-value-xs { font-size: 10px; }
.text-cyan { color: #00f0ff; }
.text-dim { color: #64748b; }
.text-purple { color: #7b61ff; }

.card-line-cyan {
  position: absolute; bottom: 0; left: 0; width: 100%; height: 2px;
  background: linear-gradient(to right, #00f0ff, transparent);
  opacity: 0.5;
}
.card-line-purple {
  position: absolute; bottom: 0; left: 0; width: 100%; height: 2px;
  background: linear-gradient(to right, #7b61ff, transparent);
  opacity: 0.5;
}

/* Scan Visual */
.scan-visual {
  position: relative;
  width: 100%;
  height: 192px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background-color: #181b21;
  overflow: hidden;
}
.scan-line-overlay {
  position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: rgba(0, 240, 255, 0.5);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.8);
  animation: scan 3s linear infinite;
  z-index: 5;
}
.brain-bg { width: 100%; height: 100%; opacity: 0.6; mix-blend-mode: luminosity; }
.scan-overlay-gradient {
  position: absolute; inset: 0;
  background: linear-gradient(to top, #0f1115, transparent, transparent);
}
.scan-ui {
  position: absolute; inset: 0; padding: 16px;
  border: 1px dashed rgba(0, 240, 255, 0.2);
  margin: 16px;
  border-radius: 4px;
}
.brain-circle {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: 96px; height: 96px;
  border: 1px solid rgba(0, 240, 255, 0.3);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.pulse-slow { animation: pulse 3s infinite; }
.inner-circle {
  width: 64px; height: 64px;
  border: 1px solid rgba(0, 240, 255, 0.5);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.brain-icon { width: 32px; height: 32px; opacity: 0.8; }

.scan-data { position: absolute; }
.top-left { top: 16px; left: 16px; }
.bottom-right { bottom: 16px; right: 16px; text-align: right; }
.data-row { display: flex; align-items: center; gap: 4px; margin-bottom: 4px; }
.status-indicator { width: 4px; height: 4px; background: #ff3b3b; }
.data-text { font-size: 8px; font-family: monospace; }
.red { color: #ff3b3b; }
.cyan { color: #00f0ff; }
.dim { color: #64748b; }
.data-bar-container { width: 48px; height: 2px; background: #334155; overflow: hidden; }
.data-bar { height: 100%; background: #ff3b3b; }
.w-30 { width: 30%; }
.block { display: block; }
.mb-1 { margin-bottom: 4px; }

/* Diagnostic Cards */
.diag-card { padding: 20px; position: relative; border-left-width: 2px; border-left-style: solid; }
.border-l-cyan { border-left-color: #00f0ff; }
.border-l-red { border-left-color: #ff3b3b; }

.diag-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.diag-title-row { display: flex; align-items: center; gap: 8px; }
.diag-title { font-size: 18px; font-weight: bold; color: #fff; }
.tag {
  font-size: 10px; padding: 2px 6px; border-radius: 4px;
  background: #1e293b; color: #94a3b8; border: 1px solid #334155;
}

.chart-circle { position: relative; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; }
.circle-svg { width: 48px; height: 48px; transform: rotate(-90deg); }
.chart-value { position: absolute; font-size: 14px; font-weight: bold; color: #fff; }

.risk-indicator { display: flex; flex-direction: column; align-items: flex-end; }
.risk-text { font-size: 20px; font-weight: bold; letter-spacing: 1px; }
.risk-bars { display: flex; gap: 2px; margin-top: 4px; }
.bar { width: 6px; height: 12px; border-radius: 2px; }
.red { background-color: #ff3b3b; }
.text-green { color: #4ade80; }
.text-orange { color: #f97316; }
.orange { background-color: #f97316; }
.green { background-color: #4ade80; }
.border-l-green { border-left-color: #4ade80; }
.border-l-orange { border-left-color: #f97316; }
.dim { background-color: #334155; }

.diag-content {
  background: rgba(15, 17, 21, 0.5);
  padding: 12px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.diag-label { font-size: 14px; font-weight: bold; margin-bottom: 4px; display: flex; align-items: center; gap: 4px; }
.icon-sm { width: 14px; height: 14px; }
.diag-desc { font-size: 12px; color: #94a3b8; line-height: 1.6; }

/* Actions */
.actions { margin-top: 16px; display: flex; flex-direction: column; gap: 16px; }

.action-btn {
  position: relative;
  width: 100%;
  padding: 16px;
  border-radius: 8px;
  background: transparent;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(123, 97, 255, 0.25);
  border: none;
}
.shimmer-bg {
  position: absolute; inset: 0;
  background: linear-gradient(to right, #4f46e5, #7b61ff, #4f46e5);
  background-size: 200% 100%;
  animation: shimmer 3s infinite;
}
@keyframes shimmer { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }

.btn-inner { position: relative; display: flex; align-items: center; justify-content: center; gap: 8px; color: #fff; font-weight: bold; font-size: 16px; }
.btn-icon { width: 24px; height: 24px; }
.btn-hover { opacity: 0.9; transform: scale(0.99); }

.secondary-link {
  display: flex; align-items: center; justify-content: center; gap: 4px;
  font-size: 12px; color: #8b9bb4;
}
.link-icon { width: 14px; height: 14px; }
.link-hover { color: #fff; }

/* Entry Animations */
.fadeInUp { opacity: 0; transform: translateY(20px); animation: fadeInUp 0.6s ease-out forwards; }
.delay-1 { animation-delay: 0.2s; }
.delay-2 { animation-delay: 0.4s; }
.delay-3 { animation-delay: 0.6s; }

@keyframes fadeInUp {
  to { opacity: 1; transform: translateY(0); }
}

</style>