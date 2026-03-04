<template>
  <view class="tab-bar">
    <!-- Tab 1: Home (Cyan) -->
    <view class="tab-item" @click="switchTab('/pages/index/index')">
      <view class="icon-box" :class="{ 'active-cyan': currentTab === 'home' }">
        <image class="tab-icon" :src="currentTab === 'home' ? icons.radarActive : icons.radar" mode="aspectFit"></image>
      </view>
      <text class="tab-label" :class="{ 'text-cyan': currentTab === 'home' }">首页</text>
      <view class="glow" v-if="currentTab === 'home'"></view>
    </view>

    <!-- Tab 2: Share (Purple) -->
    <button class="tab-item share-btn" open-type="share">
      <view class="icon-box">
        <image class="tab-icon" :src="icons.share" mode="aspectFit"></image>
      </view>
      <text class="tab-label">分享</text>
    </button>

    <!-- Tab 3: Expert (Gold) -->
    <view class="tab-item" @click="switchTab('/pages/intervention/index')">
      <view class="icon-box" :class="{ 'active-gold': currentTab === 'expert' }">
        <image class="tab-icon" :src="currentTab === 'expert' ? icons.shieldActive : icons.shield" mode="aspectFit"></image>
      </view>
      <text class="tab-label" :class="{ 'text-gold': currentTab === 'expert' }">设置</text>
      <view class="glow gold-glow" v-if="currentTab === 'expert'"></view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    currentTab: {
      type: String,
      default: 'home' // home, history, expert
    }
  },
  data() {
    return {
      icons: {
        // Cyan Radar/Activity
        radar: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22%2364748b%22%3E%3Cpath d%3D%22M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5.5-2.5l7.51-3.27 1.77 1.77L12 20V4L8.5 7.5z%22%2F%3E%3Cpath d%3D%22M7 12h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z%22 opacity%3D%220.5%22%2F%3E%3C%2Fsvg%3E',
        radarActive: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22%2300FFFF%22%3E%3Cpath d%3D%22M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z%22%2F%3E%3C%2Fsvg%3E',
        
        // Purple Share
        share: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22%2364748b%22%3E%3Cpath d%3D%22M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z%22%2F%3E%3C%2Fsvg%3E',
        
        // Gold Shield/Expert
        shield: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22%2364748b%22%3E%3Cpath d%3D%22M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z%22%2F%3E%3C%2Fsvg%3E',
        shieldActive: 'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 24 24%22 fill%3D%22%23F59E0B%22%3E%3Cpath d%3D%22M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z%22%2F%3E%3C%2Fsvg%3E'
      }
    };
  },
  methods: {
    switchTab(url) {
      uni.switchTab({
        url: url,
        fail: (err) => {
          console.error('Switch Tab Failed:', err);
        }
      });
    }
  }
};
</script>

<style scoped>
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 110rpx; /* Standard tab bar height + padding */
  padding-bottom: env(safe-area-inset-bottom);
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  border-top: 0.5px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 999;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  height: 100%;
}

.share-btn {
  background: transparent;
  padding: 0;
  margin: 0;
  line-height: normal;
  border-radius: 0;
  overflow: visible;
}

.share-btn::after {
  border: none;
}

.icon-box {
  width: 48rpx;
  height: 48rpx;
  margin-bottom: 6rpx;
  transition: transform 0.2s ease;
}

.tab-icon {
  width: 100%;
  height: 100%;
}

.tab-label {
  font-size: 20rpx;
  color: #64748b;
  font-weight: 500;
  transition: color 0.2s ease;
}

/* Active States */
.active-cyan {
  transform: scale(1.1);
  filter: drop-shadow(0 0 5px rgba(0, 255, 255, 0.5));
}

.active-purple {
  transform: scale(1.1);
  filter: drop-shadow(0 0 5px rgba(157, 0, 255, 0.5));
}

.active-gold {
  transform: scale(1.1);
  filter: drop-shadow(0 0 5px rgba(245, 158, 11, 0.5));
}

.text-cyan { color: #00FFFF; }
.text-purple { color: #9d00ff; }
.text-gold { color: #F59E0B; }

/* Glow Effects */
.glow {
  position: absolute;
  bottom: 10rpx;
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 255, 255, 0.2) 0%, transparent 70%);
  pointer-events: none;
  opacity: 0.6;
}

.purple-glow {
  background: radial-gradient(circle, rgba(157, 0, 255, 0.2) 0%, transparent 70%);
}

.gold-glow {
  background: radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, transparent 70%);
}
</style>
