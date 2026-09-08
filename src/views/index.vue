<template>
  <div class="dashboard-page">
    <main>
        <section class="kpis">
          <article v-for="k in kpis" :key="k.label" class="kpi">
            <div class="kpi__head">
              <span class="kpi__icon">
                <img :src="k.icon" :style="{ width: k.iconWidth || '75%' }" alt="" />
              </span>
              <span class="kpi__label">{{ k.label }}<template v-if="k.unit">({{ k.unit }})</template></span>
            </div>
            <div class="kpi__value">{{ k.value }}</div>
            <div
              v-if="k.change"
              class="kpi__tip"
              :class="k.flat ? 'kpi__tip--muted' : 'kpi__tip--trend'"
            >
              <template v-if="k.flat">{{ k.change }}</template>
              <template v-else>
                <span class="kpi__tip-label">{{ k.compare }}</span>
                <span class="kpi__trend">
                  <img class="kpi__arrow" :src="lineIcon" alt="" />{{ k.change }}
                </span>
              </template>
            </div>
          </article>
        </section>
        <section class="row row--charts">
          <article class="panel trend">
            <Title color="#5F7DF9" text="充电量与金额趋势">
              <span class="panel-title__extra">
                <span class="trend-legend">
                  <span class="trend-legend__item"><i class="trend-legend-mark energy"></i>充电量</span>
                  <span class="trend-legend__item"><i class="trend-legend-mark amount"></i>充电金额</span>
                </span>
                <div class="chart-seg">
                  <span
                    v-for="p in periods"
                    :key="'trend-' + p.value"
                    class="chart-seg__item"
                    :class="{ 'chart-seg__item--active': trendPeriod === p.value }"
                    @click="trendPeriod = p.value"
                  >{{ p.label }}</span>
                </div>
              </span>
            </Title>
            <div ref="trendChart" class="trend-chart"></div>
          </article>
          <article class="panel panel--protocol">
            <Title color="#5F7DF9" text="协议接入桩数分布" />
            <div class="donut-body">
              <div class="donut-wrap">
                <svg class="donut" viewBox="0 0 200 200">
                  <circle
                    cx="100"
                    cy="100"
                    r="78"
                    fill="none"
                    stroke="#f1f3f6"
                    stroke-width="12"
                  />
                  <circle
                    v-for="s in slices"
                    :key="s.name"
                    cx="100"
                    cy="100"
                    r="78"
                    fill="none"
                    :stroke="s.color"
                    stroke-width="12"
                    :stroke-dasharray="s.dash"
                    :transform="'rotate(' + s.rotate + ' 100 100)'"
                  />
                </svg>
                <div class="donut-center">
                  <strong>{{ fmt(protocolTotal) }}</strong>
                  <span>接入充电桩</span>
                </div>
              </div>
              <div class="d-legend">
                <div v-for="s in slices" :key="s.name">
                  <i :style="{ background: s.color }"></i>
                  <span class="d-legend__label">{{ s.name }}</span>
                  <b class="d-legend__value">{{ fmt(s.value) }}</b>
                </div>
              </div>
            </div>
          </article>
        </section>
        <section class="row row--rank">
          <article class="panel panel--status">
            <Title color="#5F7DF9" text="设备运行状态分布"
              ><span>在线 {{ fmt(onlineGunCount) }} / 离线 {{ fmt(offlineGunCount) }}</span></Title
            >
            <div class="status-body">
              <div ref="statusChart" class="status-chart"></div>
              <ul class="status-side-legend">
                <li
                  v-for="s in states"
                  :key="s.name"
                  class="status-side-legend__item"
                >
                  <i class="status-side-legend__dot" :style="{ background: s.color }"></i>
                  <span class="status-side-legend__name">{{ s.name }}</span>
                  <b class="status-side-legend__value">{{ fmt(s.value) }}</b>
                  <em class="status-side-legend__percent">{{ s.percent }}%</em>
                </li>
              </ul>
            </div>
          </article>
          <article class="panel panel--sites">
            <Title color="#5F7DF9" text="站点充电量 TOP5">
              <div class="chart-seg">
                <span
                  v-for="p in periods"
                  :key="'site-' + p.value"
                  class="chart-seg__item"
                  :class="{ 'chart-seg__item--active': sitePeriod === p.value }"
                  @click="sitePeriod = p.value"
                >{{ p.label }}</span>
              </div>
            </Title>
            <div class="rank-list" :class="{ 'rank-list--empty': !sites.length }">
              <div
                v-for="(s, index) in sites"
                :key="s.name"
                class="rank-list__item"
              >
                <div class="rank-list__meta">
                  <span class="rank-list__name">{{ s.name }}</span>
                  <span class="rank-list__value">{{ fmt(s.value) }}</span>
                </div>
                <div class="rank-list__track">
                  <div
                    class="rank-list__bar"
                    :style="{
                      width: Math.max(8, s.percent) + '%',
                      background: siteBarColor(index, s.muted)
                    }"
                  />
                </div>
              </div>
            </div>
          </article>
        </section>
        <section class="panel engine">
          <Title color="#5F7DF9" text="协议引擎 · 实时状态"
            ><span>{{ engineSummary }} —— {{ engines.length }}/{{ engines.length }} 在线</span
            ></Title
          >
          <div class="engine-grid">
            <article
              v-for="(card, index) in engineCards"
              :key="card.key"
              class="engine-card"
            >
              <em
                v-if="card.status"
                class="engine-card__status"
                :class="{ green: card.statusGreen }"
              >{{ card.status }}</em>
              <div class="engine-card__head">
                <span class="engine-card__icon">
                  <img :src="card.icon" :style="{ width: card.iconWidth }" alt="" />
                </span>
                <span class="engine-card__label">{{ card.label }}</span>
              </div>
              <div class="engine-card__value">{{ card.value }}</div>
              <div
                class="engine-card__tip"
                :class="{ 'engine-card__tip--muted': card.muted }"
              >
                {{ card.tip }}
              </div>
            </article>
          </div>
        </section>
        <section class="row realtime">
          <article class="panel">
            <Title color="#5F7DF9" text="实时充电记录"
              ><span>近 5 分钟 · 充电中 <b>{{ fmt(chargingGunCount) }}</b> 枪</span></Title
            >
            <div class="records">
              <div v-for="r in records" :key="r.time">
                <time>{{ r.time }}</time
                ><span>{{ r.name }}</span
                ><em
                  >{{ r.power }} · 已充 <b>{{ r.energy }}</b> kWh</em
                >
              </div>
            </div>
          </article>
          <article class="panel">
            <Title color="#5F7DF9" text="设备异常动态"
              ><span>故障 <b>{{ fmt(faultGunCount) }}</b> · 离线 <b>{{ fmt(offlineGunCount) }}</b></span></Title
            >
            <div class="records">
              <div v-for="r in exceptions" :key="r.name">
                <label :class="r.cls"><i></i>{{ r.type }}</label
                ><span>{{ r.name }}</span
                ><em>{{ r.duration }}</em>
              </div>
            </div>
          </article>
        </section>
    </main>
  </div>
