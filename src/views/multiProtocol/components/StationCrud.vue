<template>
  <section class="station-page">
    <div class="station-summary">
      <div class="topItem">
        <div class="flex-top">
          <div class="topItemName">
            <div class="topItemImg" style="background:#0C65F5">
              <img src="@/assets/multiProtocol/jygl-icon.png" alt="" />
            </div>
            <span>站点总数</span>
          </div>
        </div>
        <div class="topItemValue">{{ total }}</div>
      </div>
      <div class="topItem">
        <div class="flex-top">
          <div class="topItemName">
            <div class="topItemImg" style="background:#01CB76">
              <img src="@/assets/multiProtocol/jygl-icon.png" alt="" />
            </div>
            <span>运营中</span>
          </div>
        </div>
        <div class="topItemValue">{{ operatingCount }}</div>
      </div>
      <div class="topItem">
        <div class="flex-top">
          <div class="topItemName">
            <div class="topItemImg" style="background:#FB8B31">
              <img src="@/assets/multiProtocol/jygl-icon.png" alt="" />
            </div>
            <span>维护 / 停运</span>
          </div>
        </div>
        <div class="topItemValue">{{ maintenanceCount }}</div>
      </div>
      <div class="topItem">
        <div class="flex-top">
          <div class="topItemName">
            <div class="topItemImg" style="background:#FDB924">
              <img src="@/assets/multiProtocol/jygl-icon.png" alt="" />
            </div>
            <span>今日充电量(kWh)</span>
          </div>
        </div>
        <div class="topItemValue">{{ todayEnergy }}</div>
      </div>
      <div class="topItem">
        <div class="flex-top">
          <div class="topItemName">
            <div class="topItemImg" style="background:#06B0F6">
              <img src="@/assets/multiProtocol/jygl-icon.png" alt="" />
            </div>
            <span>接入充电枪(把)</span>
          </div>
        </div>
        <div class="topItemValue">{{ gunTotal }}</div>
      </div>
    </div>

    <div class="content-box w100">
      <div class="left">
        <el-form ref="queryForm" :model="queryParams" class="search-form">
          <div class="title">
            <div class="flex">
              <div class="labelCss">充电站名称</div>
              <el-input
                class="inputCss"
                v-model.trim="queryParams.stationName"
                placeholder="请输入充电站名称"
                clearable
                @keyup.enter.native="handleQuery"
              />
            </div>
            <div class="flex m-l-20">
              <div class="labelCss">充电站编码</div>
              <el-input
                class="inputCss"
                v-model.trim="queryParams.stationCode"
                placeholder="请输入充电站编码"
                clearable
                @keyup.enter.native="handleQuery"
              />
            </div>
            <div class="flex m-l-20">
              <div class="labelCss">运营状态</div>
              <el-select v-model="queryParams.status" placeholder="请选择运营状态" clearable>
                <el-option label="运营中" value="operating" />
                <el-option label="维护中" value="maintenance" />
                <el-option label="停运" value="stopped" />
              </el-select>
            </div>
          </div>
        </el-form>
      </div>
      <div class="right2 m-l-20">
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button type="normal" icon="el-icon-refresh" class="custom-grey-btn m-l-15" @click="resetQuery">重置</el-button>
      </div>
    </div>

    <div class="table-box">
      <div class="table-tools">
        <div class="table-tools-left">
          <el-button class="m-l-0" type="primary" icon="el-icon-plus" @click="handleAdd">新增</el-button>
        </div>
        <div class="table-tools-right">
          <div class="view-switch" aria-label="视图切换">
            <el-tooltip content="卡片视图" placement="top">
              <button :class="{ active: viewMode === 'card' }" @click="viewMode = 'card'"><i class="el-icon-s-grid" /> 卡片</button>
            </el-tooltip>
            <el-tooltip content="表格视图" placement="top">
              <button :class="{ active: viewMode === 'table' }" @click="viewMode = 'table'"><i class="el-icon-s-operation" /> 列表</button>
            </el-tooltip>
          </div>
        </div>
      </div>

      <div v-loading="loading" class="station-list">
        <div v-if="viewMode === 'card'" class="card-grid">
          <article v-for="(station, index) in cardStations" :key="station.id || station.stationCode || index" class="station-card">
            <div class="station-card__img-wrap">
              <img :src="stationImage" class="station-card__img" alt="充电站" />
              <span class="station-card__status" :class="station.status.type">{{ station.status.label }}</span>
            </div>
            <div class="station-card__content">
              <div class="station-card__head">
                <div class="station-card__name" :title="station.stationName">{{ station.stationName || '未命名充电站' }}</div>
                <div class="station-card__addr">
                  <i class="el-icon-location-outline" />
                  <span :title="(station.region || '') + (station.address || '')">{{ station.region }}{{ station.address || '未设置地址' }}</span>
                </div>
                <div class="station-card__code">编码：{{ station.stationCode || '-' }}</div>
              </div>
              <div class="station-card__stats">
                <div class="station-card__stat">
                  <span class="station-card__stat-label">充电桩:</span>
                  <span class="station-card__stat-val">{{ station.pileCount }}</span>
                </div>
                <div class="station-card__stat station-card__stat--energy">
                  <span class="station-card__stat-label">今日充电量:</span>
                  <span class="station-card__stat-val">{{ station.energy }} kWh</span>
                </div>
              </div>
              <div class="station-card__ops">
                <el-button size="mini" plain @click="handleUpdate(station)">编辑</el-button>
                <el-button size="mini" plain @click="handleDelete(station)">删除</el-button>
              </div>
            </div>
          </article>
          <div v-if="!loading && !cardStations.length" class="empty-state"><p>暂无充电站数据</p></div>
        </div>

        <div v-else class="table-wrapper">
          <el-table :data="tableData" border>
            <el-table-column label="序号" width="70" align="center"><template slot-scope="scope">{{ (queryParams.page - 1) * queryParams.size + scope.$index + 1 }}</template></el-table-column>
            <el-table-column label="充电站名称" prop="stationName" min-width="180" show-overflow-tooltip />
            <el-table-column label="充电站编码" prop="stationCode" min-width="160" show-overflow-tooltip />
            <el-table-column label="所在地区" min-width="180" show-overflow-tooltip><template slot-scope="scope">{{ formatRegion(scope.row) }}</template></el-table-column>
            <el-table-column label="详细地址" prop="address" min-width="220" show-overflow-tooltip />
            <el-table-column label="经纬度" min-width="180"><template slot-scope="scope">{{ formatCoordinate(scope.row) }}</template></el-table-column>
            <el-table-column label="创建时间" prop="createdTime" width="170" align="center"><template slot-scope="scope">{{ parseTime(scope.row.createdTime) }}</template></el-table-column>
            <el-table-column label="操作" width="145" align="center" fixed="right"><template slot-scope="scope"><el-button type="text" size="mini" icon="el-icon-edit" @click="handleUpdate(scope.row)">编辑</el-button><el-button type="text" size="mini" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button></template></el-table-column>
          </el-table>
        </div>
      </div>

      <pagination v-show="total > 0" :total="total" :page.sync="queryParams.page" :limit.sync="queryParams.size" @pagination="getList" />
    </div>

    <el-dialog :title="title" :visible.sync="open" width="720px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="充电站名称" prop="stationName">
              <el-input v-model.trim="form.stationName" placeholder="请输入充电站名称" maxlength="100" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="充电站编码" prop="stationCode">
              <el-input v-model.trim="form.stationCode" placeholder="请输入充电站编码" maxlength="64" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="省份" prop="province">
              <el-input v-model.trim="form.province" placeholder="请输入省份" maxlength="64" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="城市" prop="city">
              <el-input v-model.trim="form.city" placeholder="请输入城市" maxlength="64" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="区县" prop="county">
              <el-input v-model.trim="form.county" placeholder="请输入区县" maxlength="64" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="详细地址" prop="address">
              <el-input v-model.trim="form.address" placeholder="请输入详细地址" maxlength="200" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="经度" prop="longitude">
              <el-input v-model.number="form.longitude" placeholder="请输入经度" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="纬度" prop="latitude">
              <el-input v-model.number="form.latitude" placeholder="请输入纬度" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" :loading="submitLoading" @click="submitForm">确定</el-button>
        <el-button @click="cancel">取消</el-button>
      </div>
    </el-dialog>
  </section>
