<template>
  <view class="container">
    <!-- Grid Background -->
    <view class="grid-bg"></view>

    <!-- Header -->
    <view class="header" :style="{ paddingTop: menuButtonTop + 'px', paddingBottom: navPaddingBottom + 'px' }">
      <view class="header-top" :style="{ height: menuButtonHeight + 'px' }">
        <view class="left-controls">
          <view class="nav-back" @click="goBack">
            <text class="back-arrow">←</text>
          </view>
          
        </view>
        <!-- Timer moved or kept with padding -->
      </view>
      
      <!-- Timer and Status Row (New) -->
      <view class="status-row">
        <view class="timer-pill">
          <text class="material-icons timer-icon">timer</text>
          <text class="timer-text">{{ formattedTime }}</text>
        </view>
        <view class="system-status">
           <text class="status-text">SYSTEM_ACTIVE</text>
        </view>
      </view>

      <!-- Ruler Progress -->
      <view class="progress-section">
        <view class="ruler-track">
          <view class="ruler-fill" :style="{ width: progressPercent + '%' }">
            <view class="ruler-glow"></view>
          </view>
          <view class="ruler-thumb" :style="{ left: progressPercent + '%' }"></view>
        </view>
        <view class="ruler-ticks">
          <view v-for="i in 20" :key="i" class="tick" :class="{ 'tick-major': i % 5 === 0 }"></view>
        </view>
      </view>
      
    </view>

    <!-- Main Stimulus -->
    <view class="stimulus-area">
      <view class="instruction">
        <text>请选择字体的 </text>
        <text class="highlight-cyan">颜色</text>
      </view>

      <view class="word-container" :class="{ 'floating': isFloating }">
        <text 
          class="stimulus-word" 
          :style="{ color: currentInkColor, textShadow: '0 0 40rpx ' + currentInkColor + '80' }"
        >{{ currentWordText }}</text>
      </view>
      
      <!-- Feedback Effect -->
      <view v-if="feedback" class="feedback-overlay" :class="feedback">
        <text class="material-icons feedback-icon">{{ feedback === 'correct' ? 'check_circle' : 'cancel' }}</text>
      </view>
    </view>

    <!-- Controls -->
    <view class="controls-area">
      <view 
        v-for="(btn, index) in currentButtons"
        :key="index"
        class="control-btn"
        :class="btn.class"
        hover-class="btn-hover" 
        @click="handleInput(btn.type)"
      >
        <view class="btn-content">
          <text class="btn-label">{{ btn.label }}</text>
          <text class="btn-sub">{{ btn.sub }}</text>
        </view>
        <view class="btn-corner tl"></view>
        <view class="btn-corner tr"></view>
        <view class="btn-corner bl"></view>
        <view class="btn-corner br"></view>
      </view>
    </view>

    <!-- Footer -->
    <view class="footer">
      <text class="session-info">CURRENT SESSION {{ String(currentRound).padStart(2, '0') }} / {{ maxRounds }}</text>
      <view class="pagination">
        <view 
          v-for="n in 5" 
          :key="n" 
          class="dot" 
          :class="{ active: (currentRound % 5) >= n || (currentRound % 5 === 0 && n === 5) }"
        ></view>
      </view>
    </view>
    
    <!-- Countdown Overlay -->
    <CountdownOverlay 
      v-if="showCountdown" 
      @complete="handleCountdownComplete" 
    />
  </view>
</template>

<script>
import CountdownOverlay from '@/components/CountdownOverlay.vue';

