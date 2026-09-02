<template>
  <div class="app-container home">
    <panel-group v-if="tenantid==9999"/>
    <div class="about">
      <el-row :gutter="10">
        <el-col :sm="24" :lg="24">
          <p class=" dependencies">
            <img src="https://img.shields.io/badge/Release-V1.2.2-green.svg" alt="Downloads"/>
            <img src="https://img.shields.io/badge/IntelliJ%20IDEA-提供支持-blue.svg" alt="IntelliJ-IDEA">
            <img src="https://img.shields.io/badge/JDK-1.8+-green.svg" alt="Build Status"/>
            <img src="https://img.shields.io/badge/Spring%20Cloud-2021-blue.svg" alt="Coverage Status"/>
            <img src="https://img.shields.io/badge/Spring%20Boot-2.6.6.RELEASE-blue.svg" alt="Downloads"/>
            <a target="_blank" href="http://witos.doc.huizhidata.com">
              <img src="@/assets/images/copyright.png" alt="Downloads"/>
            </a>
          </p>
          <hr/>
        </el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :sm="24" :lg="12" style="padding-left: 20px">
          <h2>witos开发平台</h2>
          <p>
            基于Ruoyi-Cloud版本改进而来,吸收了其他项目类似于ruoyi-cloud,ruoyi-vue,ruo-vue-pro,xueyi-vue等等优秀的开源架构,集成租户,低代码,监控,分布式,限流,容器化编排等多种功能集成的企业级开发平台!期待大家的加入,一起开发!目前已经完成开源到gitee上,到时候欢迎大家一起pr!
          </p>
          <p>
            <b>当前版本:</b>
            <el-tag type="danger">v{{ version }}</el-tag>
          </p>
          <!--        <p>-->
          <!--          <el-tag type="danger">&yen;免费开源</el-tag>-->
          <!--        </p>-->
          <p>
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-cloudy"
              plain
              @click="goTarget('https://github.com/roinli/HUIZHI-witos-cloud')"
            >访问码云
            </el-button
            >
            <el-button
              size="mini"
              icon="el-icon-s-home"
              plain
              @click="goTarget('http://witos.doc.huizhidata.com/')"
            >访问主页
            </el-button
            >
          </p>
        </el-col>

        <el-col :sm="24" :lg="12" style="padding-left: 50px">
          <el-row>
            <el-col :span="12">
              <h2>技术选型</h2>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="6">
              <h4>后端技术</h4>
              <ul>
                <li>SpringBoot</li>
                <li>SpringCloud</li>
                <li>Nacos</li>
                <li>Sentinel</li>
                <li>Seata</li>
                <li>Minio</li>
                <li>...</li>
              </ul>
            </el-col>
            <el-col :span="6">
              <h4>前端技术</h4>
              <ul>
                <li>Vue</li>
                <li>Vuex</li>
                <li>Element-ui</li>
                <li>Axios</li>
                <li>Echarts</li>
                <li>Quill</li>
                <li>...</li>
              </ul>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
    </div>

  </div>
</template>

<script>
import PanelGroup from './dashboard/PanelGroup'
import {getTenant} from '@/utils/auth'

export default {
  name: "Index",
  components: {
    PanelGroup
  },
  data () {
    return {
      // 版本号
      version: "1.2.2",
      tenantid: getTenant()
    };
  },
  methods: {
    goTarget (href) {
      window.open(href, "_blank");
    }
  },
};
</script>

<style scoped lang="scss">
.about{
  background: #ffffff;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
  padding-bottom: 10px;
}
.home {
  background: transparent;
  box-shadow: none;
  padding: 0;
  overflow: visible;

  blockquote {
    padding: 10px 20px;
    margin: 0 0 20px;
    font-size: 17.5px;
    border-left: 5px solid #eee;
  }

  hr {
    margin-top: 20px;
    margin-bottom: 20px;
    border: 0;
    border-top: 1px solid #eee;
  }

  .col-item {
    margin-bottom: 20px;
  }

  ul {
    padding: 0;
    margin: 0;
  }

  font-family: "open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 13px;
  color: #676a6c;
  overflow-x: hidden;

  ul {
    list-style-type: none;
  }

  h4 {
    margin-top: 0px;
  }

  h2 {
    margin-top: 10px;
    font-size: 26px;
    font-weight: 100;
  }

  p {
    margin-top: 10px;

    b {
      font-weight: 700;
    }
  }

  .update-log {
    ol {
      display: block;
      list-style-type: decimal;
      margin-block-start: 1em;
      margin-block-end: 1em;
      margin-inline-start: 0;
      margin-inline-end: 0;
      padding-inline-start: 40px;
    }
  }

  .dependencies {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 22px;
    img {
      height: 20px;
    }
  }
}
</style>