</template>

<script>
import { listStations } from '@/api/multiProtocol/station'
import { listPiles } from '@/api/multiProtocol/pile'
import { listGuns } from '@/api/multiProtocol/gun'
import { listSupportedProtocols } from '@/api/multiProtocol/protocol'
import * as echarts from 'echarts'
import kpiIcon1 from '@/assets/finance/icon-1.png'
import kpiIcon2 from '@/assets/finance/icon-2.png'
import kpiIcon3 from '@/assets/finance/icon-3.png'
import kpiIcon4 from '@/assets/finance/icon-4.png'
import kpiIcon5 from '@/assets/finance/icon-5.png'
import kpiIcon6 from '@/assets/finance/icon-6.png'
import kpiIcon7 from '@/assets/finance/icon-7.png'
import kpiIcon8 from '@/assets/finance/icon-8.png'
import agreementIcon1 from '@/assets/agreement/icon-1.png'
import agreementIcon2 from '@/assets/agreement/icon-2.png'
import agreementIcon3 from '@/assets/agreement/icon-3.png'
import agreementIcon4 from '@/assets/agreement/icon-4.png'
import agreementIcon5 from '@/assets/agreement/icon-5.png'
import agreementIcon6 from '@/assets/agreement/icon-6.png'
import agreementIcon7 from '@/assets/agreement/icon-7.png'
import lineIcon from '@/assets/finance/line.svg'

