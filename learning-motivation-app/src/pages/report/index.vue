<template>
  <view class="container">
    <!-- Navbar -->
    <view class="custom-nav" :style="{ paddingTop: menuButtonTop + 'px', paddingBottom: navPaddingBottom + 'px' }">
      <view class="nav-back" @click="goHome">
        <text class="back-arrow">←</text>
      </view>
      <text class="nav-title">综合评估报告</text>
    </view>

    <scroll-view scroll-y class="report-content" :style="{ paddingTop: contentPaddingTop + 'px' }">
      
      <!-- Header / Status -->
      <view class="report-header fade-in">
        <view class="status-badge" :class="riskLevel.color">
          <text class="status-text">{{ riskLevel.text }}</text>
        </view>
        <text class="report-date">{{ currentDate }}</text>
      </view>

      <!-- Main Conclusion -->
      <view class="conclusion-card glass-card fade-in delay-1">
        <view class="card-title-row">
          <text class="material-icons card-icon">analytics</text>
          <text class="card-title">核心诊断结论</text>
        </view>
        <view class="conclusion-text">
          <text>根据多维神经反应测试与家长主诉交叉验证，受测者表现出</text>
          <text class="highlight">{{ riskLevel.diagnosis }}</text>
          <text>。情绪Stroop测试显示，家庭冲突相关词汇引起了显著的注意偏向，暗示潜意识层面的心理防御机制正在消耗认知资源。</text>
        </view>
      </view>

      <!-- Detailed Metrics Grid -->
      <view class="metrics-grid">
        <view 
          class="metric-card glass-card fade-in delay-2"
          v-for="(item, index) in results"
          :key="index"
          @click="goToDetail(item)"
        >
          <view class="metric-header">
            <text class="metric-label">{{ item.name }} ({{ item.type }})</text>
            <text class="metric-icon material-icons">chevron_right</text>
          </view>
          
          <view class="metric-value-row">
            <text class="metric-score">{{ item.score }}</text>
            <view class="metric-meta">
              <text class="metric-reference" v-if="item.reference">目标: {{ item.reference }}</text>
              <text class="metric-eval" :style="{ color: item.evalColor }">{{ item.evalText }}</text>
            </view>
          </view>
          <view class="progress-bar">
            <view class="progress-fill" :style="{ width: item.percentile + '%', backgroundColor: item.evalColor }"></view>
          </view>
        </view>
      </view>

      <!-- Emotional Impact -->
      <view class="emotional-card glass-card fade-in delay-3" v-if="emotionalResult">
        <view class="card-title-row">
          <text class="material-icons card-icon">psychology</text>
          <text class="card-title">情绪干扰分析</text>
        </view>
        <view class="chart-placeholder">
          <!-- Simple CSS Chart -->
          <view class="bar-group">
            <view class="bar neutral" style="height: 40%"></view>
            <text class="bar-label">中性词</text>
          </view>
          <view class="bar-group">
            <view class="bar emotional" style="height: 85%"></view>
            <text class="bar-label">敏感词</text>
          </view>
        </view>
        <text class="chart-desc">{{ emotionalResult.desc }}</text>
      </view>

      <!-- Recommendations -->
      <view class="recommendation-section fade-in delay-4">
        <text class="section-title">干预建议</text>
        <view class="rec-item">
          <text class="rec-index">01</text>
          <view class="rec-content">
            <text class="rec-head">停止"强行断网"</text>
            <text class="rec-body">生理检测显示前额叶抑制功能暂时受损，强行制止会导致更强烈的多巴胺渴求反弹。</text>
          </view>
        </view>
        <view class="rec-item">
          <text class="rec-index">02</text>
          <view class="rec-content">
            <text class="rec-head">启动认知复健</text>
            <text class="rec-body">建议进行为期 2 周的 SART-Go/NoGo 专项训练，修复受损的抑制神经回路。</text>
          </view>
        </view>
      </view>

      <view class="footer-spacer"></view>
    </scroll-view>

    <!-- Bottom Action -->
    <view class="bottom-action">
      <button class="consult-btn" hover-class="btn-hover" @click="contactExpert">
        <text>预约专家解读报告</text>
      </button>
    </view>

  </view>
</template>

<script>
import { evaluateScore, getTestNorms } from '@/utils/clinical-evaluator.js';
import mod01Config from '@/data/config_mod01.json';
import mod02Config from '@/data/config_mod02.json';
import mod03Config from '@/data/config_mod03.json';
import mod04Config from '@/data/config_mod04.json';
import mod05Config from '@/data/config_mod05.json';

const configMap = {
  '01': mod01Config,
  '02': mod02Config,
  '03': mod03Config,
  '04': mod04Config,
  '05': mod05Config
};

