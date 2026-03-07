<template>
  <view class="tab-bar">
    <!-- Tab 1: Home (Cyan) -->
    <view class="tab-item" @click="switchTab('/pages/index/index')">
      <view class="icon-box" :class="{ 'active-cyan': currentTab === 'home' }">
        <image class="tab-icon" :src="currentTab === 'home' ? icons.homeActive : icons.home" mode="aspectFit"></image>
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
      <view class="icon-box">
        <image 
          class="tab-icon" 
          :src="currentTab === 'expert' ? icons.userActive : icons.user"
          mode="aspectFit"
        ></image>
      </view>
      <text class="tab-label" :class="{ 'text-gold': currentTab === 'expert' }">我的</text>
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
        // Home Icon (House Style)
        home: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzY0NzQ4YiI+PHBhdGggZD0iTTEwIDIwdi02aDR2Nmg1di04aDNMMTIgMyAyIDEyaDN2OHoiLz48L3N2Zz4=',
        homeActive: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzAwRkZGRiI+PHBhdGggZD0iTTEwIDIwdi02aDR2Nmg1di04aDNMMTIgMyAyIDEyaDN2OHoiLz48L3N2Zz4=',
        
        // Purple Share (Three Dots Style)

        share: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjRTJFOEYwIj48cGF0aCBkPSJNMCAwaDI0djI0SDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTE4IDE2LjA4Yy0uNzYgMC0xLjQ0LjMtMS45Ni43N0w4LjkxIDEyLjdjLjA1LS4yMy4wOS0uNDYuMDktLjdzLS4wNC0uNDctLjA5LS43bDcuMDUtNC4xMWMuNTQuNSAxLjI1LjgxIDIuMDQuODEgMS42NiAwIDMtMS4zNCAzLTNzLTEuMzQtMy0zLTMtMyAxLjM0LTMgM2MwIC4yNC4wNC40Ny4wOS43TDguMDQgOS44MUM3LjUgOS4zMSA2Ljc5IDkgNiA5Yy0xLjY2IDAtMyAxLjM0LTMgM3MxLjM0IDMgMyAzYy43OSAwIDEuNS0uMzEgMi4wNC0uODFsNy4xMiA0LjE2Yy0uMDUuMjEtLjA4LjQzLS4wOC42NSAwIDEuNjEgMS4zMSAyLjkyIDIuOTIgMi45MnMyLjkyLTEuMzEgMi45Mi0yLjkyYzAtMS42MS0xLjMxLTIuOTItMi45Mi0yLjkyeiIvPjwvc3ZnPg==',
        // User/Profile Icons
        user: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzY0NzQ4YiI+PHBhdGggZD0iTTEyIDEyYzIuMjEgMCA0LTEuNzkgNC00cy0xLjc5LTQtNC00LTQgMS43OS00IDQgMS43OSA0IDQgNHptMCAyYy0yLjY3IDAtOCAxLjM0LTggNHYyaDE2di0yYzAtMi42Ni01LjMzLTQtOC00eiIvPjwvc3ZnPg==',
        userActive: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI0Y1OUUwQiI+PHBhdGggZD0iTTEyIDEyYzIuMjEgMCA0LTEuNzkgNC00cy0xLjc5LTQtNC00LTQgMS43OS00IDQgMS43OSA0IDQgNHptMCAyYy0yLjY3IDAtOCAxLjM0LTggNHYyaDE2di0yYzAtMi42Ni01LjMzLTQtOC00eiIvPjwvc3ZnPg=='
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
