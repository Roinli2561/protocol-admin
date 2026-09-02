<template>
    <div :class="{'has-logo':showLogo}" :style="{ backgroundColor: settings.sideTheme === 'theme-dark' ? variables.menuBackground : variables.menuLightBackground }">
        <logo v-if="showLogo" :collapse="isCollapse" />
       <div class="sidebar-box">
         <div class="custom-sidebar-menu" :class="settings.sideTheme">
           <sidebar-item
             v-for="(route, index) in sidebarRouters"
             :key="`sidebar-${route.path || 'root'}-${route.name || 'unnamed'}-${index}`"
             :item="route"
             :base-path="route.path"
           />
         </div>
       </div>
    </div>
</template>

<script>
import { mapGetters, mapState } from "vuex";
import Logo from "./Logo";
import SidebarItem from "./SidebarItem";
import variables from "@/assets/styles/variables.scss";

export default {
    components: { SidebarItem, Logo },
    computed: {
        ...mapState(["settings"]),
        ...mapGetters(["sidebarRouters", "sidebar"]),
        activeMenu() {
            const route = this.$route;
            const { meta, path } = route;
            // if set path, the sidebar will highlight the path you set
            if (meta.activeMenu) {
                return meta.activeMenu;
            }
            return path;
        },
        showLogo() {
            return this.$store.state.settings.sidebarLogo;
        },
        variables() {
            return variables;
        },
        isCollapse() {
            return !this.sidebar.opened;
        }
    }
};
</script>

<style lang="scss" scoped>
.sidebar-box{
  padding:0 0 10px 10px;
  border-radius: 6px;
  height: 100%;
  overflow: hidden;
  background: #f3f7fa;
}
.custom-sidebar-menu {
  padding: 10px ;
  background: #ffffff;
  border-radius: 4px;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;

  // 自定义滚动条样式
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 3px;

    &:hover {
      background: transparent;
    }
  }

  // 确保所有菜单项都显示
  ::v-deep .sidebar-menu-item {
    display: block !important;
  }
}
</style>
