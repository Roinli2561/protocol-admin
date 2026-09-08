<template>
  <section class="gun-page">
    <div class="gun-summary">
      <div class="topItem">
        <div class="flex-top">
          <div class="topItemName">
            <div class="topItemImg" style="background:#0C65F5">
              <img src="@/assets/multiProtocol/jygl-icon.png" alt="" />
            </div>
            <span>充电枪总数</span>
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
            <span>空闲</span>
          </div>
        </div>
        <div class="topItemValue">{{ idleCount }}</div>
      </div>
      <div class="topItem">
        <div class="flex-top">
          <div class="topItemName">
            <div class="topItemImg" style="background:#1890ff">
              <img src="@/assets/multiProtocol/jygl-icon.png" alt="" />
            </div>
            <span>充电中</span>
          </div>
        </div>
        <div class="topItemValue">{{ chargingCount }}</div>
      </div>
      <div class="topItem">
        <div class="flex-top">
          <div class="topItemName">
            <div class="topItemImg" style="background:#FDB924">
              <img src="@/assets/multiProtocol/jygl-icon.png" alt="" />
            </div>
            <span>设备可用率(%)</span>
          </div>
        </div>
        <div class="topItemValue">{{ availability }}</div>
      </div>
      <div class="topItem">
        <div class="flex-top">
          <div class="topItemName">
            <div class="topItemImg" style="background:#FB8B31">
              <img src="@/assets/multiProtocol/jygl-icon.png" alt="" />
            </div>
            <span>今日订单(单)</span>
          </div>
        </div>
        <div class="topItemValue">{{ todayOrderCount }}</div>
      </div>
    </div>

    <div class="content-box w100">
      <div class="left">
        <el-form ref="queryForm" :model="queryParams" class="search-form">
          <div class="title">
            <div class="flex">
              <div class="labelCss">充电枪名称</div>
              <el-input
                class="inputCss"
                v-model.trim="queryParams.gunName"
                placeholder="请输入充电枪名称"
                clearable
                @keyup.enter.native="handleQuery"
              />
            </div>
            <div class="flex m-l-20">
              <div class="labelCss">充电枪编号</div>
              <el-input
                class="inputCss"
                v-model.trim="queryParams.gunNo"
                placeholder="请输入充电枪编号"
                clearable
                @keyup.enter.native="handleQuery"
              />
            </div>
            <div class="flex m-l-20">
              <div class="labelCss">充电枪编码</div>
              <el-input
                class="inputCss"
                v-model.trim="queryParams.gunCode"
                placeholder="请输入充电枪编码"
                clearable
                @keyup.enter.native="handleQuery"
              />
            </div>
          </div>
          <div class="title m-t-20">
            <div class="flex">
              <div class="labelCss">所属站点</div>
              <el-select
                v-model="queryParams.stationId"
                placeholder="请选择所属站点"
                clearable
                filterable
                @change="handleQueryStationChange"
              >
                <el-option
                  v-for="item in stationOptions"
                  :key="item.id"
                  :label="item.stationName || item.label"
                  :value="item.id"
                />
              </el-select>
            </div>
            <div class="flex m-l-20">
              <div class="labelCss">所属充电桩</div>
              <el-select
                v-model="queryParams.pileId"
                placeholder="请选择所属充电桩"
                clearable
                filterable
              >
                <el-option
                  v-for="item in queryPileOptions"
                  :key="item.id"
                  :label="item.pileName || item.label"
                  :value="item.id"
                />
              </el-select>
            </div>
            <div class="flex m-l-20">
              <div class="labelCss">运行状态</div>
              <el-select v-model="queryParams.runStatus" placeholder="请选择运行状态" clearable>
                <el-option
                  v-for="item in displayGunStatusOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
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

      <div v-loading="loading" class="gun-list">
        <div v-if="viewMode === 'card'" class="card-grid">
          <article v-for="(gun, index) in cardGuns" :key="gun.id || gun.gunCode || index" class="gun-card">
            <div class="gun-card__side">
              <div class="gun-card__img-wrap">
                <img :src="gunImage" class="gun-card__img" alt="充电枪" />
              </div>
              <span class="gun-card__status" :class="gun.statusInfo.type">{{ gun.statusInfo.label }}</span>
            </div>
            <div class="gun-card__content">
              <div class="gun-card__head">
                <div class="gun-card__name" :title="gun.gunName">{{ gun.gunName || '未命名充电枪' }}</div>
                <div class="gun-card__addr">
                  <i class="el-icon-office-building" />
                  <span :title="gun.stationName">{{ gun.stationName || '未关联站点' }}</span>
                </div>
                <div class="gun-card__code">编码：{{ gun.gunCode || gun.gunNo || '-' }}</div>
              </div>
              <div class="gun-card__stats">
                <div class="gun-card__stat">
                  <span class="gun-card__stat-label">额定功率:</span>
                  <span class="gun-card__stat-val">{{ gun.power }} kW</span>
                </div>
                <div class="gun-card__stat gun-card__stat--right">
                  <span class="gun-card__stat-label">接口标准:</span>
                  <span class="gun-card__stat-val">{{ gun.interfaceStandard }}</span>
                </div>
                <div v-if="gun.statusInfo.type === 'charging'" class="gun-card__stat">
                  <span class="gun-card__stat-label">SOC:</span>
                  <span class="gun-card__stat-val">{{ gun.soc }}%</span>
                </div>
              </div>
              <div class="gun-card__ops">
                <el-button size="mini" plain @click="handleUpdate(gun)">编辑</el-button>
                <el-button size="mini" plain @click="handleDelete(gun)">删除</el-button>
                <el-button
                  v-if="gun.statusInfo.type === 'charging'"
                  size="mini"
                  plain
                  icon="el-icon-data-line"
                  class="gun-card__ops-btn--realtime"
                  @click="openRealtime(gun)"
                >实时参数</el-button>
              </div>
            </div>
          </article>
          <div v-if="!loading && !cardGuns.length" class="empty-state"><p>暂无充电枪数据</p></div>
        </div>

        <div v-else class="table-wrapper">
          <el-table :data="tableData" border>
            <el-table-column label="序号" width="70" align="center"><template slot-scope="scope">{{ (queryParams.page - 1) * queryParams.size + scope.$index + 1 }}</template></el-table-column>
            <el-table-column label="充电枪名称" prop="gunName" min-width="160" show-overflow-tooltip />
            <el-table-column label="充电枪编号" prop="gunNo" min-width="130" show-overflow-tooltip />
            <el-table-column label="充电枪编码" prop="gunCode" min-width="160" show-overflow-tooltip />
            <el-table-column label="所属站点" prop="stationName" min-width="180" show-overflow-tooltip />
            <el-table-column label="所属充电桩" prop="pileName" min-width="180" show-overflow-tooltip />
            <el-table-column label="充电桩编码" prop="pileCode" min-width="160" show-overflow-tooltip />
            <el-table-column label="运行状态" prop="runStatus" width="120" align="center"><template slot-scope="scope"><el-tag :type="getGunStatusTag(scope.row.runStatus)" size="mini">{{ formatGunStatus(scope.row.runStatus) }}</el-tag></template></el-table-column>
            <el-table-column label="更新时间" prop="updatedTime" width="170" align="center"><template slot-scope="scope">{{ parseTime(scope.row.updatedTime || scope.row.createdTime) }}</template></el-table-column>
            <el-table-column label="操作" width="240" align="left" fixed="right" class-name="gun-ops-col" label-class-name="gun-ops-col">
              <template slot-scope="scope">
                <el-button type="text" size="mini" icon="el-icon-edit" @click="handleUpdate(scope.row)">编辑</el-button>
                <el-button type="text" size="mini" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
                <el-button
                  v-if="getCardStatus(scope.row.runStatus, scope.row.id || scope.row.gunCode || scope.$index).type === 'charging'"
                  type="text"
                  size="mini"
                  icon="el-icon-data-line"
                  @click="openRealtime(scope.row)"
                >实时参数</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <pagination v-show="total > 0" :total="total" :page.sync="queryParams.page" :limit.sync="queryParams.size" @pagination="getList" />
    </div>

    <el-dialog :title="title" :visible.sync="open" width="760px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="充电枪名称" prop="gunName"><el-input v-model.trim="form.gunName" placeholder="请输入充电枪名称" maxlength="100" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="充电枪编号" prop="gunNo"><el-input v-model.trim="form.gunNo" :disabled="!!form.id" placeholder="请输入充电枪编号" maxlength="64" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="充电枪编码" prop="gunCode"><el-input v-model.trim="form.gunCode" :disabled="!!form.id" placeholder="请输入充电枪编码" maxlength="64" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="所属站点" prop="stationId"><el-select v-model="form.stationId" placeholder="请选择站点" filterable style="width: 100%" @change="handleFormStationChange"><el-option v-for="item in stationOptions" :key="item.id" :label="item.stationName || item.label" :value="item.id" /></el-select></el-form-item></el-col>
        </el-row>
        <el-row :gutter="16"><el-col :span="12"><el-form-item label="所属充电桩" prop="pileId"><el-select v-model="form.pileId" placeholder="请选择充电桩" filterable style="width: 100%"><el-option v-for="item in formPileOptions" :key="item.id" :label="item.pileName || item.label" :value="item.id" /></el-select></el-form-item></el-col></el-row>
      </el-form>
      <div slot="footer" class="dialog-footer"><el-button type="primary" :loading="submitLoading" @click="submitForm">确定</el-button><el-button @click="cancel">取消</el-button></div>
    </el-dialog>

    <el-dialog
      :title="realtimeTitle"
      :visible.sync="realtimeOpen"
      width="1100px"
      append-to-body
      custom-class="gun-realtime-dialog"
      @opened="renderRealtimeCharts"
      @closed="disposeRealtimeCharts"
    >
      <div class="realtime-rows">
        <div class="realtime-row">
          <div v-for="item in realtimeChartDefs.slice(0, 3)" :key="item.key" class="realtime-card">
            <div :ref="'rtChart_' + item.key" class="realtime-chart" />
          </div>
        </div>
        <div class="realtime-row">
          <div v-for="item in realtimeChartDefs.slice(3, 6)" :key="item.key" class="realtime-card">
            <div :ref="'rtChart_' + item.key" class="realtime-chart" />
          </div>
        </div>
      </div>
    </el-dialog>
  </section>
