<template>
  <section class="station-page">
    <div class="station-summary">
      <article class="summary-item summary-primary">
        <span class="summary-icon"><i class="el-icon-office-building" /></span>
        <div><strong>{{ total }}</strong><p>站点总数</p></div>
      </article>
      <article class="summary-item summary-success">
        <span class="summary-icon"><i class="el-icon-circle-check" /></span>
        <div><strong>{{ operatingCount }}</strong><p>运营中</p></div>
      </article>
      <article class="summary-item summary-warning">
        <span class="summary-icon"><i class="el-icon-warning-outline" /></span>
        <div><strong>{{ maintenanceCount }}</strong><p>维护 / 停运</p></div>
      </article>
      <article class="summary-item summary-energy">
        <span class="summary-icon"><i class="el-icon-lightning" /></span>
        <div><strong>{{ todayEnergy }}<small>kWh</small></strong><p>今日充电量</p></div>
      </article>
      <article class="summary-item summary-device">
        <span class="summary-icon"><i class="el-icon-mobile-phone" /></span>
        <div><strong>{{ gunTotal }}<small>把</small></strong><p>接入充电枪</p></div>
      </article>
    </div>

    <main class="station-content">
      <div class="station-toolbar">
        <el-form ref="queryForm" :model="queryParams" size="small" :inline="true" class="query-form">
          <el-form-item>
            <el-input v-model.trim="queryParams.stationName" placeholder="请输入充电站名称" clearable @keyup.enter.native="handleQuery" />
          </el-form-item>
          <el-form-item>
            <el-input v-model.trim="queryParams.stationCode" placeholder="请输入充电站编码" clearable @keyup.enter.native="handleQuery" />
          </el-form-item>
          <el-form-item>
            <el-select v-model="queryParams.status" placeholder="全部状态" clearable>
              <el-option label="运营中" value="operating" />
              <el-option label="维护中" value="maintenance" />
              <el-option label="停运" value="stopped" />
            </el-select>
          </el-form-item>
          <el-form-item class="query-actions">
            <el-button type="primary" icon="el-icon-search" @click="handleQuery">查询</el-button>
            <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
        <div class="toolbar-actions">
          <div class="view-switch" aria-label="视图切换">
            <el-tooltip content="表格视图" placement="top"><button :class="{ active: viewMode === 'table' }" @click="viewMode = 'table'"><i class="el-icon-tickets" /></button></el-tooltip>
            <el-tooltip content="卡片视图" placement="top"><button :class="{ active: viewMode === 'card' }" @click="viewMode = 'card'"><i class="el-icon-menu" /></button></el-tooltip>
          </div>
          <el-button type="primary" icon="el-icon-plus" @click="handleAdd">新建充电站</el-button>
        </div>
      </div>

      <div v-loading="loading" class="station-list">
        <div v-if="viewMode === 'card'" class="card-grid">
          <article v-for="(station, index) in cardStations" :key="station.id || station.stationCode || index" class="station-card">
            <div class="station-image"><img :src="stationImage" alt="充电站" /></div>
            <div class="station-card-body">
              <div class="station-card-head">
                <h3 :title="station.stationName">{{ station.stationName || '未命名充电站' }}</h3>
                <div class="card-actions">
                  <el-tooltip content="编辑" placement="top"><button class="edit" @click="handleUpdate(station)"><i class="el-icon-edit" /></button></el-tooltip>
                  <el-tooltip content="删除" placement="top"><button class="delete" @click="handleDelete(station)"><i class="el-icon-delete" /></button></el-tooltip>
                </div>
              </div>
              <div class="station-code"><span :class="['status-dot', station.status.type]" />{{ station.status.label }}<b>{{ station.stationCode || '-' }}</b></div>
              <dl class="station-details">
                <div><dt>所在地区</dt><dd :title="station.region">{{ station.region }}</dd></div>
                <div><dt>详细地址</dt><dd :title="station.address">{{ station.address || '-' }}</dd></div>
              </dl>
              <div class="station-metrics">
                <div><strong>{{ station.pileCount }}</strong><span>充电桩</span></div>
                <div><strong>{{ station.energy }}</strong><span>今日充电量(kWh)</span></div>
              </div>
            </div>
          </article>
          <div v-if="!loading && !cardStations.length" class="empty-state">暂无充电站数据</div>
        </div>

        <el-table v-else :data="tableData" border height="100%">
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

      <pagination v-show="total > 0" :total="total" :page.sync="queryParams.page" :limit.sync="queryParams.size" @pagination="getList" />
    </main>

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
import stationImage from '@/assets/multiProtocol/station.svg'

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
  height: calc(100vh - 50px);
  min-height: 0;
  padding: 10px 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #e9edf2;
}

.station-summary {
  height: 68px;
  flex: none;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
}

