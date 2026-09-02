<template>
  <div v-if="!item.hidden" class="sidebar-menu-item">
    <!-- 第一层：主菜单项 :class="{ 'active': isMainMenuActive }"-->
    <div class="main-menu-item" >
      <div class="main-menu-header" @click="toggleMainMenu">
        <div class="main-menu-content">
          <item v-if="item.meta" :icon="item.meta && item.meta.icon" :title="item.meta.title" />
        </div>
        <div class="main-menu-arrow" :class="{ 'expanded': isMainMenuExpanded }">
          <i class="el-icon-arrow-up"></i>
        </div>
      </div>

      <!-- 第二层：子菜单项 -->
      <div v-if="isMainMenuExpanded && item.children && item.children.length" class="sub-menu-items">
        <div class="sub-menu-grid">
          <div
            v-for="(child, index) in item.children"
            :key="`submenu-${child.path || 'sub'}-${child.name || 'unnamed'}-${index}`"
            class="sub-menu-item"
            :class="{ 'active': isSubMenuActive(child) }"
            @click="handleSubMenuClick(child)"
          >
            <app-link v-if="child.meta" :to="resolvePath(child.path, child.query)">
              <template v-if="child.meta.title.length>4">
                <el-tooltip :content="child.meta.title" placement="bottom" :disabled="!child.meta.title">
                  <span class="sub-menu-text">{{ child.meta.title }}</span>
                </el-tooltip>
              </template>
              <template v-else>
                <span class="sub-menu-text">{{ child.meta.title }}</span>
              </template>

            </app-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import path from 'path'
import { isExternal } from '@/utils/validate'
import Item from './Item'
import AppLink from './Link'
import FixiOSBug from './FixiOSBug'

export default {
  name: 'SidebarItem',
  components: { Item, AppLink },
  mixins: [FixiOSBug],
  props: {
    // route object
    item: {
      type: Object,
      required: true
    },
    isNest: {
      type: Boolean,
      default: false
    },
    basePath: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      isMainMenuExpanded: true // 默认展开所有主菜单
    }
  },
  computed: {
    isMainMenuActive() {
      // 检查当前路由是否属于这个主菜单
      const currentPath = this.$route.path
      if (this.item.children && this.item.children.length) {
        return this.item.children.some(child => {
          const childPath = this.resolvePath(child.path)
          return currentPath === childPath || currentPath.startsWith(childPath + '/')
        })
      }
      return false
    }
  },
  methods: {
    toggleMainMenu() {
      this.isMainMenuExpanded = !this.isMainMenuExpanded
    },
    isSubMenuActive(child) {
      const currentPath = this.$route.path
      const childPath = this.resolvePath(child.path)
      return currentPath === childPath || currentPath.startsWith(childPath + '/')
    },
    handleSubMenuClick(child) {
      // 处理子菜单点击事件
      const childPath = this.resolvePath(child.path)
      if (childPath !== this.$route.path) {
        this.$router.push(childPath)
      }
    },
    resolvePath(routePath, routeQuery) {
      if (isExternal(routePath)) {
        return routePath
      }
      if (isExternal(this.basePath)) {
        return this.basePath
      }
      if (routeQuery) {
        let query = JSON.parse(routeQuery);
        return { path: path.resolve(this.basePath, routePath), query: query }
      }
      return path.resolve(this.basePath, routePath)
    }
  }
}
</script>

<style lang="scss" scoped>
.sidebar-menu-item {
  margin-bottom: 8px;

  .main-menu-item {
    background: transparent;
    border-radius: 6px;
    transition: all 0.3s ease;

    &.active {
      background: rgba(64, 158, 255, 0.1);
    }

    .main-menu-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 10px;
      cursor: pointer;
      border-radius: 6px;
      transition: all 0.3s ease;


      &:hover {
        background: rgba(64, 158, 255, 0.05);
      }

      .main-menu-content {
        display: flex;
        align-items: center;
        flex: 1;
        min-width: 0; // 允许flex子项收缩

        ::v-deep .svg-icon {
          margin-right: 10px;
          font-size: 14px;
          color: #606266;
          flex-shrink: 0; // 图标不收缩
        }

        ::v-deep span {
          font-weight: 600;
          font-size: 14px;
          color: #303133;
          letter-spacing: 0.3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
          min-width: 0; // 允许文本收缩
        }
      }

      .main-menu-arrow {
        transition: transform 0.3s ease;
        color: #909399;
        font-size: 14px;

        &.expanded {
          transform: rotate(180deg);
        }
      }
    }

    .sub-menu-items {
      padding: 0px 5px ;

      .sub-menu-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px 12px;
        padding: 4px 0;

        .sub-menu-item {
          padding: 4px 10px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: transparent;
          min-height: 32px;
          display: flex;
          align-items: center;
          min-width: 0; // 允许收缩

          &:hover {
            background: rgba(64, 158, 255, 0.08);
            color: #409eff;
          }

          &.active {
            background: transparent;
            color: #409eff;

            .sub-menu-text {
              //color: white;
              font-weight: 500;
            }
          }

          .sub-menu-text {
            font-size: 12px;
            //color: #606266;
            font-weight: 400;
            line-height: 1.3;
            display: block;
            text-decoration: none;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            width: 100%;
            min-width: 0; // 允许文本收缩
          }

          a {
            text-decoration: none;
            color: inherit;
            width: 100%;
            display: block;
            min-width: 0; // 允许链接收缩
            overflow: hidden;
          }
        }
      }
    }
  }
}

// 深色主题适配
.theme-dark {
  .sidebar-menu-item {
    .main-menu-item {
      &.active {
        background: rgba(64, 158, 255, 0.15);
      }

      .main-menu-header {
        &:hover {
          background: rgba(64, 158, 255, 0.08);
        }

        .main-menu-content {
          ::v-deep span {
            color: #e4e7ed;
          }
        }

        .main-menu-arrow {
          color: #a8abb2;
        }
      }

      .sub-menu-items {
        .sub-menu-grid {
          .sub-menu-item {
            &:hover {
              background: rgba(64, 158, 255, 0.12);
            }

            .sub-menu-text {
              color: #c0c4cc;
            }
          }
        }
      }
    }
  }
}
</style>