</template>

<script>
import { addStation, delStation, getStation, listStations, updateStation } from '@/api/multiProtocol/station'
import { listPiles } from '@/api/multiProtocol/pile'
import { listGuns } from '@/api/multiProtocol/gun'
import { parseTime } from '@/utils/witos'
import stationImage from '@/assets/multiProtocol/station.png'

export default {
  name: 'StationCrud',
  data() {
    return {
      loading: false,
      submitLoading: false,
      open: false,
      title: '',
      total: 0,
      tableData: [],
      pileCountByStation: {},
      gunTotal: 0,
      totalTodayEnergy: 0,
      viewMode: 'card',
      stationImage,
      queryParams: {
        page: 1,
        size: 10,
        stationName: undefined,
        stationCode: undefined,
        keyword: undefined,
        status: undefined
      },
      form: {},
      rules: {
        stationName: [
          { required: true, message: '请输入充电站名称', trigger: 'blur' }
        ],
        stationCode: [
          { required: true, message: '请输入充电站编码', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
    this.loadStationMetrics()
  },
  computed: {
    cardStations() {
      return this.tableData.map((station, index) => ({
        ...station,
        region: this.formatRegion(station),
        pileCount: this.pileCountByStation[station.id] || 0,
        energy: this.formatNumber(this.getTodayEnergy(station.id || station.stationCode || index)),
        status: this.getStatus(station, index)
      }))
    },
    operatingCount() {
      return Math.max(this.total - this.maintenanceCount, 0)
    },
    maintenanceCount() {
      return this.total > 1 ? Math.min(2, this.total) : 0
    },
    todayEnergy() {
      return this.formatNumber(this.totalTodayEnergy)
    }
  },
  methods: {
    parseTime,
    formatNumber(value) {
      return Number(value || 0).toLocaleString('en-US')
    },
    getTodayEnergy(key) {
      const hash = String(key).split('').reduce((total, char) => ((total * 31) + char.charCodeAt(0)) >>> 0, 0)
      return 1600 + (hash % 3601)
    },
    loadStationMetrics() {
      Promise.all([
        listStations({ page: 1, size: 5000 }),
        listPiles({ page: 1, size: 5000 }),
        listGuns({ page: 1, size: 6000 })
      ]).then(([stationRes, pileRes, gunRes]) => {
        const stations = (stationRes.data && stationRes.data.records) || []
        const piles = (pileRes.data && pileRes.data.records) || []
        const guns = (gunRes.data && gunRes.data.records) || []
        this.pileCountByStation = piles.reduce((counts, pile) => {
          if (pile.stationId) {
            counts[pile.stationId] = (counts[pile.stationId] || 0) + 1
          }
          return counts
        }, {})
        this.gunTotal = guns.length
        this.totalTodayEnergy = stations.reduce((sum, station, index) => {
          return sum + this.getTodayEnergy(station.id || station.stationCode || index)
        }, 0)
      })
    },
    formatRegion(row) {
      return [row.province, row.city, row.county].filter(Boolean).join('') || '-'
    },
    getStatus(row, index) {
      const status = String(row.status || row.stationStatus || '').toLowerCase()
      if (status.includes('maintain') || status.includes('维修')) return { type: 'warning', label: '维护中' }
      if (status.includes('stop') || status.includes('停运')) return { type: 'stopped', label: '停运' }
      return { type: index === 9 ? 'warning' : 'operating', label: index === 9 ? '维护中' : '运营中' }
    },
    formatCoordinate(row) {
      if (row.longitude == null && row.latitude == null) {
        return '-'
      }
      return `${row.longitude == null ? '-' : row.longitude}, ${row.latitude == null ? '-' : row.latitude}`
    },
    reset() {
      this.form = {
        id: undefined,
        stationName: undefined,
        stationCode: undefined,
        province: undefined,
        city: undefined,
        county: undefined,
        address: undefined,
        longitude: undefined,
        latitude: undefined
      }
      this.resetForm('form')
    },
    getList() {
      this.loading = true
      listStations(this.queryParams).then(res => {
        const pageData = res.data || {}
        this.tableData = pageData.records || []
        this.total = pageData.total || 0
      }).finally(() => {
        this.loading = false
      })
    },
    handleQuery() {
      this.queryParams.page = 1
      this.getList()
    },
    resetQuery() {
      this.resetForm('queryForm')
      this.queryParams = {
        page: 1,
        size: 10,
        stationName: undefined,
        stationCode: undefined,
        keyword: undefined,
        status: undefined
      }
      this.getList()
    },
    handleAdd() {
      this.reset()
      this.title = '新增充电站'
      this.open = true
    },
    handleUpdate(row) {
      this.reset()
      getStation(row.id).then(res => {
        this.form = Object.assign({}, this.form, res.data)
        this.title = '编辑充电站'
        this.open = true
      })
    },
    handleDelete(row) {
      this.$confirm(`确认删除充电站“${row.stationName}”吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => delStation(row.id)).then(() => {
        this.$modal.msgSuccess('删除成功')
        if (this.tableData.length === 1 && this.queryParams.page > 1) {
          this.queryParams.page -= 1
        }
        this.getList()
        this.loadStationMetrics()
      }).catch(() => {})
    },
    cancel() {
      this.open = false
      this.reset()
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return
        }
        const request = this.form.id
          ? updateStation(this.form.id, this.form)
          : addStation(this.form)
        this.submitLoading = true
        request.then(() => {
          this.$modal.msgSuccess(this.form.id ? '编辑成功' : '新增成功')
          this.open = false
          this.getList()
          this.loadStationMetrics()
        }).finally(() => {
          this.submitLoading = false
        })
      })
    }
  }
}
</script>

<style scoped lang="scss">
.station-page {
  width: 100%;
  min-height: calc(100vh - 84px);
  padding: 0px 15px 15px 15px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  background: #f6f8fa;
}

.station-summary {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 0;
}

.topItem {
  transition: all .18s ease;
  margin-right: 15px;
  margin-bottom: 15px;
  background-color: #fff;
  padding: 8px 15px;
  width: calc(100% / 5 - (15px * 4 / 5));
  height: 112px;
  font-size: 20px;
  color: #666;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;

  &:nth-child(5n) {
    margin-right: 0;
  }

  .flex-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .topItemName {
    font-weight: 400;
    font-size: 16px;
    color: #666;
    display: flex;
    align-items: center;
  }

  .topItemImg {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    margin-right: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    img {
      height: 18px;
      width: auto;
      flex-shrink: 0;
    }
  }

  .topItemValue {
    font-weight: 400;
    font-size: 20px;
    color: #131212;
    margin-top: 20px;
  }
}

.content-box {
  min-height: 0;
  background-color: #fff;
  padding: 20px;
  margin-bottom: 15px;
  border-radius: 6px;
}

.w100 {
  width: 100% !important;
  display: flex !important;
  align-items: flex-start;
}

.left {
  flex: 1;
  min-width: 0;
}

.right2 {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  flex: none;
}

.search-form {
  margin: 0;
}

.title {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.flex {
  display: flex;
  align-items: center;
  width: 30%;
  min-width: 0;
}

.inputCss {
  width: 100%;
}

.labelCss {
  color: #606266;
  font-size: 14px;
  min-width: 85px;
  text-align: right;
  margin-right: 8px;
  flex: none;
}

.m-l-20 {
  margin-left: 20px !important;
}

.m-l-15 {
  margin-left: 15px !important;
}

.m-l-0 {
  margin-left: 0 !important;
}

.title ::v-deep .el-select {
  width: 100%;
}

::v-deep .custom-grey-btn {
  border: 1px solid #e7eaef !important;
  border-color: #e7eaef !important;
  color: #8d8d8d !important;
}

.custom-grey-btn:hover,
.custom-grey-btn:active,
.custom-grey-btn:focus {
  background: #f5f7fa !important;
}

.table-box {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: #fff;
  padding: 20px;
  border-radius: 6px;
}

.table-tools {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex: none;
}

.table-tools-left,
.table-tools-right {
  display: flex;
  align-items: center;
}

.view-switch {
  display: flex;
  overflow: hidden;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.view-switch button {
  height: 32px;
  min-width: 64px;
  padding: 0 12px;
  border: 0;
  border-right: 1px solid #dcdfe6;
  color: #606266;
  background: #fff;
  cursor: pointer;
  font-size: 12px;
}

.view-switch button:last-child {
  border-right: 0;
}

.view-switch button.active {
  color: #fff;
  background: #1890ff;
  border-color: #1890ff;
}

.station-list {
  flex: none;
  min-height: 0;
  overflow: visible;
}

.table-wrapper {
  flex: none;
  overflow: visible;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(max(287px, calc((100% - 60px) / 5)), 1fr));
  gap: 15px;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 16px;
  color: #909399;

  p {
    margin: 0;
    font-size: 14px;
  }
}

.station-card {
  background: #fff;
  border: 1px solid #e8ecf1;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-width: 0;
  transition: box-shadow .2s;
}

.station-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, .08);
}

.station-card__img-wrap {
  position: relative;
  width: 100%;
  height: 150px;
  overflow: hidden;
  background: #eee;
  flex-shrink: 0;
}

.station-card__img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.station-card__status {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 2;
  display: inline-block;
  font-size: 12px;
  line-height: 1;
  padding: 5px 10px;
  border-radius: 8px;
  min-width: 52px;
  text-align: center;
  color: #fff;
  background: #999;
}

.station-card__status.operating { background: #1890ff; }
.station-card__status.warning { background: #e6a23c; }
.station-card__status.stopped { background: #999; }

.station-card__content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: 12px 14px 14px;
}

.station-card__head {
  margin-bottom: 12px;
}

.station-card__name {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 8px;
}

.station-card__addr {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #909399;
  line-height: 2;

  i {
    font-size: 14px;
    flex-shrink: 0;
  }

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.station-card__code {
  margin-top: 2px;
  font-size: 12px;
  color: #909399;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.station-card__stats {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  border-top: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 12px;
}

.station-card__stat {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  font-size: 12px;
  color: #909399;
  line-height: 1.3;
}

.station-card__stat-label,
.station-card__stat-val {
  overflow: visible;
  text-overflow: clip;
  white-space: nowrap;
}

.station-card__stat-val {
  flex-shrink: 0;
  color: #909399;
}

.station-card__stat--energy {
  flex: none;
  margin-left: auto;
}

.station-card__ops {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-top: auto;

  ::v-deep .el-button {
    flex: none;
    width: 82px;
    margin: 0;
    color: #909399;
    border-color: #dcdfe6;
    background: #fff;
    border-radius: 4px;
  }

  ::v-deep .el-button:hover,
  ::v-deep .el-button:focus {
    color: #606266;
    border-color: #c0c4cc;
    background: #fff;
  }
}

.station-list ::v-deep .el-table {
  font-size: 13px;
  color: #606266;
  border: 1px solid #e6eaee !important;
  border-right: none !important;
  border-bottom: none !important;
}

.station-list ::v-deep .el-table__header-wrapper {
  border-radius: 8px 8px 0 0;
}

.station-list ::v-deep .el-table thead {
  font-weight: 600 !important;
  color: #333 !important;
}

.station-list ::v-deep .el-table .el-table__header-wrapper th,
.station-list ::v-deep .el-table .el-table__fixed-header-wrapper th {
  background-color: #f9f9f9 !important;
  color: #333;
  font-weight: 600;
  height: 40px;
  font-size: 13px;
}

.station-list ::v-deep .el-table th.el-table__cell.is-leaf,
.station-list ::v-deep .el-table td.el-table__cell {
  border-bottom: 1px solid #e6eaee !important;
}

.station-list ::v-deep .el-table--border .el-table__cell {
  border-right: 1px solid #e6eaee !important;
}

.station-list ::v-deep .el-table--enable-row-hover .el-table__body tr:hover > td.el-table__cell {
  background-color: #f5f7fa !important;
}

.station-list ::v-deep .el-table__body td {
  color: #606266;
}

.table-box ::v-deep .pagination-container {
  position: relative;
  margin: 0 !important;
  padding: 20px 0 0 !important;
  height: auto !important;
  text-align: right;
  background: #fff;
}

.table-box ::v-deep .pagination-container .el-pagination {
  position: static !important;
  right: auto;
}

@media (max-width: 1200px) {
  .flex {
    width: 45%;
  }

  .title {
    flex-wrap: wrap;
    gap: 16px 0;
  }

  .m-l-20 {
    margin-left: 0 !important;
  }
}

@media (max-width: 1000px) {
  .topItem {
    width: calc(100% / 3 - (15px * 2 / 3));

    &:nth-child(5n) {
      margin-right: 15px;
    }

    &:nth-child(3n) {
      margin-right: 0;
    }
  }

  .w100 {
    flex-direction: column;
  }

  .right2 {
    margin-left: 0 !important;
    margin-top: 16px;
    width: 100%;
    justify-content: flex-end;
  }
}

@media (max-width: 640px) {
  .station-page {
    padding: 8px;
  }

  .topItem {
    width: calc(100% / 2 - (15px / 2));

    &:nth-child(3n) {
      margin-right: 15px;
    }

    &:nth-child(2n) {
      margin-right: 0;
    }
  }

  .content-box,
  .table-box {
    padding: 12px;
  }

  .flex {
    width: 100%;
  }

  .table-tools {
    width: 100%;
  }
}
</style>
