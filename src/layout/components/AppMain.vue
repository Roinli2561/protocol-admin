<template>
  <section class="app-main">
    <transition name="fade-transform" mode="out-in">
      <keep-alive :include="cachedViews">
        <router-view v-if="!$route.meta.link" :key="key" />
      </keep-alive>
    </transition>
    <iframe-toggle />
  </section>
</template>

<script>
import iframeToggle from "./IframeToggle/index"
export default {
  name: 'AppMain',
  components: { iframeToggle },
  computed: {
    cachedViews() {
      return this.$store.state.tagsView.cachedViews
    },
    key() {
      return this.$route.path
    }
  }
}
</script>

<style lang="scss" scoped>
.app-main {
  /* navbar 已固定在滚动区外，高度 50px；tags 也在 navbar 内 */
  background: #f6f8fa;
  min-height: calc(100vh - 50px);
  width: 100%;
  max-width: 100%;
  position: relative;
  overflow-x: hidden;
  overflow-y: visible;
}
</style>