export default {
  components: {
    CountdownOverlay
  },
  data() {
    return {
      showCountdown: true,
      statusBarHeight: 20,
      menuButtonTop: 24, // Default
      menuButtonHeight: 32, // Default
      navPaddingBottom: 8, // Default
      
      // Game Config
      maxRounds: 20,
      roundDuration: 3000, // ms per round (not used strictly if using global timer, but prompt implies global timer)
      // Prompt says "Timer: 00:15". Usually Stroop is timed. Let's say 15 seconds total or per round?
      // "CURRENT SESSION 04 / 20" implies rounds.
      // 15s is very short for 20 rounds. Maybe 15s remaining?
      // Let's assume 15s is the *Limit* per round or Total time?
      // Actually, usually it's "Do as many as you can" or "Complete 20 as fast as possible".
      // Let's interpret: 20 Rounds fixed. Timer counts UP or DOWN.
      // "Timer... 00:15". Let's set a global time limit or just a timer.
      // Given "Brain Age", speed matters. Let's count DOWN from 60s for 20 rounds?
      // Or maybe the prompt's "00:15" is just a placeholder.
      // Let's make it: 20 Rounds. Timer counts total time taken.
      
      currentRound: 1,
      startTime: 0,
      totalTime: 0,
      timerInterval: null,
      displayTime: 15, // Seconds remaining logic? Or elapsed?
      // Let's try: User has 15 seconds to answer EACH? No, too easy.
      // Let's try: Total time limit 30s?
      // Let's just track elapsed time for scoring, but show a countdown for pressure?
      // Let's stick to the visual: "00:15". Maybe it's counting down.
      
      // Game State
      currentWordText: '黄',
      currentInkColor: '#00E5FF', // Hex for Blue/Cyan
      currentInkType: 'blue', // 'blue' or 'yellow'
      
      score: 0,
      errors: 0,
      reactionTimes: [],
      roundStartTime: 0,
      
      isFloating: true,
      feedback: null, // 'correct' | 'wrong'
      
      // Assets
      words: ['红', '绿', '蓝', '黄', '紫', '黑'],
      colors: {
        blue: '#0099FF', // Bright Blue
        yellow: '#FFFF00', // Bright Yellow
        red: '#FF4444'     // Bright Red
      },
      currentButtons: []
    };
  },
  computed: {
    formattedTime() {
      // Format displayTime (seconds) to MM:SS
      const m = Math.floor(this.displayTime / 60);
      const s = this.displayTime % 60;
      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    },
    progressPercent() {
      return (this.currentRound / this.maxRounds) * 100;
    }
  },
  onLoad() {
    const sysInfo = uni.getSystemInfoSync();
    this.statusBarHeight = sysInfo.statusBarHeight || 20;

    // Get Menu Button (Capsule) Info for Alignment
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

    // this.startGame(); // Moved to handleCountdownComplete
  },
  onUnload() {
    this.stopTimer();
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    handleCountdownComplete() {
      this.showCountdown = false;
      this.startGame();
    },
    startGame() {
      this.currentRound = 1;
      this.score = 0;
      this.errors = 0;
      this.reactionTimes = [];
      this.displayTime = 20; // 20 seconds to finish 20 rounds? Or just a timer.
      // Let's make it a countdown. If 0, game over.
      
      this.nextRound();
      this.startTimer();
    },
    
    startTimer() {
      // Clear existing timer if any
      this.stopTimer();
      
      this.startTime = Date.now();
      // Start with 20 seconds
      this.displayTime = 20; 
      
      this.timerInterval = setInterval(() => {
        if (this.displayTime > 0) {
          this.displayTime--;
        } else {
          // Time's up!
          this.stopTimer();
          this.finishGame(); 
        }
      }, 1000);
    },
    
    stopTimer() {
      if (this.timerInterval) clearInterval(this.timerInterval);
    },
    
    nextRound() {
      if (this.currentRound > this.maxRounds) {
        this.finishGame();
        return;
      }
      
      this.roundStartTime = Date.now();
      this.feedback = null;
      
      // 1. Decide Target Ink Color
      const targetTypes = ['blue', 'yellow', 'red'];
      const type = targetTypes[Math.floor(Math.random() * targetTypes.length)];
      this.currentInkType = type;
      this.currentInkColor = this.colors[type];
      
      // 2. Decide Word Text (Distractor)
      // Restricted to red/yellow/blue to ensure we can create a button for it.
      const distractorWords = ['红', '黄', '蓝'];
      this.currentWordText = distractorWords[Math.floor(Math.random() * distractorWords.length)];
      
      // Map Chinese word to color type
      const wordToType = {
        '红': 'red',
        '黄': 'yellow',
        '蓝': 'blue'
      };
      const textType = wordToType[this.currentWordText];

      // 3. Randomize Buttons (Only 2 buttons)
      const allButtons = [
        { type: 'blue', label: '蓝色', sub: 'SYNC BLUE', class: 'blue-btn' },
        { type: 'yellow', label: '黄色', sub: 'SYNC YELLOW', class: 'yellow-btn' },
        { type: 'red', label: '红色', sub: 'SYNC RED', class: 'red-btn' }
      ];

      // Button A: Correct Answer (Ink Color)
      const correctButton = allButtons.find(b => b.type === this.currentInkType);

      // Button B: Distractor (Text Content)
      let distractorButton = allButtons.find(b => b.type === textType);

      // If Correct Answer == Text Content (Congruent), pick a random OTHER color
      if (this.currentInkType === textType) {
        const otherOptions = allButtons.filter(b => b.type !== this.currentInkType);
        distractorButton = otherOptions[Math.floor(Math.random() * otherOptions.length)];
      }

      // Combine correct and distractor buttons
      const buttons = [correctButton, distractorButton];
      
      // Fisher-Yates Shuffle
      for (let i = buttons.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [buttons[i], buttons[j]] = [buttons[j], buttons[i]];
      }
      
      this.currentButtons = buttons;
    },
    
    handleInput(inputType) {
      if (this.feedback) return; // Prevent double tap
      
      const reactionTime = Date.now() - this.roundStartTime;
      this.reactionTimes.push(reactionTime);
      
      const isCorrect = (inputType === this.currentInkType);
      
      if (isCorrect) {
        this.score++;
        this.feedback = 'correct';
      } else {
        this.errors++;
        this.feedback = 'wrong';
        // Haptic feedback
        uni.vibrateShort();
      }
      
      // Delay for visual feedback then next round
      setTimeout(() => {
        this.currentRound++;
        this.nextRound();
      }, 300);
    },
    
    finishGame() {
      this.stopTimer();
      const totalTime = Date.now() - this.startTime;
      const avgReaction = this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length;
      
      // Navigate to Result
      uni.redirectTo({
        url: `/pages/neural-link/Stroop-result?score=${this.score}&errors=${this.errors}&avgTime=${Math.round(avgReaction)}&totalTime=${totalTime}`
      });
    }
  }
};
</script>