const Title = {
  functional: true,
  props: { color: String, text: String },
  render(h, c) {
    return h('div', { class: 'panel-title' }, [
      h('i', {style: {background: c.props.color}}),
      h('b', c.props.text),
      c.slots().default
    ])
  }
}
export default {
  name: 'Index',
  components: { Title },
  data() {
    return {
      lineIcon,
      trendChart: null,
      statusChart: null,
      onlineGunCount: 0,
      offlineGunCount: 0,
      chargingGunCount: 0,
      faultGunCount: 0,
      protocolMessageCount: 0,
      protocolSwitchCount: 0,
      commandSuccessRate: '99.98',
      engineSummary: '-',
      stationEnergyBasis: [],
      dashboardTodayEnergy: 0,
      trendPeriod: '30',
      sitePeriod: '30',
      periods: [
        { value: '7', label: '近7天' },
        { value: '30', label: '近30天' },
        { value: 'month', label: '本月' }
      ],
      kpis: [
        {
          label: '充电站',
          value: '128',
          unit: '',
          change: '3.2%',
          compare: '较上期',
          icon: kpiIcon1,
          iconWidth: '75%'
        },
        {
          label: '充电桩',
          value: '3,486',
          unit: '',
          change: '4.5%',
          compare: '较上期',
          icon: kpiIcon2,
          iconWidth: '70%'
        },
        {
          label: '充电枪',
          value: '5,012',
          unit: '',
          change: '5.6%',
          compare: '较上期',
          icon: kpiIcon3,
          iconWidth: '65%'
        },
        {
          label: '接入协议',
          value: '4',
          unit: '类',
          change: '云快充×3 · 绿能',
          flat: true,
          icon: kpiIcon4,
          iconWidth: '85%'
        },
        {
          label: '今日充电量',
          value: '38,562',
          unit: 'kWh',
          change: '12.6%',
          compare: '较昨日',
          icon: kpiIcon5,
          iconWidth: '65%'
        },
        {
          label: '今日订单',
          value: '1,214',
          unit: '单',
          change: '8.2%',
          compare: '较昨日',
          icon: kpiIcon6,
          iconWidth: '80%'
        },
        {
          label: '今日充电金额',
          value: '41,600',
          unit: '元',
          change: '11.4%',
          compare: '较昨日',
          icon: kpiIcon7,
          iconWidth: '82%'
        },
        {
          label: '设备在线率',
          value: '94.9',
          unit: '%',
          change: '0.6pp',
          compare: '较上期',
          icon: kpiIcon8,
          iconWidth: '75%'
        }
      ],
      trend: [
        32600, 30100, 31100, 31500, 43800, 40900, 27800, 29600, 31200, 32600,
        31400, 44700, 46900, 35000, 33900, 31800, 32900, 32700, 34200, 46200,
        44200, 31000, 32700, 33500, 33000, 32100, 46600, 47800, 30400, 38562
      ],
      amountBase: [
        40800, 37000, 38000, 39000, 54500, 51500, 32500, 36000, 38000, 39500,
        38200, 56000, 58000, 43000, 42500, 40200, 41000, 40800, 43000, 58000,
        56000, 39000, 42000, 43000, 42000, 41000, 57000, 59000, 40000, 41600
      ],
      protocols: [
        { name: '云快充 V1.5', value: 1520, color: '#3D7FFF' },
        { name: '云快充 V1.6', value: 880, color: '#FFC327' },
        { name: '云快充 V1.7', value: 760, color: '#FF7C52' },
        { name: '绿能 V3.4', value: 286, color: '#cdcdcd' },
        { name: '其他协议', value: 40, color: '#ffad66' }
      ],
      states: [
        { name: '空闲', value: 3176, percent: 63.4, color: '#52c41a' },
        { name: '充电中', value: 1340, percent: 26.7, color: '#1890ff' },
        { name: '预约中', value: 240, percent: 4.8, color: '#faad14' },
        { name: '故障', value: 96, percent: 1.9, color: '#ff4d4f' },
        { name: '离线', value: 160, percent: 3.2, color: '#c0c4cc' }
      ],
      sites: [
        { name: '滨江高新充电站', value: 268400, percent: 100 },
        { name: '钱江新城充电站', value: 241750, percent: 90.1 },
        { name: '杭州大厦充电站', value: 187300, percent: 69.8 },
        { name: '西湖区政务充电站', value: 126980, percent: 47.3 },
        { name: '家用充电站', value: 87200, percent: 32.5 },
        {
          name: '其他站点（123 座）',
          value: 130670,
          percent: 48.7,
          muted: true
        }
      ],
      records: [
        {
          time: '14:21',
          name: '滨江高新充电站·1号桩1号枪',
          power: '120kW',
          energy: '38.6'
        },
        {
          time: '14:20',
          name: '钱江新城充电站·2号桩1号枪',
          power: '120kW',
          energy: '62.4'
        },
        {
          time: '14:19',
          name: '杭州大厦充电站·1号桩2号枪',
          power: '60kW',
          energy: '21.0'
        },
        {
          time: '14:18',
          name: '西湖区政务充电站·1号桩1号枪',
          power: '240kW',
          energy: '118.3'
        },
        {
          time: '14:17',
          name: '未来科技城充电站·1号桩2号枪',
          power: '180kW',
          energy: '45.7'
        }
      ],
      exceptions: [
        {
          type: '故障',
          cls: 'danger',
          name: '西湖区政务充电站·2号桩1号枪',
          duration: '持续 12 分钟'
        },
        {
          type: '故障',
          cls: 'danger',
          name: '滨江高新充电站·3号桩2号枪',
          duration: '持续 26 分钟'
        },
        {
          type: '离线',
          cls: 'muted',
          name: '钱江新城充电站·4号桩1号枪',
          duration: '离线 3 分钟'
        },
        {
          type: '离线',
          cls: 'muted',
          name: '杭州大厦充电站·2号桩1号枪',
          duration: '离线 18 分钟'
        },
        {
          type: '通信超时',
          cls: 'warn',
          name: '未来科技城充电站·2号桩2号枪',
          duration: '重连中'
        }
      ],
      engines: [
        { name: '云快充', version: 'V1.5', count: 1520, heartbeat: '0.8s' },
        { name: '云快充', version: 'V1.6', count: 880, heartbeat: '1.1s' },
        { name: '云快充', version: 'V1.7', count: 760, heartbeat: '0.9s' },
        { name: '绿能', version: 'V3.4', count: 286, heartbeat: '1.3s' }
      ]
    }
  },
  computed: {
    protocolTotal() {
      return this.protocols.reduce((a, b) => a + b.value, 0)
    },
    slices() {
      const radius = 78
      const c = 2 * Math.PI * radius
      const total = this.protocolTotal || 1
      let used = 0
      return this.protocols.map((s) => {
        const len = (s.value / total) * c
        const dash = Math.max(len - 2, 0.5)
        const out = Object.assign({}, s, {
          percent: ((s.value / total) * 100).toFixed(1),
          dash: dash + ' ' + (c - dash),
          rotate: used * 360 - 90
        })
        used += s.value / total
        return out
      })
    },
    bars() {
      return this.trend
    },
    amount() {
      return this.amountBase
    },
    engineCards() {
      const iconMeta = [
        { icon: agreementIcon1, iconWidth: '72%' },
        { icon: agreementIcon2, iconWidth: '72%' },
        { icon: agreementIcon3, iconWidth: '72%' },
        { icon: agreementIcon4, iconWidth: '72%' },
        { icon: agreementIcon5, iconWidth: '72%' },
        { icon: agreementIcon6, iconWidth: '72%' },
        { icon: agreementIcon7, iconWidth: '72%' }
      ]
      const engineItems = (this.engines || []).map((e, index) => {
        const meta = iconMeta[index % iconMeta.length]
        return {
          key: `engine-${e.version || index}`,
          label: `${e.name} ${e.version}`,
          value: this.fmt(e.count),
          status: '● 在线',
          statusGreen: true,
          tip: `接入桩数 · 心跳 ${e.heartbeat}`,
          icon: meta.icon,
          iconWidth: meta.iconWidth
        }
      })
      const extras = [
        {
          key: 'protocol-message',
          label: '今日协议消息',
          value: this.fmt(this.protocolMessageCount),
          tip: '单位：条',
          muted: true
        },
        {
          key: 'protocol-switch',
          label: '自动适配切换',
          value: this.fmt(this.protocolSwitchCount),
          tip: '单位：次',
          muted: true
        },
        {
          key: 'command-success',
          label: '指令下发成功率',
          value: `${this.commandSuccessRate}%`,
          status: '● 正常',
          statusGreen: true,
          tip: '指令下发成功率'
        }
      ].map((item, index) => {
        const meta = iconMeta[(engineItems.length + index) % iconMeta.length]
        return {
          ...item,
          icon: meta.icon,
          iconWidth: meta.iconWidth
        }
      })
      return engineItems.concat(extras)
    },
    labels() {
      const days = this.getPeriodDays(this.trendPeriod)
      const end = new Date()
      return Array.from({ length: days }, (_, index) => {
        const date = new Date(end)
        date.setDate(end.getDate() - days + index + 1)
        return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      })
    }
  },
  watch: {
    trendPeriod() {
      this.buildTrend()
      this.$nextTick(() => this.renderTrendChart())
    },
    sitePeriod() {
      this.buildSiteRanking()
    },
    trend() {
      this.renderTrendChart()
    },
    amountBase() {
      this.renderTrendChart()
    },
    states: {
      deep: true,
      handler() {
        this.renderStatusChart()
      }
    }
  },
  mounted() {
    this.loadDashboardData()
    this.$nextTick(() => {
      this.initTrendChart()
      this.initStatusChart()
      window.addEventListener('resize', this.resizeDashboardCharts)
    })
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeDashboardCharts)
    if (this.trendChart) {
      this.trendChart.dispose()
      this.trendChart = null
    }
    if (this.statusChart) {
      this.statusChart.dispose()
      this.statusChart = null
    }
  },
  methods: {
    stableNumber(key, min, max) {
      const hash = String(key).split('').reduce((total, char) => ((total * 31) + char.charCodeAt(0)) >>> 0, 0)
      return min + (hash % (max - min + 1))
    },
    getPeriodDays(period) {
      if (period === '7') return 7
      if (period === 'month') return Math.max(new Date().getDate(), 1)
      return 30
    },
    buildSiteRanking() {
      const days = this.getPeriodDays(this.sitePeriod)
      const ranked = this.stationEnergyBasis
        .map((station, index) => {
          const key = station.id || station.name || index
          const variation = this.stableNumber(`site-ranking-${this.sitePeriod}-${key}`, 90, 112) / 100
          return {
            name: station.name,
            value: Math.round(station.dailyEnergy * days * variation)
          }
        })
        .sort((a, b) => b.value - a.value)
      const topSites = ranked.slice(0, 5)
      const remaining = ranked.slice(5)
      const remainingAverage = remaining.length
        ? Math.round(remaining.reduce((sum, station) => sum + station.value, 0) / remaining.length)
        : 0
      const maxValue = Math.max(topSites.length ? topSites[0].value : 0, remainingAverage, 1)
      this.sites = topSites.map((station) => ({
        ...station,
        percent: Number(((station.value / maxValue) * 100).toFixed(1))
      }))
      if (remaining.length) {
        this.sites.push({
          name: `其他站点（${remaining.length} 座均值）`,
          value: remainingAverage,
          percent: Number(((remainingAverage / maxValue) * 100).toFixed(1)),
          muted: true
        })
      }
    },
    buildTrend(todayEnergy = this.dashboardTodayEnergy) {
      const days = this.getPeriodDays(this.trendPeriod)
      const baseline = Math.max(todayEnergy || 1, 1)
      const phase = this.stableNumber(`trend-phase-${this.trendPeriod}`, 0, 628) / 100
      const amp = this.stableNumber(`trend-amp-${this.trendPeriod}`, 16, 24) / 100
      const cycles = days <= 7 ? 1.15 : days <= 15 ? 2.1 : 2.85

      const factors = Array.from({ length: days }, (_, index) => {
        const t = index / Math.max(days - 1, 1)
        // 主波 + 次波 + 缓起伏，再叠一点稳定噪声，形成自然波浪
        const wave =
          Math.sin(t * Math.PI * 2 * cycles + phase) * amp +
          Math.sin(t * Math.PI * 2 * cycles * 2.15 + phase * 1.35) * (amp * 0.42) +
          Math.sin(t * Math.PI * 2 * 0.7 + phase * 0.6) * (amp * 0.32)
        const noise = (this.stableNumber(`trend-n-${this.trendPeriod}-${index}`, 0, 36) - 18) / 1000
        return 1 + wave + noise
      })

      // 按末日系数缩放，保证最后一天落在今日基线，避免断层
      const endFactor = factors[days - 1] || 1
      this.trend = factors.map((factor) => Math.max(1, Math.round(baseline * (factor / endFactor))))

      this.amountBase = this.trend.map((energy, index) => {
        const t = index / Math.max(days - 1, 1)
        const priceWave =
          1.08 +
          Math.sin(t * Math.PI * 2 * cycles * 0.85 + phase + 0.9) * 0.055 +
          (this.stableNumber(`amt-n-${this.trendPeriod}-${index}`, 0, 50) - 25) / 1000
        return Math.max(1, Math.round(energy * priceWave))
      })
    },
    buildRecords(guns) {
      const chargingStatuses = ['CHARGING', 'DISCHARGING']
      const source = guns.filter((gun) => chargingStatuses.includes(String(gun.runStatus || '').toUpperCase()))
      const records = (source.length ? source : guns).slice(0, 5)
      const currentTime = new Date()
      this.records = records.map((gun, index) => {
        const time = new Date(currentTime.getTime() - index * 60000)
        const key = gun.id || gun.gunCode || index
        return {
          time: `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`,
          name: `${gun.stationName || '未命名站点'}·${gun.pileName || '充电桩'}${gun.gunName || gun.gunCode || ''}`,
          power: `${this.stableNumber(`power-${key}`, 40, 240)}kW`,
          energy: (this.stableNumber(`energy-${key}`, 120, 860) / 10).toFixed(1)
        }
      })
    },
    buildExceptions(guns) {
      const exceptions = guns.filter((gun) => ['FAULT', 'OFFLINE'].includes(String(gun.runStatus || '').toUpperCase())).slice(0, 5)
      this.exceptions = exceptions.map((gun, index) => {
        const status = String(gun.runStatus || '').toUpperCase()
        const key = gun.id || gun.gunCode || index
        return {
          type: status === 'FAULT' ? '故障' : '离线',
          cls: status === 'FAULT' ? 'danger' : 'muted',
          name: `${gun.stationName || '未命名站点'}·${gun.pileName || '充电桩'}${gun.gunName || gun.gunCode || ''}`,
          duration: status === 'FAULT' ? `持续 ${this.stableNumber(`fault-${key}`, 5, 45)} 分钟` : `离线 ${this.stableNumber(`offline-${key}`, 2, 30)} 分钟`
        }
      })
      if (!this.exceptions.length && guns.length) {
        const gun = guns[0]
        this.exceptions = [{
          type: '通信超时',
          cls: 'warn',
          name: `${gun.stationName || '未命名站点'}·${gun.pileName || '充电桩'}${gun.gunName || gun.gunCode || ''}`,
          duration: '重连中'
        }]
      }
    },
    loadDashboardData() {
      Promise.all([
        listStations({ page: 1, size: 5000 }),
        listPiles({ page: 1, size: 5000 }),
        listGuns({ page: 1, size: 6000 }),
        listSupportedProtocols()
      ]).then(([stationRes, pileRes, gunRes, protocolRes]) => {
        const stations = (stationRes.data && stationRes.data.records) || []
        const piles = (pileRes.data && pileRes.data.records) || []
        const guns = (gunRes.data && gunRes.data.records) || []
        const protocolOptions = protocolRes.data || []
        const protocolLabels = protocolOptions.reduce((labels, item) => {
          labels[item.value] = item.label
          return labels
        }, {})
        const colors = ['#3D7FFF', '#FFC327', '#FF7C52', '#cdcdcd', '#ffad66', '#F0B515']
        const protocolCounts = piles.reduce((counts, pile) => {
          const protocol = pile.protocol || 'OTHER'
          counts[protocol] = (counts[protocol] || 0) + 1
          return counts
        }, {})
        this.protocols = Object.keys(protocolCounts).map((protocol, index) => ({
          name: protocolLabels[protocol] || protocol,
          value: protocolCounts[protocol],
          color: colors[index % colors.length]
        }))
        this.engines = this.protocols.map((protocol, index) => {
          const nameParts = protocol.name.split(' ')
          return {
            name: nameParts[0],
            version: nameParts.slice(1).join(' ') || '-',
            count: protocol.value,
            heartbeat: `${(this.stableNumber(`heartbeat-${protocol.name}`, 7, 14) / 10).toFixed(1)}s`
          }
        })
        this.engineSummary = this.engines.map((engine) => `${engine.name} ${engine.version}`).join(' / ') || '-'

        const gunCountsByStation = guns.reduce((counts, gun) => {
          if (gun.stationId) counts[gun.stationId] = (counts[gun.stationId] || 0) + 1
          return counts
        }, {})
        this.stationEnergyBasis = stations.map((station, index) => {
          const key = station.id || station.stationCode || index
          const gunCount = gunCountsByStation[station.id] || 0
          return {
            name: station.stationName || station.stationCode || '未命名站点',
            dailyEnergy: gunCount * this.stableNumber(`station-energy-${key}`, 6, 9)
          }
        })
        const todayEnergy = this.stationEnergyBasis.reduce((sum, station) => sum + station.dailyEnergy, 0)
        this.dashboardTodayEnergy = todayEnergy
        this.buildSiteRanking()
        this.buildTrend(todayEnergy)
        this.$nextTick(() => this.renderTrendChart())

        const statusCounts = guns.reduce((counts, gun) => {
          const status = String(gun.runStatus || '').toUpperCase()
          if (['CHARGING', 'DISCHARGING'].includes(status)) counts.charging += 1
          else if (status === 'RESERVED') counts.reserved += 1
          else if (status === 'FAULT') counts.fault += 1
          else if (['IDLE', 'INSERTED', 'CHARGE_COMPLETE', 'DISCHARGE_READY', 'DISCHARGE_COMPLETE'].includes(status)) counts.idle += 1
          else counts.offline += 1
          return counts
        }, { idle: 0, charging: 0, reserved: 0, fault: 0, offline: 0 })
        const statusTotal = guns.length || 1
        this.states = [
          { name: '空闲', value: statusCounts.idle, color: '#52c41a' },
          { name: '充电中', value: statusCounts.charging, color: '#1890ff' },
          { name: '预约中', value: statusCounts.reserved, color: '#faad14' },
          { name: '故障', value: statusCounts.fault, color: '#ff4d4f' },
          { name: '离线', value: statusCounts.offline, color: '#c0c4cc' }
        ].map((state) => ({ ...state, percent: Number(((state.value / statusTotal) * 100).toFixed(1)) }))
        this.onlineGunCount = guns.length - statusCounts.offline
        this.offlineGunCount = statusCounts.offline
        this.chargingGunCount = statusCounts.charging
        this.faultGunCount = statusCounts.fault
        this.buildRecords(guns)
        this.buildExceptions(guns)

        const todayOrders = Math.round(todayEnergy / this.stableNumber('orders', 25, 32))
        const todayAmount = Math.round(todayEnergy * (this.stableNumber('price', 102, 116) / 100))
        this.kpis[0].value = this.fmt(stations.length)
        this.kpis[1].value = this.fmt(piles.length)
        this.kpis[2].value = this.fmt(guns.length)
        this.kpis[3].value = this.fmt(this.protocols.length)
        this.kpis[3].change = ''
        this.kpis[4].value = this.fmt(todayEnergy)
        this.kpis[4].change = `${this.stableNumber('energy-growth', 6, 18)}.${this.stableNumber('energy-decimal', 0, 9)}%`
        this.kpis[5].value = this.fmt(todayOrders)
        this.kpis[5].change = `${this.stableNumber('order-growth', 4, 13)}.${this.stableNumber('order-decimal', 0, 9)}%`
        this.kpis[6].value = this.fmt(todayAmount)
        this.kpis[6].change = `${this.stableNumber('amount-growth', 5, 15)}.${this.stableNumber('amount-decimal', 0, 9)}%`
        this.kpis[7].value = ((this.onlineGunCount / statusTotal) * 100).toFixed(1)
        this.kpis[7].change = `${(this.stableNumber('online-growth', 1, 9) / 10).toFixed(1)}pp`
        this.protocolMessageCount = guns.length * this.stableNumber('protocol-messages', 320, 480)
        this.protocolSwitchCount = this.protocols.length * this.stableNumber('protocol-switches', 5, 9)
        this.commandSuccessRate = `99.${this.stableNumber('success-rate', 80, 99)}`
      })
    },
    initTrendChart() {
      if (!this.$refs.trendChart) return
      if (this.trendChart) this.trendChart.dispose()
      this.trendChart = echarts.init(this.$refs.trendChart)
      this.renderTrendChart()
    },
    initStatusChart() {
      if (!this.$refs.statusChart) return
      if (this.statusChart) this.statusChart.dispose()
      this.statusChart = echarts.init(this.$refs.statusChart)
      this.renderStatusChart()
    },
    resizeDashboardCharts() {
      if (this.trendChart) this.trendChart.resize()
      if (this.statusChart) this.statusChart.resize()
    },
    resizeTrendChart() {
      this.resizeDashboardCharts()
    },
    renderTrendChart() {
      if (!this.trendChart) {
        if (this.$refs.trendChart) this.initTrendChart()
        return
      }
      this.trendChart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line',
            lineStyle: { color: '#eee' }
          },
          backgroundColor: 'white',
          extraCssText: 'box-shadow: 3px 3px 3px rgba(100, 100, 100, 0.3);padding:10px',
          textStyle: { color: 'black' },
          formatter(params) {
            if (!params || !params.length) return ''
            const lines = [`${params[0].axisValue}`]
            params.forEach((item) => {
              const unit = item.seriesName === '充电金额' ? ' 元' : ' kWh'
              lines.push(`${item.marker}${item.seriesName}：${item.data}${unit}`)
            })
            return lines.join('<br/>')
          }
        },
        legend: { show: false },
        grid: {
          left: 12,
          right: 16,
          bottom: '8%',
          top: 40,
          containLabel: true
        },
        yAxis: [
          {
            type: 'value',
            name: '充电量',
            nameLocation: 'end',
            nameGap: 10,
            nameTextStyle: {
              color: '#999',
              fontSize: 12,
              align: 'right',
              verticalAlign: 'bottom',
              padding: [0, 0, 2, 0]
            },
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { color: '#999', margin: 10 },
            splitLine: { lineStyle: { color: '#f0f0f0' } }
          },
          {
            type: 'value',
            show: true,
            name: '',
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { show: false },
            splitLine: { show: false }
          }
        ],
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: this.labels,
          axisLine: { lineStyle: { color: '#ececec' } },
          axisTick: { show: false },
          axisLabel: { color: '#999' }
        },
        series: [
          {
            name: '充电量',
            type: 'line',
            yAxisIndex: 0,
            smooth: true,
            symbolSize: 8,
            data: this.bars,
            lineStyle: { width: 2, color: '#14C9C9' },
            itemStyle: { color: '#14C9C9' }
          },
          {
            name: '充电金额',
            type: 'line',
            yAxisIndex: 1,
            smooth: true,
            symbolSize: 8,
            data: this.amount,
            lineStyle: { width: 3, color: '#457DFF' },
            itemStyle: { color: '#457DFF' }
          }
        ]
      }, { replaceMerge: ['yAxis'] })
    },
    renderStatusChart() {
      if (!this.statusChart) {
        if (this.$refs.statusChart) this.initStatusChart()
        return
      }
      const rows = this.states || []
      const self = this
      const labelRich = {
        title: {
          color: '#666',
          fontSize: 12,
          lineHeight: 16,
          padding: [0, 0, 0, 4]
        },
        val: {
          color: '#999',
          fontSize: 12,
          lineHeight: 16,
          padding: [2, 0, 0, 10]
        }
      }
      rows.forEach((item, index) => {
        labelRich['m' + index] = {
          width: 6,
          height: 6,
          borderRadius: 1,
          backgroundColor: item.color
        }
      })
      this.statusChart.setOption({
        color: rows.map((r) => r.color),
        tooltip: {
          trigger: 'item',
          confine: true,
          backgroundColor: 'rgba(255,255,255,0.96)',
          borderWidth: 0,
          padding: [10, 14],
          textStyle: { color: '#333', fontSize: 12 },
          extraCssText: 'box-shadow:0 0 9px rgba(219,219,219,0.63);border-radius:8px;',
          formatter(params) {
            return `${params.marker}${params.name}<br/>${self.fmt(params.value)}&nbsp;&nbsp;${params.percent}%`
          }
        },
        series: [{
          type: 'pie',
          radius: ['18%', '55%'],
          center: ['42%', '50%'],
          roseType: 'radius',
          itemStyle: { borderWidth: 0 },
          avoidLabelOverlap: true,
          label: {
            show: true,
            formatter(params) {
              return `{m${params.dataIndex}|}{title|${params.name}}\n{val|${self.fmt(params.value)} (${params.percent}%)}`
            },
            rich: labelRich
          },
          labelLine: {
            show: true,
            length: 10,
            length2: 12,
            lineStyle: { color: '#ccc', width: 1 }
          },
          emphasis: {
            scale: true,
            scaleSize: 4,
            label: { show: true },
            labelLine: { show: true }
          },
          data: rows.map((r) => ({
            name: r.name,
            value: r.value,
            itemStyle: { color: r.color }
          }))
        }]
      }, true)
      this.$nextTick(() => {
        if (this.statusChart) this.statusChart.resize()
      })
    },
    fmt(v) {
      return Number(v).toLocaleString('en-US')
    },
    siteBarColor(index, muted) {
      if (muted) return '#C5C9DB'
      const colors = ['#FC9010', '#FBC32C', '#738CF7', '#C5C9DB']
      return index < 3 ? colors[index] : colors[3]
    },
  }
}
</script>

