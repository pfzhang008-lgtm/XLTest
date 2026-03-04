<script>
export default {
  onLaunch: function () {
    console.log('App Launch')
  },
  onShow: function () {
    console.log('App Show')
  },
  onHide: function () {
    console.log('App Hide')
  }
}
</script>

<style>
/* Global styles */
page {
  background-color: #05070A;
  font-family: 'Noto Sans SC', sans-serif;
  color: #E2E8F0;
}

/* Performance optimizations for test pages */
.test-container, .grid-cell, .btn,
.container, .test-card, .control-btn {
  touch-action: manipulation;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
</style>