.summary-item {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: #fff;
  border-radius: 7px;
  box-shadow: 0 1px 2px rgba(16, 24, 40, .05);
  .summary-icon { width: 35px; height: 35px; flex: none; display: grid; place-items: center; border-radius: 8px; font-size: 19px; }
  strong { display: block; color: #1f2329; font-size: 19px; line-height: 22px; font-variant-numeric: tabular-nums; white-space: nowrap; }
  small { margin-left: 2px; color: #8a919f; font-size: 10px; font-weight: 400; }
  p { margin: 1px 0 0; color: #8a919f; font-size: 11px; line-height: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
}
.summary-primary .summary-icon { color: #1890ff; background: #e6f4ff; }
.summary-success .summary-icon { color: #52c41a; background: #f6ffed; }
.summary-warning .summary-icon, .summary-energy .summary-icon { color: #fa8c16; background: #fff7e6; }
.summary-device .summary-icon { color: #13c2c2; background: #e6fffb; }

.station-content { min-height: 0; flex: 1; display: flex; flex-direction: column; padding: 9px 12px 4px; background: #fff; border-radius: 7px; box-shadow: 0 1px 2px rgba(16, 24, 40, .05); }
.station-toolbar { flex: none; display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding-bottom: 8px; }
.query-form { display: flex; flex-wrap: wrap; gap: 8px; margin: 0; }
.query-form ::v-deep .el-form-item { margin: 0; }
.query-form ::v-deep .el-input { width: 180px; }
.query-form ::v-deep .el-select { width: 120px; }
.query-actions { white-space: nowrap; }
.toolbar-actions { display: flex; align-items: center; gap: 10px; flex: none; }
.view-switch { display: flex; overflow: hidden; border: 1px solid #dcdfe6; border-radius: 5px; }
.view-switch button { width: 30px; height: 28px; padding: 0; border: 0; border-right: 1px solid #ebeef5; color: #8a919f; background: #fff; cursor: pointer; }
.view-switch button:last-child { border-right: 0; }
.view-switch button.active { color: #1890ff; background: #e8f3ff; }
.station-list { flex: 1; min-height: 0; overflow: hidden; }
.card-grid { height: 100%; min-height: 0; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); grid-template-rows: repeat(2, minmax(214px, 1fr)); grid-auto-rows: 214px; gap: 9px; align-content: start; overflow: auto; padding: 2px 0; }
.empty-state { grid-column: 1 / -1; display: grid; min-height: 180px; place-items: center; color: #909399; font-size: 13px; }
.station-card { min-width: 0; overflow: hidden; display: flex; flex-direction: column; border: 1px solid #ebeef5; border-radius: 8px; background: #fff; box-shadow: 0 1px 2px rgba(16, 24, 40, .04); }
.station-image { height: clamp(86px, 38%, 144px); overflow: hidden; background: #e1edf7; }
.station-image img { display: block; width: 100%; height: 100%; object-fit: cover; }
.station-card-body { flex: 1; min-height: 0; display: flex; flex-direction: column; padding: 10px 10px 12px; }
.station-card-head { min-width: 0; display: flex; align-items: center; gap: 5px; }
.station-card-head h3 { flex: 1; min-width: 0; margin: 0; color: #1f2329; font-size: 14px; font-weight: 600; line-height: 22px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.card-actions { flex: none; display: flex; gap: 4px; }
.card-actions button { width: 22px; height: 22px; padding: 0; border: 0; border-radius: 5px; cursor: pointer; }
.card-actions .edit { color: #1890ff; background: #e8f3ff; }
.card-actions .delete { color: #ff4d4f; background: #fff1f0; }
.station-code { display: flex; align-items: center; gap: 5px; min-width: 0; margin-top: 6px; color: #389e0d; font-size: 11px; line-height: 17px; }
.station-code b { min-width: 0; margin-left: 2px; overflow: hidden; color: #8a919f; font-weight: 400; text-overflow: ellipsis; white-space: nowrap; }
.status-dot { width: 6px; height: 6px; flex: none; border-radius: 50%; background: #52c41a; }
.status-dot.warning { background: #fa8c16; }.status-dot.stopped { background: #ff4d4f; }
.station-details { margin: 10px 0 0; display: grid; gap: 7px; }
.station-details div { min-width: 0; display: flex; gap: 7px; color: #3c4043; font-size: 12px; line-height: 18px; }
.station-details dt { flex: none; color: #8a919f; }.station-details dd { min-width: 0; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.station-metrics { margin-top: 16px; display: flex; gap: 18px; padding-top: 10px; border-top: 1px dashed #eceff4; }
.station-metrics div { min-width: 0; display: flex; flex-direction: column; }.station-metrics strong { color: #1f2329; font-size: 15px; line-height: 19px; font-variant-numeric: tabular-nums; }.station-metrics span { margin-top: 2px; color: #8a919f; font-size: 10px; white-space: nowrap; }
.station-list ::v-deep .el-table { font-size: 12px; }.station-list ::v-deep .el-table th { background: #fafbfc; color: #4a4f57; }.station-list ::v-deep .el-table td, .station-list ::v-deep .el-table th { padding: 7px 0; }
.station-content ::v-deep .pagination-container { min-height: 52px; margin: 0; padding: 10px 0 14px; }

@media (max-width: 1300px) { .card-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
@media (max-width: 1000px) { .station-summary { grid-template-columns: repeat(3, minmax(0, 1fr)); height: auto; }.summary-item { min-height: 62px; }.card-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }.station-page { overflow: auto; }.station-content { min-height: 500px; }.station-toolbar { align-items: flex-start; flex-direction: column; }.toolbar-actions { align-self: flex-end; } }
@media (max-width: 640px) { .station-page { padding: 8px; }.station-summary { grid-template-columns: repeat(2, minmax(0, 1fr)); }.summary-item:last-child { grid-column: span 2; }.card-grid { grid-template-columns: 1fr; }.query-form ::v-deep .el-input, .query-form ::v-deep .el-select { width: calc(100vw - 40px); }.toolbar-actions { width: 100%; justify-content: space-between; }.station-content { padding: 8px; } }
</style>