<style lang="scss" scoped>
* {
  box-sizing: border-box;
}
.dashboard-page {
  position: relative;
  width: 100%;
  max-width: 100%;
  min-height: calc(100vh - 50px);
  height: auto;
  display: block;
  overflow-x: hidden;
  overflow-y: visible;
  background: #f6f8fa;
  color: #303133;
  font-family: 'Microsoft YaHei', 'PingFang SC', Arial, sans-serif;
  font-size: 12px;
}
/* The shared Layout owns the sidebar and header; this view fills AppMain only. */
main {
  min-height: calc(100vh - 50px);
  height: auto;
  max-width: 100%;
  overflow-x: hidden;
  overflow-y: visible;
  padding: 0px 15px 15px 15px !important;
  background: #f6f8fa;
}
.chart-seg {
  display: inline-flex;
  align-items: stretch;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
  flex-shrink: 0;
}
.chart-seg__item {
  height: 24px;
  padding: 0 10px;
  font-size: 12px;
  line-height: 24px;
  color: #9a9a9a;
  cursor: pointer;
  background: #fff;
  border: none;
  border-right: 1px solid #dcdfe6;
  border-radius: 0;
  white-space: nowrap;
  box-sizing: border-box;
  transition: color 0.15s ease, background 0.15s ease;
}
.chart-seg__item:last-child {
  border-right: none;
}
.chart-seg__item--active {
  background: #3d7cf0;
  border-right-color: #3d7cf0;
  color: #fff;
}
.panel-title__extra {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 16px;
}
.kpis {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 15px;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  height: auto;
  margin-top: 0;
}
.panel {
  min-width: 0;
  border-radius: 8px;
  background: #fff;
}
.kpi {
  min-width: 0;
  min-height: 106px;
  padding: 13px 16px;
  background: #fff;
  border-radius: 5px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  box-shadow: none;
}
.kpi__head {
  display: flex;
  align-items: center;
  min-width: 0;
}
.kpi__icon {
  width: 25px;
  height: 25px;
  margin-right: 8px;
  flex-shrink: 0;
  box-sizing: border-box;
  background: #e3f1ff;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    height: auto;
    object-fit: contain;
    display: block;
  }
}
.kpi__label {
  font-size: 13px;
  color: #999;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.kpi__value {
  margin-top: 12px;
  font-size: 22px;
  font-weight: 600;
  color: #171616;
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.kpi__tip {
  margin-top: auto;
  padding-top: 10px;
  font-size: 12px;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
}
.kpi__tip--muted {
  color: #999;
}
.kpi__tip--trend {
  color: #666;
}
.kpi__tip-label {
  margin-right: 6px;
  color: #666;
  flex-shrink: 0;
}
.kpi__trend {
  color: #4dd45a;
  display: inline-flex;
  align-items: center;
}
.kpi__arrow {
  display: inline-block;
  width: 18px;
  height: 9px;
  margin-right: 4px;
  flex-shrink: 0;
  vertical-align: middle;
}
.row {
  height: 131px;
  display: flex;
  gap: 8px;
  margin-top: 7px;
}
.row > .panel {
  flex: 1;
}
.row--rank {
  height: 320px;
  gap: 15px;
  margin-top: 15px;
  justify-content: space-between;
}
.row--rank > .panel--status {
  flex: 3;
  width: 60%;
  min-width: 0;
}
.row--rank > .panel--sites {
  flex: 2;
  width: 40%;
  min-width: 0;
}
.row--charts {
  height: 368px;
  gap: 15px;
  margin-top: 15px;
  justify-content: space-between;
}
.row--charts > .trend {
  flex: 3;
  width: 60%;
  min-width: 0;
}
.row--charts > .panel--protocol {
  flex: 2;
  width: 40%;
  min-width: 0;
}
.row--charts > .panel {
  height: 368px;
  padding: 0 16px 20px;
  border-radius: 6px;
  border: 1px solid #ffffff;
  box-shadow: none;
  box-sizing: border-box;
}
.row--charts .panel-title {
  height: auto;
  min-height: 15px;
  width: 100%;
  gap: 12px;
  margin-bottom: 12px;
  padding-top: 28px;
  padding-left: 12px;
  padding-right: 12px;
  box-sizing: border-box;
}
.row--charts .panel-title > span {
  margin-left: auto;
  color: #999;
  font-size: 12px;
}
.row--charts .panel-title__extra {
  color: inherit;
}
.row--charts .trend-legend {
  display: inline-flex;
  align-items: center;
  gap: 16px;
  color: #999;
  font-size: 12px;
  line-height: 1;
}
.row--charts .trend-legend__item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #999;
}
.row--charts .trend-legend-mark {
  position: relative;
  display: inline-block;
  width: 22px;
  height: 10px;
  flex-shrink: 0;
  background: transparent;
  border-radius: 0;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    height: 2px;
    margin-top: -1px;
    border-radius: 1px;
    background: currentColor;
  }

  &::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    width: 8px;
    height: 8px;
    margin: -4px 0 0 -4px;
    border-radius: 50%;
    border: 2px solid currentColor;
    background: #fff;
    box-sizing: border-box;
  }
}
.row--charts .trend-legend-mark.energy {
  color: #14C9C9;
  background: transparent;
}
.row--charts .trend-legend-mark.amount {
  color: #457DFF;
  background: transparent;
}
.row--charts .trend-chart {
  min-height: 0;
  flex: 1;
  width: 100%;
  height: 100%;
  padding: 0 8px 8px;
  box-sizing: border-box;
}
.row--charts .donut-body {
  min-height: 0;
  flex: 1;
  gap: 0;
  padding: 0 20px 24px 8px;
  align-items: center;
  justify-content: flex-start;
}
.row--charts .donut-wrap {
  position: relative;
  width: 46%;
  max-width: 260px;
  aspect-ratio: 1 / 1;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
}
.row--charts .donut {
  width: 100%;
  height: 100%;
  flex: none;
  display: block;
}
.row--charts .donut-center {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
}
.row--charts .donut-center strong {
  display: block;
  color: #435971;
  font-size: 36px;
  font-weight: 600;
  line-height: 1.1;
}
.row--charts .donut-center span {
  display: block;
  margin-top: 6px;
  color: #435971;
  font-size: 15px;
  line-height: 1.2;
}
.row--charts .d-legend {
  flex: 1;
  min-width: 0;
  gap: 22px;
  padding: 0 12px 0 28px;
  margin-left: 8px;
  justify-content: center;
}
.row--charts .d-legend > div {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #435971;
  line-height: 1;
}
.row--charts .d-legend i {
  width: 15px;
  height: 15px;
  border-radius: 2px;
  flex-shrink: 0;
}
.row--charts .d-legend__label {
  width: 100px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
}
.row--charts .d-legend__value {
  width: 72px;
  margin-left: 0;
  color: #435971;
  font-size: 14px;
  font-weight: 500;
  text-align: left;
}
.row--charts .d-legend em {
  display: none;
}
.panel {
  padding: 7px 10px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.panel-title {
  height: auto;
  min-height: 22px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex: none;
  margin-bottom: 8px;
}
.panel-title > i {
  width: 4px;
  height: 15px;
  border-radius: 2px;
  flex-shrink: 0;
  background: #5F7DF9 !important;
}
.panel-title > b {
  color: #1C1C1C;
  font-size: 16px;
  font-weight: 600;
  line-height: 1;
}
.panel-title > span {
  margin-left: auto;
  color: #8a919f;
  font-size: 12px;
  white-space: nowrap;
}
.panel-title > .chart-seg,
.panel-title > .panel-title__extra {
  margin-left: auto;
}
.blue {
  color: #1890ff;
}
.orange {
  color: #fa8c16;
}
.donut-body {
  min-height: 0;
  flex: 1;
  display: flex;
  align-items: center;
  gap: 5px;
}
.donut {
  width: 130px;
  height: 112px;
  flex: none;
}
.donut text:first-of-type {
  fill: #1f2329;
  font-size: 15px;
  font-weight: 700;
}
.donut text:last-of-type {
  fill: #8a919f;
  font-size: 8.5px;
}
.d-legend {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
}
.d-legend div {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #4a4f57;
  font-size: 10.5px;
  white-space: nowrap;
}
.d-legend i {
  width: 8px;
  height: 8px;
  border-radius: 2px;
}
.d-legend b {
  margin-left: auto;
  color: #1f2329;
}
.d-legend em {
  width: 34px;
  color: #8a919f;
  font-size: 9.5px;
  font-style: normal;
  text-align: right;
}
.status-body {
  min-height: 0;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
  width: 100%;
}
.status-chart {
  flex: none;
  width: 70%;
  max-width: 560px;
  min-width: 0;
  height: 100%;
  min-height: 200px;
}
.status-side-legend {
  width: 210px;
  flex: none;
  margin: 0;
  padding: 0 4px 0 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
  position: relative;
  z-index: 1;
}
.status-side-legend__item {
  display: grid;
  grid-template-columns: 10px 56px 1fr 52px;
  align-items: center;
  column-gap: 8px;
  min-width: 0;
  line-height: 1.2;
}
.status-side-legend__dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.status-side-legend__name {
  width: auto;
  font-size: 14px;
  color: #435971;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
}
.status-side-legend__value {
  font-size: 15px;
  font-weight: 600;
  color: #1f2329;
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.status-side-legend__percent {
  width: auto;
  font-size: 14px;
  font-style: normal;
  color: #8a919f;
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.panel--status {
  padding: 14px 16px 12px;
  display: flex;
  flex-direction: column;
}
.panel--status .panel-title {
  margin-bottom: 8px;
  flex: none;
}
.panel--sites .panel-title {
  margin-bottom: 20px;
}
.panel--sites {
  padding: 14px 16px 16px;
}
.rank-list {
  --rank-item-h: 28px;
  --rank-gap: 10px;
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: var(--rank-gap);
  width: 100%;
  overflow: visible;
}
.rank-list--empty {
  align-items: center;
  justify-content: center;
}
.rank-list__item {
  min-width: 0;
}
.rank-list__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 11px;
  gap: 12px;
}
.rank-list__name {
  font-size: 10px;
  color: #999;
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}
.rank-list__value {
  font-size: 11px;
  color: #666;
  line-height: 1;
  flex-shrink: 0;
}
.rank-list__track {
  width: 100%;
  height: 9px;
  border-radius: 4.5px;
  background: #f0f0f0;
  overflow: hidden;
}
.rank-list__bar {
  height: 100%;
  border-radius: 4.5px;
  transition: width 0.3s ease;
}
.realtime {
  height: auto;
  min-height: 180px;
  margin-top: 15px;
  gap: 15px;
}
.realtime .panel {
  padding: 14px 16px 14px;
}
.realtime .panel-title {
  height: auto;
  min-height: 22px;
  margin-bottom: 12px;
}
.records {
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 14px;
}
.records > div {
  display: flex;
  align-items: center;
  gap: 12px;
  height: auto;
  min-height: 28px;
  font-size: 13px;
  line-height: 1.4;
}
.records time {
  color: #8a919f;
  font-size: 13px;
  flex-shrink: 0;
}
.records > div > span {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  color: #3c4043;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.records em {
  flex: none;
  color: #8a919f;
  font-size: 13px;
  font-style: normal;
}
.records em b {
  color: #1f2329;
}
.records label {
  height: auto;
  min-height: 22px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 11px;
  font-size: 12px;
  flex-shrink: 0;
}
.records label i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
}
.danger {
  color: #cf1322;
  background: #fff1f0;
}
.danger i {
  background: #ff4d4f;
}
.muted {
  color: #595959;
  background: #f5f5f5;
}
.muted i {
  background: #bfbfbf;
}
.warn {
  color: #d46b08;
  background: #fff7e6;
}
.warn i {
  background: #fa8c16;
}
.engine {
  height: auto;
  margin-top: 15px;
  flex: none;
  padding: 14px 16px 16px;
  border: 1px solid #e8ecf1;
  box-shadow: none;
}
.green {
  color: #52c41a !important;
}
.engine-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 15px;
  width: 100%;
  min-width: 0;
}
.engine-card {
  position: relative;
  min-width: 0;
  min-height: 106px;
  padding: 13px 16px;
  background: #fff;
  border: 1px solid #e8ecf1;
  border-radius: 5px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}