</template>

<script>
import * as echarts from 'echarts'
import { addGun, delGun, getGun, listGuns, updateGun } from '@/api/multiProtocol/gun'
import { listPileOptions } from '@/api/multiProtocol/pile'
import { listStationOptions } from '@/api/multiProtocol/station'
import { parseTime } from '@/utils/witos'
import gunImage from '@/assets/multiProtocol/pile.jpg'

const realtimeChartDefs = [
  { key: 'electricity', title: '电流', unit: 'A', color: '#F9C84B', areaColor: 'rgba(249,200,75,0.18)', min: 80, max: 220 },
  { key: 'voltage', title: '电压', unit: 'V', color: '#457DFF', areaColor: 'rgba(69,125,255,0.16)', min: 380, max: 750 },
  { key: 'power', title: '功率', unit: 'kW', color: '#4dd42c', areaColor: 'rgba(77,212,44,0.16)', min: 40, max: 160 },
  { key: 'soc', title: 'SOC', unit: '%', color: '#F9C84B', areaColor: 'rgba(249,200,75,0.18)', min: 20, max: 95, rising: true },
  { key: 'quantity', title: '电量', unit: 'kWh', color: '#457DFF', areaColor: 'rgba(69,125,255,0.16)', min: 5, max: 80, rising: true },
  { key: 'fee', title: '电费', unit: '元', color: '#4dd42c', areaColor: 'rgba(77,212,44,0.16)', min: 8, max: 90, rising: true }
]