<style>
/* Font */
@font-face {
  font-family: 'Material Icons';
  src: url(https://fonts.gstatic.com/s/materialicons/v139/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2) format('woff2');
}
.material-icons {
  font-family: 'Material Icons';
  font-size: 24px;
  line-height: 1;
}

page {
  background-color: #020b1c;
  color: #fff;
  font-family: 'Inter', sans-serif;
}

.container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

/* Background */
.grid-bg {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background-image: 
    linear-gradient(rgba(0, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
  z-index: 0;
}

/* Header */
.header {
  padding-left: 32rpx;
  padding-right: 32rpx; /* Ensure padding on right */
  z-index: 10;
  display: flex;
  flex-direction: column;
}

.header-top {
  display: flex;
  align-items: center;
  /* Height is set inline */
}

.left-controls {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.nav-back {
  width: 70rpx;
  height: 70rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  margin-left: 0;
}

.back-arrow {
  color: #fff;
  font-size: 40rpx;
  font-weight: bold;
  line-height: 1;
}

.status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12rpx;
  margin-bottom: 24rpx;
}

.title-box {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.logo-icon {
  color: #00E5FF;
  font-size: 36rpx;
}

.app-title {
  color: #00E5FF;
  font-size: 28rpx;
  font-weight: 700;
  letter-spacing: 2px;
}

.timer-pill {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  padding: 8rpx 24rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.timer-icon {
  font-size: 24rpx;
  color: #ccc;
}

.timer-text {
  font-family: monospace;
  font-size: 28rpx;
  font-weight: 700;
}

/* Ruler Progress */
.progress-section {
  margin-bottom: 12rpx;
}

.ruler-track {
  height: 4rpx;
  background: rgba(255, 255, 255, 0.1);
  position: relative;
  margin-bottom: 8rpx;
}

.ruler-fill {
  height: 100%;
  background: #00E5FF;
  position: relative;
  transition: width 0.3s ease;
}

.ruler-glow {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 20rpx;
  height: 20rpx;
  background: #00E5FF;
  filter: blur(8rpx);
}

.ruler-thumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 12rpx;
  height: 12rpx;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 0 10rpx #00E5FF;
  transition: left 0.3s ease;
}

.ruler-ticks {
  display: flex;
  justify-content: space-between;
  padding: 0 2rpx;
}

.tick {
  width: 1px;
  height: 6rpx;
  background: rgba(255, 255, 255, 0.2);
}

.tick-major {
  height: 10rpx;
  background: rgba(255, 255, 255, 0.4);
}

.system-status {
  display: flex;
  justify-content: space-between;
  font-size: 18rpx;
  color: rgba(255, 255, 255, 0.3);
  letter-spacing: 1px;
  font-family: monospace;
}

/* Stimulus */
.stimulus-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.instruction {
  font-size: 32rpx;
  color: #ccc;
  margin-bottom: 80rpx;
}

.highlight-cyan {
  color: #00E5FF;
  font-weight: bold;
  text-shadow: 0 0 10rpx rgba(0, 229, 255, 0.5);
}

.word-container {
  position: relative;
  transition: transform 0.2s;
}

.floating {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20rpx); }
}

.stimulus-word {
  font-size: 240rpx;
  font-weight: 900;
  line-height: 1;
}

/* Feedback Overlay */
.feedback-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200rpx;
  height: 200rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  z-index: 20;
}

.correct {
  background: rgba(16, 185, 129, 0.2);
  border: 2px solid #10B981;
}

.wrong {
  background: rgba(239, 68, 68, 0.2);
  border: 2px solid #EF4444;
}

.feedback-icon {
  font-size: 80rpx;
}

.correct .feedback-icon { color: #10B981; }
.wrong .feedback-icon { color: #EF4444; }

/* Controls */
.controls-area {
  padding: 40rpx 40rpx 80rpx;
  display: flex;
  gap: 20rpx;
  z-index: 10;
}

.control-btn {
  flex: 1;
  height: 240rpx;
  background: rgba(2, 11, 28, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24rpx;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.1s;
}

.btn-hover {
  transform: scale(0.96);
  background: rgba(255, 255, 255, 0.05);
}

.btn-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.btn-label {
  font-size: 48rpx;
  font-weight: 700;
  letter-spacing: 2px;
}

.btn-sub {
  font-size: 18rpx;
  font-weight: 700;
  letter-spacing: 1px;
  opacity: 0.8;
}

/* Blue Button Style */
.blue-btn {
  box-shadow: 0 0 30rpx rgba(0, 153, 255, 0.1) inset;
  border-color: rgba(0, 153, 255, 0.3);
}
.blue-btn .btn-label { color: #0099FF; }
.blue-btn .btn-sub { color: #0099FF; }

/* Yellow Button Style */
.yellow-btn {
  box-shadow: 0 0 30rpx rgba(255, 255, 0, 0.1) inset;
  border-color: rgba(255, 255, 0, 0.3);
}
.yellow-btn .btn-label { color: #FFFF00; }
.yellow-btn .btn-sub { color: #FFFF00; }

/* Red Button Style */
.red-btn {
  box-shadow: 0 0 30rpx rgba(255, 68, 68, 0.1) inset;
  border-color: rgba(255, 68, 68, 0.3);
}
.red-btn .btn-label { color: #FF4444; }
.red-btn .btn-sub { color: #FF4444; }

/* Tech Corners */
.btn-corner {
  position: absolute;
  width: 12rpx;
  height: 12rpx;
  border-color: inherit;
  border-style: solid;
}
.tl { top: -1px; left: -1px; border-width: 2px 0 0 2px; }
.tr { top: -1px; right: -1px; border-width: 2px 2px 0 0; }
.bl { bottom: -1px; left: -1px; border-width: 0 0 2px 2px; }
.br { bottom: -1px; right: -1px; border-width: 0 2px 2px 0; }

/* Footer */
.footer {
  padding: 0 40rpx 60rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
}

.session-info {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 700;
  letter-spacing: 2px;
}

.pagination {
  display: flex;
  gap: 12rpx;
}

.dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
}

.dot.active {
  background: #00E5FF;
  box-shadow: 0 0 8rpx #00E5FF;
}
</style>