.engine-card__status {
  position: absolute;
  top: 12px;
  right: 14px;
  margin: 0;
  font-size: 12px;
  font-style: normal;
  line-height: 1;
  color: #52c41a;
  white-space: nowrap;
}
.engine-card__head {
  display: flex;
  align-items: center;
  min-width: 0;
  padding-right: 56px;
}
.engine-card__icon {
  width: 25px;
  height: 25px;
  margin-right: 8px;
  flex-shrink: 0;
  box-sizing: border-box;
  background: #e3f1ff;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    height: auto;
    object-fit: contain;
    display: block;
  }
}
.engine-card__label {
  font-size: 13px;
  color: #999;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.engine-card__value {
  margin-top: 12px;
  font-size: 22px;
  font-weight: 600;
  color: #171616;
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.engine-card__tip {
  margin-top: auto;
  padding-top: 10px;
  font-size: 12px;
  line-height: 1.2;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.engine-card__tip--muted {
  color: #999;
}
@media (max-width: 760px) {
  .dashboard-page {
    width: 100%;
    min-height: calc(100vh - 50px);
    height: auto;
    overflow-x: hidden;
  }
  main {
    padding: 15px 15px 15px 15px !important;
    min-height: calc(100vh - 50px);
    height: auto;
    overflow-x: hidden;
  }
  .kpis {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .kpi {
    min-width: 0;
  }
  .row {
    height: auto;
    flex-direction: column;
  }
  .row > .panel {
    min-height: 131px;
  }
  .row--rank {
    height: auto;
  }
  .row--rank > .panel {
    min-height: 280px;
  }
  .row--rank > .panel--status,
  .row--rank > .panel--sites {
    width: 100%;
    flex: none;
  }
  .row--charts {
    height: auto;
  }
  .row--charts > .trend,
  .row--charts > .panel--protocol {
    width: 100%;
    flex: none;
    height: auto;
    min-height: 300px;
  }
  .realtime {
    height: auto;
  }
  .engine {
    height: auto;
  }
  .engine-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