export default {
  data() {
    return {
      statusBarHeight: 20,
      menuButtonTop: 24,
      menuButtonHeight: 32,
      navPaddingBottom: 8,
      contentPaddingTop: 100,
      
      moduleId: '',
      moduleConfig: null,
      currentDate: new Date().toLocaleDateString(),
      age: 18,
      
      // Dynamic Results
      results: [],
      emotionalResult: null,
      
      // Computed Risk
      riskLevel: {
        text: '加载中...',
        color: '',
        diagnosis: ''
      }
    };
  },
  onLoad(options) {
    // 1. Layout Setup
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
    
    this.contentPaddingTop = this.menuButtonTop + this.menuButtonHeight + this.navPaddingBottom + 20;

    // 2. Get User Age
    const userProfile = uni.getStorageSync('user_profile');
    if (!userProfile || !userProfile.age) {
      uni.showModal({
        title: '需完善资料',
        content: '为了生成准确的评估报告，我们需要您的年龄信息进行常模比对。',
        showCancel: false,
        confirmText: '去完善',
        success: () => {
          uni.redirectTo({ url: '/pages/onboarding/calibration' });
        }
      });
      return;
    }
    this.age = userProfile.age;

    // 3. Load Module Data
    if (options.moduleId) {
      this.moduleId = options.moduleId;
      this.moduleConfig = configMap[this.moduleId];
      this.loadResults();
    }
  },
  methods: {
    goHome() {
      uni.reLaunch({ url: '/pages/index/index' });
    },
    contactExpert() {
      uni.showToast({ title: '已提交预约申请', icon: 'success' });
    },
    getEvalText(color) {
      if (color === '#00E5FF') return '优秀';
      if (color === '#FF3B30') return '异常';
      return '一般';
    },
    getEvalClass(color) {
      if (color === '#00E5FF') return 'good'; // You might need to add this class or use inline style
      if (color === '#FF3B30') return 'bad';
      return 'normal';
    },
    goToDetail(item) {
      if (!item.moduleId || !item.step) return;
      uni.navigateTo({
        url: `/pages/neural-link/result?moduleId=${item.moduleId}&step=${item.step}&testType=${item.type}`
      });
    },
    loadResults() {
      if (!this.moduleConfig || !this.moduleConfig.pipeline) return;

      const pipeline = this.moduleConfig.pipeline;
      const results = [];
      let riskCount = 0;
      let totalTests = 0;

      pipeline.forEach(item => {
        const key = `module_${this.moduleId}_step_${item.step}_data`;
        const data = uni.getStorageSync(key);
        
        if (data && data.metrics) {
          totalTests++;
          
          if (item.type === 'EmotionalStroop') {
            const score = data.metrics.interference || 0;
            const evalResult = evaluateScore(item.type, score, this.age);
            this.emotionalResult = {
              name: item.name,
              score: score + 'ms',
              eval: evalResult,
              desc: '情绪干扰效应显著，需关注。'
            };
            return;
          }

          let scoreValue = 0;
          let displayValue = '';
          let referenceText = '';
          
          const norms = getTestNorms(item.type, this.age);

          switch(item.type) {
            case 'PVT':
              scoreValue = data.metrics.avgTime || 0;
              displayValue = Math.round(scoreValue) + 'ms';
              if (norms) referenceText = `< ${norms.excellentMs}ms`;
              break;
            case 'SART':
              scoreValue = data.metrics.errors || (data.metrics.falseAlarms + data.metrics.omissions);
              displayValue = scoreValue + ' Errors';
              if (norms) referenceText = `< ${norms.excellentErrors}`;
              break;
            case 'NBack':
              scoreValue = data.metrics.accuracy || 0;
              displayValue = Math.round(scoreValue * 100) + '%';
              if (norms) referenceText = `> ${(norms.excellentAccuracy * 100)}%`;
              break;
            case 'Schulte':
              scoreValue = data.metrics.totalTime || 0;
              displayValue = Math.round(scoreValue) + 's';
              if (norms) referenceText = `< ${norms.excellentSec}s`;
              break;
            default:
              return;
          }

          const evalResult = evaluateScore(item.type, scoreValue, this.age);
          
          if (evalResult.color === '#FF3B30') {
            riskCount++;
          }

          results.push({
            name: item.name,
            type: item.type,
            score: displayValue,
            reference: referenceText,
            evalText: this.getEvalText(evalResult.color),
            evalColor: evalResult.color,
            percentile: evalResult.percentile,
            moduleId: this.moduleId,
            step: item.step
          });
        }
      });

      this.results = results;
      this.computeRiskLevel(riskCount, totalTests);
    },
    computeRiskLevel(riskCount, totalTests) {
      if (totalTests === 0) {
        this.riskLevel = {
            text: '数据不足',
            color: '',
            diagnosis: '请完成所有测试项目'
        };
        return;
      }

      if (riskCount >= 2) {
        this.riskLevel = {
            text: '高风险预警',
            color: 'bg-red',
            diagnosis: '多项认知指标异常，建议专业介入'
        };
      } else if (riskCount === 1) {
        this.riskLevel = {
            text: '中度风险',
            color: 'bg-yellow', // You need to define bg-yellow
            diagnosis: '部分功能区存在波动，建议保持关注'
        };
      } else {
        this.riskLevel = {
            text: '状态良好',
            color: 'bg-green', // You need to define bg-green
            diagnosis: '认知功能指标处于健康范围'
        };
      }
    }
  }
};
</script>