const gunStatusOptions = [
  { label: '空闲', value: 'IDLE' }, { label: '已插枪', value: 'INSERTED' }, { label: '充电中', value: 'CHARGING' },
  { label: '充电完成', value: 'CHARGE_COMPLETE' }, { label: '放电准备', value: 'DISCHARGE_READY' }, { label: '放电中', value: 'DISCHARGING' },
  { label: '放电完成', value: 'DISCHARGE_COMPLETE' }, { label: '预约中', value: 'RESERVED' }, { label: '故障', value: 'FAULT' }
]

export default {
  name: 'GunCrud',
  data() {
    return {
      gunStatusOptions, gunImage, viewMode: 'card', loading: false, submitLoading: false, open: false, title: '', total: 0,
      tableData: [], summaryGuns: [], stationOptions: [], pileOptions: [],
      queryParams: { page: 1, size: 10, gunName: undefined, gunNo: undefined, gunCode: undefined, stationId: undefined, pileId: undefined, runStatus: undefined },
      form: {},
      rules: {
        gunName: [{ required: true, message: '请输入充电枪名称', trigger: 'blur' }], gunNo: [{ required: true, message: '请输入充电枪编号', trigger: 'blur' }],
        gunCode: [{ required: true, message: '请输入充电枪编码', trigger: 'blur' }], stationId: [{ required: true, message: '请选择所属站点', trigger: 'change' }],
        pileId: [{ required: true, message: '请选择所属充电桩', trigger: 'change' }]
      },
      realtimeOpen: false,
      realtimeGun: null,
      realtimeChartDefs,
      realtimeChartInstances: {}
    }
  },
  computed: {
    displayGunStatusOptions() {
      return this.gunStatusOptions.map(item => item.value === 'DISCHARGING' ? { ...item, label: '\u5145\u7535\u4e2d' } : item)
    },
    queryPileOptions() { return this.filterPileOptions(this.queryParams.stationId) },
    formPileOptions() { return this.filterPileOptions(this.form.stationId) },
    cardGuns() {
      const powers = [120, 120, 180, 40, 120, 60, 240, 120, 180, 120]
      return this.tableData.map((gun, index) => {
        const key = gun.id || gun.gunCode || index
        const statusInfo = this.getCardStatus(gun.runStatus, key)
        const soc = statusInfo.type === 'charging'
          ? (gun.soc != null ? gun.soc : this.hash(String(key) + '-soc') % 61 + 20)
          : null
        return {
          ...gun,
          power: gun.ratedPower == null ? powers[index % powers.length] : gun.ratedPower,
          interfaceStandard: gun.interfaceStandard || 'GB/T',
          statusInfo,
          soc
        }
      })
    },
    realtimeTitle() {
      const name = (this.realtimeGun && (this.realtimeGun.gunName || this.realtimeGun.gunCode)) || '充电枪'
      return `实时参数 - ${name}`
    },
    summaryStatusGuns() {
      return this.summaryGuns.map((gun, index) => this.getCardStatus(gun.runStatus, gun.id || gun.gunCode || index))
    },
    idleCount() { return this.summaryStatusGuns.filter(item => item.value === 'IDLE').length },
    chargingCount() { return this.summaryStatusGuns.filter(item => ['CHARGING', 'DISCHARGING'].includes(item.value)).length },
    faultCount() { return this.summaryStatusGuns.filter(item => item.value === 'FAULT').length },
    availability() {
      if (!this.summaryStatusGuns.length) return '0.0'
      return (((this.summaryStatusGuns.length - this.faultCount) / this.summaryStatusGuns.length) * 100).toFixed(1)
    },
    todayOrderCount() { return this.summaryStatusGuns.filter(item => ['CHARGING', 'CHARGE_COMPLETE', 'DISCHARGING', 'DISCHARGE_COMPLETE'].includes(item.value)).length }
  },
  created() { this.loadBaseOptions(); this.loadSummary(); this.getList() },
  beforeDestroy() {
    this.disposeRealtimeCharts()
  },
  methods: {
    parseTime,
    openRealtime(gun) {
      this.realtimeGun = gun
      this.realtimeOpen = true
    },
    buildRealtimeTimes(points = 24) {
      const now = new Date()
      return Array.from({ length: points }, (_, index) => {
        const time = new Date(now.getTime() - (points - 1 - index) * 5 * 60 * 1000)
        return `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`
      })
    },
    buildRealtimeSeries(def, seedKey) {
      const points = 24
      const seed = this.hash(String(seedKey) + '-' + def.key)
      const base = def.min + (seed % Math.max(def.max - def.min, 1))
      const amp = (def.max - def.min) * 0.18
      const phase = (seed % 628) / 100
      return Array.from({ length: points }, (_, index) => {
        const t = index / Math.max(points - 1, 1)
        if (def.rising) {
          const start = Math.max(def.min, base * 0.55)
          const end = Math.min(def.max, Math.max(start + (def.max - def.min) * 0.35, base))
          const wave = Math.sin(t * Math.PI * 2 * 1.4 + phase) * amp * 0.25
          const noise = ((this.hash(`${seedKey}-${def.key}-${index}`) % 21) - 10) / 10
          return Number((start + (end - start) * t + wave + noise).toFixed(1))
        }
        const wave =
          Math.sin(t * Math.PI * 2 * 1.6 + phase) * amp +
          Math.sin(t * Math.PI * 2 * 3.1 + phase * 1.2) * (amp * 0.35)
        const noise = ((this.hash(`${seedKey}-${def.key}-${index}`) % 17) - 8) / 5
        const value = base + wave + noise
        return Number(Math.min(def.max, Math.max(def.min, value)).toFixed(1))
      })
    },
    getRealtimeChartDom(key) {
      const ref = this.$refs['rtChart_' + key]
      return Array.isArray(ref) ? ref[0] : ref
    },
    renderRealtimeCharts() {
      this.$nextTick(() => {
        this.disposeRealtimeCharts()
        const gun = this.realtimeGun || {}
        const seedKey = gun.id || gun.gunCode || gun.gunName || 'gun'
        const times = this.buildRealtimeTimes()
        const instances = []
        this.realtimeChartDefs.forEach((def) => {
          const dom = this.getRealtimeChartDom(def.key)
          if (!dom) return
          const chart = echarts.init(dom)
          const data = this.buildRealtimeSeries(def, seedKey)
          chart.setOption({
            title: {
              text: def.title,
              left: 8,
              top: 8,
              textStyle: { color: '#303133', fontSize: 14, fontWeight: 600 },
              subtext: def.unit,
              subtextStyle: { color: '#909399', fontSize: 12 }
            },
            tooltip: { trigger: 'axis' },
            legend: {
              right: 12,
              top: 12,
              itemWidth: 10,
              itemHeight: 10,
              icon: 'circle',
              textStyle: { color: def.color, fontSize: 12 },
              data: [def.title]
            },
            grid: { left: 16, right: 16, top: 58, bottom: 24, containLabel: true },
            xAxis: {
              type: 'category',
              boundaryGap: false,
              data: times,
              axisLine: { lineStyle: { color: '#ececec' } },
              axisTick: { show: false },
              axisLabel: { color: '#999', fontSize: 11 }
            },
            yAxis: {
              type: 'value',
              axisLine: { show: false },
              axisTick: { show: false },
              axisLabel: { color: '#999' },
              splitLine: { lineStyle: { color: '#f0f0f0' } }
            },
            series: [{
              name: def.title,
              type: 'line',
              smooth: true,
              showSymbol: false,
              data,
              itemStyle: { color: def.color },
              lineStyle: { width: 2, color: def.color },
              areaStyle: {
                color: {
                  type: 'linear',
                  x: 0, y: 0, x2: 0, y2: 1,
                  colorStops: [
                    { offset: 0, color: def.areaColor },
                    { offset: 1, color: 'rgba(255,255,255,0)' }
                  ]
                }
              }
            }]
          })
          this.$set(this.realtimeChartInstances, def.key, chart)
          instances.push(chart)
        })
        if (instances.length) echarts.connect(instances)
        this.$nextTick(() => {
          instances.forEach((chart) => chart.resize())
        })
      })
    },
    disposeRealtimeCharts() {
      Object.keys(this.realtimeChartInstances || {}).forEach((key) => {
        const chart = this.realtimeChartInstances[key]
        if (chart) chart.dispose()
      })
      this.realtimeChartInstances = {}
    },
    loadBaseOptions() { listStationOptions().then(res => { this.stationOptions = res.data || [] }); listPileOptions().then(res => { this.pileOptions = res.data || [] }) },
    loadSummary() {
      listGuns({ page: 1, size: 6000 }).then(res => {
        const pageData = res.data || {}
        this.summaryGuns = pageData.records || []
      })
    },
    filterPileOptions(stationId) { return stationId ? this.pileOptions.filter(item => item.stationId === stationId) : this.pileOptions },
    randomStatus(key) { const values = ['IDLE', 'CHARGING', 'RESERVED', 'INSERTED', 'FAULT', 'CHARGE_COMPLETE']; return values[this.hash(key) % values.length] },
    hash(value) { return String(value).split('').reduce((total, char) => ((total * 31) + char.charCodeAt(0)) >>> 0, 0) },
    getCardStatus(value, key) {
      const status = value || this.randomStatus(key)
      const match = this.gunStatusOptions.find(item => item.value === status) || this.gunStatusOptions[0]
      const types = {
        IDLE: 'idle',
        INSERTED: 'inserted',
        CHARGING: 'charging',
        CHARGE_COMPLETE: 'idle',
        DISCHARGE_READY: 'inserted',
        DISCHARGING: 'charging',
        DISCHARGE_COMPLETE: 'idle',
        RESERVED: 'occupied',
        FAULT: 'fault',
        OFFLINE: 'offline'
      }
      const label = match.value === 'DISCHARGING' ? '\u5145\u7535\u4e2d' : match.label
      return { value: match.value, label, type: types[match.value] || 'offline' }
    },
    formatGunStatus(value) { return this.getCardStatus(value, value).label },
    getGunStatusTag(value) {
      const type = this.getCardStatus(value, value).type
      if (type === 'fault') return 'danger'
      if (type === 'charging' || type === 'occupied' || type === 'inserted') return 'warning'
      if (type === 'idle') return 'success'
      return 'info'
    },
    reset() { this.form = { id: undefined, gunName: undefined, gunNo: undefined, gunCode: undefined, stationId: undefined, pileId: undefined }; this.resetForm('form') },
    getList() { this.loading = true; listGuns(this.queryParams).then(res => { const pageData = res.data || {}; this.tableData = pageData.records || []; this.total = pageData.total || 0 }).finally(() => { this.loading = false }) },
    handleQuery() { this.queryParams.page = 1; this.getList() },
    resetQuery() { this.resetForm('queryForm'); this.queryParams = { page: 1, size: 10, gunName: undefined, gunNo: undefined, gunCode: undefined, stationId: undefined, pileId: undefined, runStatus: undefined }; this.getList() },
    handleQueryStationChange() { this.queryParams.pileId = undefined },
    handleFormStationChange() { this.form.pileId = undefined },
    handleAdd() { this.reset(); this.title = '新增充电枪'; this.open = true },
    handleUpdate(row) { this.reset(); getGun(row.id).then(res => { this.form = Object.assign({}, this.form, res.data); this.title = '编辑充电枪'; this.open = true }) },
    handleDelete(row) { this.$confirm(`确认删除充电枪“${row.gunName}”吗？`, '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }).then(() => delGun(row.id)).then(() => { this.$modal.msgSuccess('删除成功'); if (this.tableData.length === 1 && this.queryParams.page > 1) this.queryParams.page -= 1; this.loadSummary(); this.getList() }).catch(() => {}) },
    cancel() { this.open = false; this.reset() },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        const payload = { gunName: this.form.gunName, gunNo: this.form.gunNo, gunCode: this.form.gunCode, stationId: this.form.stationId, pileId: this.form.pileId }
        const request = this.form.id ? updateGun(this.form.id, payload) : addGun(payload)
        this.submitLoading = true
        request.then(() => { this.$modal.msgSuccess(this.form.id ? '编辑成功' : '新增成功'); this.open = false; this.loadBaseOptions(); this.loadSummary(); this.getList() }).finally(() => { this.submitLoading = false })
      })
    }
  }
}
</script>

