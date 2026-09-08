<template>
  <div :class="classObj" class="app-wrapper" :style="{'--current-color': theme}">
      <div v-if="device==='mobile'&&sidebar.opened" class="drawer-bg" @click="handleClickOutside"/>
      <sidebar v-if="!sidebar.hide" class="sidebar-container"/>
      <div :class="{hasTagsView:needTagsView,sidebarHide:sidebar.hide}" class="main-container">
        <div class="layout-header">
          <navbar/>
        </div>
        <el-scrollbar class="main-scrollbar">
          <app-main/>
          <right-panel>
            <settings/>
          </right-panel>
        </el-scrollbar>
      </div>
  </div>
</template>

<script>
import RightPanel from '@/components/RightPanel'
import { AppMain, Navbar, Settings, Sidebar, TagsView } from './components'
import ResizeMixin from './mixin/ResizeHandler'
import { mapState } from 'vuex'
import variables from '@/assets/styles/variables.scss'

export default {
  name: 'Layout',
  components: {
    AppMain,
    Navbar,
    RightPanel,
    Settings,
    Sidebar,
    TagsView
  },
  mixins: [ResizeMixin],
  computed: {
    ...mapState({
      theme: state => state.settings.theme,
      sideTheme: state => state.settings.sideTheme,
      sidebar: state => state.app.sidebar,
      device: state => state.app.device,
      needTagsView: state => state.settings.tagsView
    }),
    classObj() {
      return {
        hideSidebar: !this.sidebar.opened,
        openSidebar: this.sidebar.opened,
        withoutAnimation: this.sidebar.withoutAnimation,
        mobile: this.device === 'mobile'
      }
    },
    variables() {
      return variables;
    }
  },
  methods: {
    handleClickOutside() {
      this.$store.dispatch('app/closeSideBar', { withoutAnimation: false })
    }
  }
}
</script>

<style lang="scss" scoped>
  @import "~@/assets/styles/mixin.scss";
  @import "~@/assets/styles/variables.scss";

  .app-wrapper {
    @include clearfix;
    position: relative;
    height: 100%;
    width: 100%;

    &.mobile.openSidebar {
      position: fixed;
      top: 0;
    }
  }

  .main-container {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: #f6f8fa;
  }

  .layout-header {
    flex: none;
    position: relative;
    z-index: 9;
    background: #fff;
  }

  .main-scrollbar {
    flex: 1;
    min-height: 0;
    height: auto !important;
    background: #f6f8fa;

    ::v-deep .el-scrollbar__bar.is-vertical {
      z-index: 10;
    }

    ::v-deep .el-scrollbar__bar.is-horizontal {
      display: none !important;
      height: 0 !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }

    ::v-deep .el-scrollbar__wrap {
      overflow-x: hidden !important;
      background: #f6f8fa;
    }

    ::v-deep .el-scrollbar__view {
      min-height: 100%;
      background: #f6f8fa;
    }
  }

  .drawer-bg {
    background: #000;
    opacity: 0.3;
    width: 100%;
    top: 0;
    height: 100%;
    position: absolute;
    z-index: 999;
  }
</style>

<style lang="scss">
/* 全局隐藏主内容区横向滚动条，避免底部白条 */
.main-scrollbar > .el-scrollbar__bar.is-horizontal {
  display: none !important;
  height: 0 !important;
}
</style>
