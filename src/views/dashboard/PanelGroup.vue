<template>
  <el-row :gutter="10" class="panel-group">
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel">
        <div class="card-header">
          <div class="card-title">当前在线</div>
          <div class="card-info-icon">
            <i class="el-icon-warning-outline"></i>
          </div>
        </div>
        <div class="card-content">
          <div class="card-value">
            <animate-number
              from="0"
              :to="onlineCount"
              duration="1000"
              :key="onlineCount"
              class="value-number"></animate-number>
          </div>
          <!-- <div class="card-trend">
            <i class="el-icon-arrow-down trend-icon down"></i>
            <span class="trend-value">1</span>
          </div> -->
        </div>
        <div class="card-bottom-line blue"></div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel">
        <div class="card-header">
          <div class="card-title">注册用户</div>
          <div class="card-info-icon">
            <i class="el-icon-warning-outline"></i>
          </div>
        </div>
        <div class="card-content">
          <div class="card-value">
            <animate-number
              from="0"
              :to="registerCount"
              duration="1000"
              :key="registerCount"
              class="value-number"></animate-number>
          </div>
          <!-- <div class="card-trend">
            <i class="el-icon-arrow-down trend-icon down"></i>
            <span class="trend-value">1</span>
          </div> -->
        </div>
        <div class="card-bottom-line green"></div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel">
        <div class="card-header">
          <div class="card-title">租户入驻</div>
          <div class="card-info-icon">
            <i class="el-icon-warning-outline"></i>
          </div>
        </div>
        <div class="card-content">
          <div class="card-value">
            <animate-number
              from="0"
              :to="tenantCount"
              duration="1000"
              :key="tenantCount"
              class="value-number"></animate-number>
          </div>
          <!-- <div class="card-trend">
            <i class="el-icon-arrow-down trend-icon down"></i>
            <span class="trend-value">1</span>
          </div> -->
        </div>
        <div class="card-bottom-line purple"></div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel">
        <div class="card-header">
          <div class="card-title">累积访问</div>
          <div class="card-info-icon">
            <i class="el-icon-warning-outline"></i>
          </div>
        </div>
        <div class="card-content">
          <div class="card-value">
            <animate-number
              from="0"
              :to="loginCount"
              duration="1000"
              :key="loginCount"
              class="value-number"></animate-number>
          </div>
          <!-- <div class="card-trend">
            <i class="el-icon-arrow-down trend-icon down"></i>
            <span class="trend-value">1</span>
          </div> -->
        </div>
        <div class="card-bottom-line orange"></div>
      </div>
    </el-col>
  </el-row>
</template>

<script>
import {getLoginInfoList} from "@/api/system/logininfor";

export default {
  data() {
    return {
      //统计信息
      loginCount: "0",
      onlineCount: "0",
      registerCount: "0",
      tenantCount: "0"
    };
  },
  created() {
    this.getLoginInfo();
  },
  methods: {
    /** 获取登陆信息,后续考虑加速自动刷新 */
    getLoginInfo() {
      getLoginInfoList().then(response => {
        this.loginCount = response.data.loginCount;
        this.onlineCount = response.data.onlineCount;
        this.registerCount = response.data.registerCount;
        this.tenantCount = response.data.tenantCount;
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.panel-group {
  overflow: visible;
  .card-panel-col {
    margin-bottom: 10px;
  }

  .card-panel {
    height: 200px;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
    overflow: hidden;
    padding: 20px;
    display: flex;
    flex-direction: column;


    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;

      .card-title {
        font-size: 14px;
        color: #666;
        font-weight: 400;
        line-height: 1.4;
      }

      .card-info-icon {
       font-size: 20px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;

        i {

          color: #999;
        }

        &:hover {

          i {
            color: #666;
          }
        }
      }
    }

    .card-content {
      flex: 1;
      display: flex;
      flex-direction: column;


      .card-value {
        margin-bottom: 8px;

        .value-number {
          font-size: 28px;
          font-weight: 600;
          color: #262626;
          line-height: 1.2;
        }
      }

      .card-trend {
        display: flex;
        align-items: center;
        gap: 4px;

        .trend-icon {
          font-size: 12px;

          &.down {
            color: #ff4d4f;
          }

          &.up {
            color: #52c41a;
          }
        }

        .trend-value {
          font-size: 12px;
          color: #ff4d4f;
          font-weight: 500;
        }
      }
    }

    .card-bottom-line {
      height: 2px;
      border-radius: 1px;
      margin-top: 12px;

      &.blue {
        background: linear-gradient(90deg, #1890ff 0%, #40a9ff 100%);
      }

      &.green {
        background: linear-gradient(90deg, #52c41a 0%, #73d13d 100%);
      }

      &.purple {
        background: linear-gradient(90deg, #722ed1 0%, #9254de 100%);
      }

      &.orange {
        background: linear-gradient(90deg, #fa8c16 0%, #ffa940 100%);
      }

      &.red {
        background: linear-gradient(90deg, #ff4d4f 0%, #ff7875 100%);
      }
    }


  }
}

</style>