<style>
/* Global Dark Theme */
page {
  background-color: #050505;
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

.container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Navbar */
.custom-nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  background: rgba(5, 5, 5, 0.9);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  padding-left: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-back {
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  margin-right: 12px;
}

.back-arrow {
  font-size: 24px; color: #fff;
}

.nav-title {
  font-size: 16px; font-weight: 600; letter-spacing: 1px;
}

/* Content */
.report-content {
  flex: 1;
  padding: 0 20px;
  box-sizing: border-box;
}

/* Animations */
.fade-in {
  opacity: 0;
  transform: translateY(10px);
  animation: fadeInUp 0.6s ease forwards;
}
.delay-1 { animation-delay: 0.2s; }
.delay-2 { animation-delay: 0.4s; }
.delay-3 { animation-delay: 0.6s; }
.delay-4 { animation-delay: 0.8s; }

@keyframes fadeInUp {
  to { opacity: 1; transform: translateY(0); }
}

/* Status Header */
.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.status-badge {
  padding: 6px 16px;
  border-radius: 4px;
}
.bg-red { background: rgba(255, 71, 87, 0.2); border: 1px solid rgba(255, 71, 87, 0.5); }
.bg-yellow { background: rgba(250, 204, 21, 0.2); border: 1px solid rgba(250, 204, 21, 0.5); }
.bg-green { background: rgba(74, 222, 128, 0.2); border: 1px solid rgba(74, 222, 128, 0.5); }
.status-text {
  font-weight: bold; font-size: 14px; letter-spacing: 1px;
}
.bg-red .status-text { color: #ff4757; }
.bg-yellow .status-text { color: #facc15; }
.bg-green .status-text { color: #4ade80; }
.report-date {
  color: #666; font-size: 12px;
}

/* Glass Card */
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.card-title-row {
  display: flex; align-items: center; gap: 8px; margin-bottom: 16px;
}
.card-icon { color: #00E5FF; font-size: 20px; }
.card-title { color: #00E5FF; font-size: 16px; font-weight: 600; }

.conclusion-text {
  font-size: 15px; line-height: 1.6; color: #ccc;
}
.highlight { color: #ff4757; font-weight: bold; margin: 0 4px; }

/* Metrics Grid */
.metrics-grid {
  display: grid;
  grid-template-columns: 1fr; /* Stacked cards for more detail */
  gap: 16px;
  margin-bottom: 20px;
}

.metric-card {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  cursor: pointer;
  transition: transform 0.2s, background 0.2s;
}

.metric-card:active {
  transform: scale(0.98);
  background: rgba(255, 255, 255, 0.08);
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metric-label {
  font-size: 14px;
  color: #aaa;
  font-weight: 500;
}

.metric-icon {
  color: #666;
  font-size: 20px;
}

.metric-value-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.metric-score {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  font-family: 'SF Mono', 'Roboto Mono', monospace;
}

.metric-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.metric-reference {
  font-size: 12px;
  color: #666;
}

.metric-eval {
  font-size: 14px;
  font-weight: 600;
}

.progress-bar {
  height: 4px; background: rgba(255, 255, 255, 0.1); border-radius: 2px;
}
.progress-fill { height: 100%; border-radius: 2px; }
.red-fill { background: #ff4757; }

/* Emotional Chart */
.chart-placeholder {
  display: flex; justify-content: center; gap: 40px; height: 120px; align-items: flex-end; padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1); margin-bottom: 16px;
}
.bar-group {
  display: flex; flex-direction: column; align-items: center; gap: 8px; height: 100%; justify-content: flex-end;
}
.bar { width: 30px; border-radius: 4px 4px 0 0; position: relative; }
.bar.neutral { background: #00E5FF; box-shadow: 0 0 10px rgba(0, 229, 255, 0.3); }
.bar.emotional { background: #ff4757; box-shadow: 0 0 15px rgba(255, 71, 87, 0.4); }
.bar-label { font-size: 12px; color: #888; }
.chart-desc { font-size: 13px; color: #aaa; line-height: 1.5; }

/* Recommendations */
.rec-item {
  display: flex; gap: 16px; margin-bottom: 20px;
}
.rec-index {
  font-family: monospace; font-size: 24px; color: rgba(255, 255, 255, 0.2); font-weight: bold;
}
.rec-head {
  display: block; font-size: 16px; color: #fff; margin-bottom: 4px; font-weight: 600;
}
.rec-body {
  font-size: 14px; color: #888; line-height: 1.5;
}

/* Footer */
.footer-spacer { height: 100px; }

.bottom-action {
  position: fixed; bottom: 0; left: 0; right: 0;
  padding: 20px;
  background: linear-gradient(to top, #050505, rgba(5, 5, 5, 0.8));
  backdrop-filter: blur(5px);
}
.consult-btn {
  background: #00E5FF;
  color: #000;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  height: 50px;
  display: flex; align-items: center; justify-content: center;
}
.btn-hover { opacity: 0.9; transform: scale(0.98); }
</style>