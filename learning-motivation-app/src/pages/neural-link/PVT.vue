<template>
  <view class="container" @touchstart="testWxs.handleTouchStart" @click="handleClick">
    <!-- Navbar (Transparent/Custom) -->
    <view class="custom-nav" :style="{ paddingTop: menuButtonTop + 'px', paddingBottom: navPaddingBottom + 'px' }">
      <view class="nav-back" :style="{ height: menuButtonHeight + 'px', width: menuButtonHeight + 'px' }" @touchstart.stop="goBack">
        <image class="back-icon" :src="icons.back" mode="aspectFit"></image>
      </view>
      <view class="nav-center">
        <view class="status-indicator">
          <view class="ping-dot"></view>
          <view class="solid-dot"></view>
        </view>
        <text class="status-text">SYSTEM_READY</text>
      </view>
    </view>

    <!-- Main Content Area -->
    <view class="main-content">
      
      <!-- Header Text -->
      <view class="header-text-container">
        <text class="sub-header">CALIBRATION SEQUENCE</text>
        <view class="main-header-row">
           <text class="main-header">PVT 视动反应测试</text>
           <text class="cursor-blink">_</text>
        </view>
      </view>

      <!-- Central Test Card -->
      <view class="test-card" :class="cardStateClass">
        
        <!-- Progress Indicator -->
        <view class="round-indicator">
          <text class="round-text">ROUND {{ currentRound + 1 }} / {{ maxRounds }}</text>
        </view>

        <!-- READY State (Default) -->
        <template v-if="state === 'READY' || state === 'WAIT'">
          <image class="card-icon" :src="icons.touch" mode="aspectFit"></image>
          <view class="card-instruction">
            <text class="text-green">看到 绿色闪光</text>
            <text class="text-white">立即点击屏幕</text>
          </view>
          <view class="dots-indicator">
            <view 
              class="dot" 
              v-for="n in maxRounds" 
              :key="n" 
              :class="{ active: n === currentRound + 1 }"
            ></view>
          </view>
        </template>

        <!-- TRIGGER State -->
        <template v-else-if="state === 'TRIGGER'">
          <image class="lightning-icon" :src="icons.lightning" mode="aspectFit"></image>
          <text class="card-text-primary text-green">点击!</text>
        </template>

        <!-- EARLY State -->
        <template v-else-if="state === 'EARLY'">
          <image class="warning-icon" :src="icons.warning" mode="aspectFit"></image>
          <text class="card-text-primary text-red">抢跑!</text>
          <text class="card-text-secondary">请等待信号出现</text>
          <view class="retry-btn" @touchstart.stop="resetTest">
            <text>重试 / RETRY</text>
          </view>
        </template>

      </view>
    </view>

    <!-- Footer Area -->
    <view class="footer-area">
      <view class="hardware-monitor">
        <view class="monitor-col left">
          <text class="monitor-label">DISPLAY_REFRESH</text>
          <view class="monitor-row">
            <text class="monitor-val cyan-text">{{ fpsDisplay }}</text>
            <text class="monitor-unit cyan-text-dim">HZ</text>
          </view>
          <view class="monitor-bar-bg">
             <view class="monitor-bar-fill cyan-bg" style="width: 95%"></view>
          </view>
        </view>
        <view class="monitor-col right">
          <text class="monitor-label">SYSTEM_LATENCY</text>
          <view class="monitor-row">
            <text class="monitor-val green-text">{{ latencyDisplay }}</text>
            <text class="monitor-unit green-text-dim">MS</text>
          </view>
          <view class="monitor-bar-bg right-align">
             <view class="monitor-bar-fill green-bg" style="width: 80%"></view>
          </view>
        </view>
      </view>
      
      <view class="abort-btn-container" @touchstart.stop="goBack">
        <text class="abort-text">ABORT TEST</text>
      </view>
    </view>

    <!-- Decorative Elements -->
    <view class="grid-overlay"></view>
    <view class="scan-line"></view>
    <CountdownOverlay 
      v-if="showCountdown" 
      offset-y="-200rpx"
      @complete="handleCountdownComplete" 
    />
  </view>
</template>

<script module="testWxs" lang="wxs">
  function handleTouchStart(event, ownerInstance) {
    // Capture timestamp immediately in View Thread
    var timestamp = getDate().getTime();
    // Send to Logic Layer
    ownerInstance.callMethod('onWxsTouch', { timestamp: timestamp });
    // return false; // Prevent default if needed, though usually fine to bubble
  }
  module.exports = {
    handleTouchStart: handleTouchStart
  }