<style scoped lang="scss">
.gun-page {
  width: 100%;
  min-height: calc(100vh - 84px);
  padding: 0px 15px 15px 15px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  background: #f6f8fa;
}

.gun-summary {
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

.m-t-20 {
  margin-top: 20px;
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

.gun-list {
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
  grid-template-columns: repeat(auto-fill, minmax(max(360px, calc((100% - 45px) / 4)), 1fr));
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

.gun-card {
  background: #fff;
  border: 1px solid #e8ecf1;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  min-width: 0;
  min-height: 248px;
  transition: box-shadow .2s;
}

.gun-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, .08);
}

.gun-card__side {
  width: 120px;
  flex: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px 22px;
  box-sizing: border-box;
}

.gun-card__img-wrap {
  width: 100%;
  height: 150px;
  flex: none;
  overflow: hidden;
  background: transparent;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.gun-card__img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
  object-position: top center;
  padding: 0 6px;
  box-sizing: border-box;
}

.gun-card__status {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: auto;
  font-size: 12px;
  line-height: 1;
  height: 28px;
  padding: 0 14px;
  border-radius: 4px;
  min-width: 64px;
  text-align: center;
  box-sizing: border-box;
  color: #fff;
  background: #8B8B8B;
}

.gun-card__status.idle {
  background: #3D7FFF;
  color: #fff;
}

.gun-card__status.charging {
  background: #FFC327;
  color: #fff;
}

.gun-card__status.fault {
  background: #FF7C52;
  color: #fff;
}

.gun-card__status.offline {
  background: #8B8B8B;
  color: #fff;
}

.gun-card__status.occupied {
  background: #FFAD66;
  color: #fff;
}

.gun-card__status.inserted {
  background: #F0B515;
  color: #fff;
}

.gun-card__content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 22px 18px;
}