</script>

<script>
import CountdownOverlay from '@/components/CountdownOverlay.vue';

export default {
  components: {
    CountdownOverlay
  },
  data() {
    return {
      statusBarHeight: 20,
      menuButtonTop: 24,
      menuButtonHeight: 32,
      navPaddingBottom: 8,
      state: 'WAIT', // WAIT, READY, TRIGGER, EARLY
      startTime: 0,
      endTime: 0,
      timer: null,
      
      showCountdown: true,
      
      // Test Data
      reactionTimes: [],
      falseStartCount: 0,
      currentRound: 0,
      maxRounds: 5,
      
      // Hardware Monitor Data
      fps: 60.0,
      fpsDisplay: '60.0',
      lastFrameTime: 0,
      frameCount: 0,
      lastFpsUpdate: 0,
      latency: 16.6,
      latencyDisplay: '16.6',
      rafId: null,
      monitorInterval: null,
      
      icons: {
        back: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22%23FFFFFF%22%3E%3Cpath d%3D%22M11.67 3.87L9.9 2.1 0 12l9.9 9.9 1.77-1.77L3.54 12z%22%2F%3E%3C%2Fsvg%3E',
        lightning: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22%2339FF14%22%3E%3Cpath d%3D%22M7 2v11h3v9l7-12h-4l4-8z%22%2F%3E%3C%2Fsvg%3E',
        warning: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22%23FF4d4f%22%3E%3Cpath d%3D%22M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z%22%2F%3E%3C%2Fsvg%3E',
        touch: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22%2300FFFF%22%3E%3Cpath d%3D%22M9 11.24V7.5C9 6.12 10.12 5 11.5 5S14 6.12 14 7.5v3.74c1.21-.81 2-2.18 2-3.74C16 5.01 13.99 3 11.5 3S7 5.01 7 7.5c0 1.56.79 2.93 2 3.74zm9.84 4.63l-4.54-2.26c-.17-.07-.35-.11-.54-.11H13v-6c0-.83-.67-1.5-1.5-1.5S10 6.67 10 7.5v10.74l-3.43-.72c-.08-.01-.15-.03-.24-.03-.31 0-.59.13-.79.33l-.79.8 4.94 4.94c.27.27.65.44 1.06.44h6.79c.75 0 1.33-.55 1.44-1.28l.75-5.27c.01-.07.02-.14.02-.2 0-.62-.38-1.16-.91-1.38z%22%2F%3E%3C%2Fsvg%3E'
      }
    };
  },
  computed: {
    cardStateClass() {
      if (this.state === 'WAIT') return 'card-wait';
      if (this.state === 'READY') return 'card-ready';
      if (this.state === 'TRIGGER' || this.state === 'FINISHED') return 'card-trigger';
      if (this.state === 'EARLY') return 'card-early';
      return '';
    },
    latencyClass() {
      if (this.latency > 25) return 'red-text';
      if (this.latency > 18) return 'yellow-text';
      return 'cyan-text';
    }
  },
  onLoad() {
    const sysInfo = uni.getSystemInfoSync();
    this.statusBarHeight = sysInfo.statusBarHeight || 20;

    // #ifdef MP-WEIXIN
    const menuButton = uni.getMenuButtonBoundingClientRect();
    this.menuButtonTop = menuButton.top;
    this.menuButtonHeight = menuButton.height;
    this.navPaddingBottom = menuButton.top - this.statusBarHeight;
    if (this.navPaddingBottom < 4) this.navPaddingBottom = 4;
    // #endif
    // #ifndef MP-WEIXIN
    this.menuButtonTop = this.statusBarHeight + 4;
    this.menuButtonHeight = 32;
    this.navPaddingBottom = 4;
    // #endif

    this.startHardwareMonitor();
    // this.initTest();
  },
  onUnload() {
    this.stopHardwareMonitor();
    if (this.timer) clearTimeout(this.timer);
  },
  methods: {
    handleCountdownComplete() {
      this.showCountdown = false;
      this.initTest();
    },
    goBack(e) {
      console.log('[NeuralTest] User clicked Back', e);
      uni.navigateBack();
    },
    
    // --- Hardware Monitor ---
    startHardwareMonitor() {
      // Setup FPS loop
      this.lastFrameTime = Date.now();
      this.lastFpsUpdate = Date.now();
      
      const loop = () => {
        const now = Date.now();
        const delta = now - this.lastFrameTime;
        this.lastFrameTime = now;
        
        // Calculate Latency (Frame Time)
        this.latency = delta;
        
        // Count Frames for FPS
        this.frameCount++;
        
        // Update UI every 500ms
        if (now - this.lastFpsUpdate >= 500) {
          const elapsed = now - this.lastFpsUpdate;
          this.fps = (this.frameCount * 1000) / elapsed;
          
          this.fpsDisplay = this.fps.toFixed(1);
          this.latencyDisplay = this.latency.toFixed(1);
          
          this.frameCount = 0;
          this.lastFpsUpdate = now;
        }
        
        // Continue loop - utilizing requestAnimationFrame if available or fallback
        // In UniApp/WeChat, canvas.requestAnimationFrame is preferred but window.requestAnimationFrame might work
        // Using a safe fallback approach
        if (typeof requestAnimationFrame === 'function') {
           this.rafId = requestAnimationFrame(loop);
        } else {
           this.rafId = setTimeout(loop, 16);
        }
      };
      
      loop();
    },
    stopHardwareMonitor() {
      if (this.rafId) {
        if (typeof cancelAnimationFrame === 'function') {
          cancelAnimationFrame(this.rafId);
        } else {
          clearTimeout(this.rafId);
        }
      }
    },
    
    // --- UI Helpers ---
    stopTouch(e) {
      console.log('[NeuralTest] Touch stopped on UI element');
      // Stop propagation for UI buttons to prevent triggering game logic
      // e.stopPropagation() is handled by @touchstart.stop
    },

    // --- Game Logic ---
    initTest() {
      this.reactionTimes = [];
      this.falseStartCount = 0;
      this.currentRound = 0;
      this.startCalibration();
    },

    startCalibration() {
      // Skip calibration UI, go straight to READY logic
      this.state = 'READY';
      this.scheduleTrigger();
    },
    
    scheduleTrigger() {
      // Random delay 2000-5000ms
      const delay = Math.floor(Math.random() * 3000) + 2000;
      this.timer = setTimeout(() => {
        if (this.state === 'READY') {
          this.triggerSignal();
        }
      }, delay);
    },
    
    triggerSignal() {
      this.state = 'TRIGGER';
      this.startTime = Date.now();
      // Vibrate to signal
      try {
        uni.vibrateShort();
      } catch (err) {
        console.error('[NeuralTest] Vibrate failed', err);
      }
    },
    
    // Called by WXS
    onWxsTouch(data) {
      this.handleAction(data.timestamp);
    },
    
    handleTouchStart() {
      // Legacy handler, just in case WXS fails or non-WXS env
      this.handleAction();
    },
    
    handleClick(e) {
      // Fallback if touchstart didn't trigger
      console.log('[NeuralTest] Click Triggered', e);
      this.handleAction();
    },
    
    handleAction(timestamp) {
      console.log(`[NeuralTest] Action Triggered. State: ${this.state}, Timestamp: ${timestamp || 'now'}`);
      
      if (this.state === 'WAIT' || this.state === 'FINISHED') {
        // Ignore
        return;
      }
      
      const actionTime = timestamp || Date.now();
      
      if (this.state === 'READY') {
        // False start
        this.falseStartCount++;
        this.state = 'EARLY';
        if (this.timer) clearTimeout(this.timer);
        
        try {
          uni.vibrateShort();
        } catch (err) {
          console.error('[NeuralTest] Vibrate failed', err);
        }
        return;
      }
      
      if (this.state === 'TRIGGER') {
        this.state = 'FINISHED'; // Prevent double-trigger (touchstart + click)
        this.endTime = actionTime;
        const reactionTime = this.endTime - this.startTime;
        console.log(`[NeuralTest] Round ${this.currentRound + 1} Valid Reaction! Time: ${reactionTime}ms`);
        
        this.reactionTimes.push(reactionTime);
        
        if (this.currentRound < this.maxRounds - 1) {
          // Prepare next round
          this.currentRound++;
          setTimeout(() => {
            this.startCalibration();
          }, 1000);
        } else {
          // Finish
          this.completeTest();
        }
      }
    },
    
    resetTest() {
      console.log('[NeuralTest] User clicked Retry');
      // Retry the current round
      this.startCalibration();
    },
    
    completeTest() {
      const jsonStr = JSON.stringify({
        reactionTimes: this.reactionTimes,
        falseStartCount: this.falseStartCount
      });
      uni.redirectTo({
        url: `/pages/neural-link/PVT-result?data=${encodeURIComponent(jsonStr)}`
      });
    }
  }
};
</script>