.gun-card__head {
  margin-bottom: 16px;
}

.gun-card__name {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 10px;
}

.gun-card__addr {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #909399;
  line-height: 1.8;

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

.gun-card__code {
  margin-top: 6px;
  font-size: 12px;
  color: #909399;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gun-card__stats {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  padding: 0;
  border: 0;
  margin: 0 0 18px;
}

.gun-card__stat {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  width: 100%;
  font-size: 12px;
  color: #909399;
  line-height: 1.3;
}

.gun-card__stat-label,
.gun-card__stat-val {
  overflow: visible;
  text-overflow: clip;
  white-space: nowrap;
}

.gun-card__stat-val {
  flex-shrink: 0;
  color: #909399;
}

.gun-card__stat--right {
  flex: none;
  margin-left: 0;
}

.gun-card__ops {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  margin-top: auto;
  padding-left: 12px;
  min-height: 28px;

  ::v-deep .el-button {
    flex: none;
    width: 65px;
    height: 28px;
    margin: 0;
    padding: 0;
    color: #909399;
    border-color: #dcdfe6;
    background: #fff;
    border-radius: 4px;
    text-align: center;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  ::v-deep .gun-card__ops-btn--realtime {
    width: auto;
    min-width: 65px;
    padding: 0 8px;
  }

  ::v-deep .el-button:hover,
  ::v-deep .el-button:focus {
    color: #606266;
    border-color: #c0c4cc;
    background: #fff;
  }
}

.gun-list ::v-deep .el-table {
  font-size: 13px;
  color: #606266;
  border: 1px solid #e6eaee !important;
  border-right: none !important;
  border-bottom: none !important;
}

.gun-list ::v-deep .el-table__header-wrapper {
  border-radius: 8px 8px 0 0;
}

.gun-list ::v-deep .el-table thead {
  font-weight: 600 !important;
  color: #333 !important;
}

.gun-list ::v-deep .el-table .el-table__header-wrapper th,
.gun-list ::v-deep .el-table .el-table__fixed-header-wrapper th {
  background-color: #f9f9f9 !important;
  color: #333;
  font-weight: 600;
  height: 40px;
  font-size: 13px;
}

.gun-list ::v-deep .el-table th.el-table__cell.is-leaf,
.gun-list ::v-deep .el-table td.el-table__cell {
  border-bottom: 1px solid #e6eaee !important;
}

.gun-list ::v-deep .el-table--border .el-table__cell {
  border-right: 1px solid #e6eaee !important;
}

.gun-list ::v-deep .el-table--enable-row-hover .el-table__body tr:hover > td.el-table__cell {
  background-color: #f5f7fa !important;
}

.gun-list ::v-deep .gun-ops-col .cell {
  padding-left: 16px;
}

.gun-list ::v-deep .el-table__body td {
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
  .gun-page {
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

<style lang="scss">
.gun-realtime-dialog {
  .el-dialog__body {
    padding: 12px 20px 20px;
    background: #f5f6f8;
  }
}

.realtime-rows {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.realtime-row {
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap: 15px;
}

.realtime-card {
  flex: 1;
  min-width: 0;
  height: 300px;
  padding: 8px 4px 4px;
  border-radius: 8px;
  background: #fff;
  box-sizing: border-box;
}

.realtime-chart {
  width: 100%;
  height: 100%;
}
</style>