<style>
/* Global Colors */
.cyan-text { color: #00FFFF; }
.red-text { color: #FF4d4f; }
.yellow-text { color: #FFC107; }

page {
  height: 100%;
  background-color: #0F172A;
}

.container {
  width: 100%;
  height: 100%;
  background-color: #0F172A;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Navbar */
.custom-nav {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between; /* Changed to space-between for center alignment */
  padding-left: 32rpx;
  padding-right: 32rpx;
  box-sizing: border-box;
  z-index: 100;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(4px);
  border-bottom: 1px solid rgba(19, 200, 236, 0.2);
}

.nav-back {
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 101;
  border-radius: 16rpx;
  transition: background 0.3s;
}
.nav-back:active {
  background: rgba(19, 200, 236, 0.1);
}

.back-icon {
  width: 48rpx;
  height: 48rpx;
}

.nav-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column; /* Column layout for dots and text */
  align-items: center;
  gap: 8rpx;
}

.status-indicator {
  position: relative;
  display: flex;
  width: 16rpx;
  height: 16rpx;
}

.ping-dot {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #13c8ec;
  opacity: 0.75;
  animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.solid-dot {
  position: relative;
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background-color: #13c8ec;
}

.status-text {
  font-size: 20rpx;
  font-weight: bold;
  letter-spacing: 0.2em;
  color: rgba(19, 200, 236, 0.8);
  text-transform: uppercase;
}

/* Main Content */
.main-content {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around; /* Match code_1.html justify-around */
  position: relative;
  z-index: 10;
  padding: 48rpx;
  box-sizing: border-box;
}

/* Header Text */
.header-text-container {
  width: 100%;
  text-align: center;
  margin-bottom: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.sub-header {
  color: rgba(19, 200, 236, 0.6);
  font-size: 24rpx; /* text-sm */
  font-weight: bold;
  letter-spacing: 0.3em;
  text-transform: uppercase;
}

.main-header-row {
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-header {
  color: #FFFFFF;
  font-size: 48rpx; /* text-3xl approx */
  font-weight: bold;
  letter-spacing: -1rpx; /* tracking-tight */
  animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.cursor-blink {
  color: #FFFFFF;
  font-size: 48rpx;
  font-weight: bold;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Test Card */
.test-card {
  width: 100%;
  max-width: 600rpx; /* max-w-md approx */
  aspect-ratio: 4 / 5;
  border: 4rpx solid rgba(19, 200, 236, 0.8);
  border-radius: 64rpx; /* rounded-[2rem] */
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 32rpx;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(8px);
  box-shadow: 0 0 64rpx rgba(19, 200, 236, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.round-indicator {
  position: absolute;
  top: 32rpx;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
}

.round-text {
  color: rgba(255, 255, 255, 0.4);
  font-size: 24rpx;
  letter-spacing: 0.2em;
  font-weight: bold;
}

.card-wait {
  /* Default style */
}

.card-trigger {
  border-color: #39FF14; /* Green for trigger */
  box-shadow: 0 0 60rpx rgba(57, 255, 20, 0.5);
}

.card-early {
  border-color: #FF4d4f;
  box-shadow: 0 0 60rpx rgba(255, 77, 79, 0.3);
}

.card-icon {
  width: 96rpx; /* 48px */
  height: 96rpx;
  margin-bottom: 24rpx;
  /* Ideally filter to emerald-400 if using image, or use font icon */
}

.card-instruction {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16rpx;
}

.text-green {
  color: #34d399; /* emerald-400 */
  font-size: 36rpx; /* text-xl */
  font-weight: bold;
  letter-spacing: 1rpx;
}

.text-white {
  color: #FFFFFF;
  font-size: 36rpx; /* text-xl */
  font-weight: bold;
  letter-spacing: 1rpx;
}

/* Dots */
.dots-indicator {
  display: flex;
  gap: 16rpx;
}

.dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background-color: rgba(19, 200, 236, 0.3); /* primary/30 */
}

.dot.active {
  background-color: #13c8ec; /* primary */
  box-shadow: 0 0 16rpx rgba(19, 200, 236, 1);
  transform: scale(1.2);
}

/* Footer Area */
.footer-area {
  width: 100%;
  background: rgba(15, 23, 42, 0.9);
  border-top: 1px solid rgba(19, 200, 236, 0.1);
  padding: 48rpx 48rpx 64rpx;
  box-sizing: border-box;
  position: relative;
  z-index: 20;
}

.hardware-monitor {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32rpx;
  max-width: 600rpx;
  margin: 0 auto;
  padding-top: 32rpx;
  border-top: 1px solid rgba(19, 200, 236, 0.05);
}

.monitor-col {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.monitor-col.left {
  align-items: flex-start;
}

.monitor-col.right {
  align-items: flex-end;
  text-align: right;
}

.monitor-label {
  font-family: 'Roboto Mono', monospace;
  font-size: 18rpx; /* text-[9px] */
  color: rgba(19, 200, 236, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-weight: 500;
}

.monitor-row {
  display: flex;
  align-items: baseline;
  gap: 4rpx;
}

.monitor-val {
  font-family: 'Roboto Mono', monospace;
  font-size: 40rpx; /* text-xl */
  font-weight: bold;
  line-height: 1;
  letter-spacing: -1rpx;
}

.monitor-unit {
  font-family: 'Roboto Mono', monospace;
  font-size: 20rpx; /* text-[10px] */
  text-transform: uppercase;
}

.monitor-bar-bg {
  width: 100%;
  height: 4rpx; /* h-0.5 */
  background: rgba(31, 41, 55, 0.5); /* gray-800/50 */
  border-radius: 9999px;
  overflow: hidden;
  margin-top: 8rpx;
  display: flex;
}
.monitor-bar-bg.right-align {
  justify-content: flex-end;
}

.monitor-bar-fill {
  height: 100%;
  opacity: 0.5;
}

.abort-btn-container {
  margin-top: 48rpx;
  display: flex;
  justify-content: center;
}

.abort-text {
  color: #4b5563; /* gray-600 */
  font-size: 24rpx; /* text-xs */
  text-transform: uppercase;
  letter-spacing: 0.2em; /* tracking-widest */
  border-bottom: 1px solid transparent;
  padding-bottom: 4rpx;
  transition: all 0.3s;
}
.abort-text:active {
  color: #9ca3af; /* gray-400 */
  border-color: #4b5563;
}

/* Colors matching code_1.html */
.cyan-text { color: #00FFFF; }
.cyan-text-dim { color: rgba(0, 255, 255, 0.6); }
.cyan-bg { background-color: #00FFFF; }

.green-text { color: #00FF00; }
.green-text-dim { color: rgba(0, 255, 0, 0.6); }
.green-bg { background-color: #00FF00; }

/* Background Effects */
.grid-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* bg-grid pattern */
  background-image: 
    linear-gradient(to right, rgba(30, 41, 59, 1) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(30, 41, 59, 1) 1px, transparent 1px);
  background-size: 80rpx 80rpx; /* 40px */
  opacity: 0.2;
  pointer-events: none;
  z-index: 0;
}

.scan-line {
  /* crt-overlay */
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%),
    linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03));
  background-size: 100% 4rpx, 6rpx 100%;
  pointer-events: none;
  z-index: 50;
  opacity: 0.4;
}

/* Animations */
@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}
@keyframes pulse-slow {
  0%, 100% { opacity: 1; }
  50% { opacity: .5; }
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .5; }
}

/* Helper for card states text colors if needed */
.card-text-primary {
  color: #00FFFF;
  font-size: 32rpx;
  font-weight: bold;
  margin-top: 30rpx;
  letter-spacing: 2rpx;
}
.card-text-secondary {
  color: rgba(255, 255, 255, 0.5);
  font-size: 24rpx;
  margin-top: 10rpx;
  letter-spacing: 2rpx;
}
.lightning-icon {
  width: 200rpx;
  height: 200rpx;
  animation: pulse 0.1s infinite;
}
.warning-icon {
  width: 120rpx;
  height: 120rpx;
  margin-bottom: 20rpx;
}
.retry-btn {
  margin-top: 40rpx;
  padding: 16rpx 40rpx;
  border: 2rpx solid #FF4d4f;
  border-radius: 8rpx;
  color: #FF4d4f;
  font-size: 24rpx;
  background: rgba(255, 77, 79, 0.1);
  position: relative;
  z-index: 20;
}
</style>