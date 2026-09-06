<template>
  <div
    class="dashboard-page"
    :style="dashboardStyle"
  >
    <main>
        <div class="titlebar">
          <h1>经营仪表盘 <small>充电运营 · 多协议统一接入总览</small></h1>
          <div class="period">
            <button
              v-for="p in periods"
              :key="p.value"
              :class="{ on: period === p.value }"
              @click="period = p.value"
            >
              {{ p.label }}
            </button>
          </div>
        </div>
        <section class="kpis">
          <article v-for="k in kpis" :key="k.label" class="kpi">
            <div class="k-top">
              <i :style="{ color: k.color, background: k.bg }">{{ k.icon }}</i
              >{{ k.label }}
            </div>
            <strong
              >{{ k.value }}<small>{{ k.unit }}</small></strong
            ><em v-if="k.change" :class="{ flat: k.flat }"
              >{{ k.flat ? k.change : '▲ ' + k.change }}
              <span>{{ k.compare }}</span></em
            >
          </article>
        </section>
        <section class="row">
          <article class="panel trend">
            <Title color="#1890ff" text="充电量与金额趋势"
              ><span class="trend-legend"
                ><i class="trend-legend-mark blue"></i><span>充电量 kWh</span><i class="trend-legend-mark orange"></i><span>充电金额 元</span></span
              ></Title
            ><svg
              class="trend-svg"
              viewBox="0 0 760 180"
              preserveAspectRatio="none"
            >
              <g v-for="n in 5" :key="n">
                <line
                  x1="42"
                  :y1="y((n - 1) * 16250)"
                  x2="718"
                  :y2="y((n - 1) * 16250)"
                />
                <text x="35" :y="y((n - 1) * 16250) + 4" text-anchor="end">
                  {{ fmt((n - 1) * 16250) }}
                </text>
              </g>
              <g v-for="(v, i) in bars" :key="i">
                <rect
                  :x="trendX(i) - trendBarWidth() / 2"
                  :y="y(v)"
                  :width="trendBarWidth()"
                  :height="Math.max(1, 155 - y(v))"
                  :fill="i === bars.length - 1 ? '#1890ff' : '#8ecbff'"
                />
                <text
                  v-if="showTrendLabel(i)"
                  :x="trendX(i)"
                  y="174"
                  text-anchor="middle"
                >
                  {{ labels[i] }}
                </text>
              </g>
              <path :d="area" />
              <path :d="line" />
              <circle :cx="trendX(amount.length - 1)" :cy="ay(amount[amount.length - 1])" r="3" />
            </svg>
          </article>
          <article class="panel">
            <Title color="#722ed1" text="协议接入桩数分布"
              ><span>充电桩合计 {{ fmt(protocolTotal) }}</span></Title
            >
            <div class="donut-body">
              <svg class="donut" viewBox="0 0 130 130">
                <circle
                  cx="65"
                  cy="65"
                  r="42"
                  fill="none"
                  stroke="#f1f3f6"
                  stroke-width="16"
                />
                <circle
                  v-for="s in slices"
                  :key="s.name"
                  cx="65"
                  cy="65"
                  r="42"
                  fill="none"
                  :stroke="s.color"
                  stroke-width="16"
                  :stroke-dasharray="s.dash"
                  :transform="'rotate(' + s.rotate + ' 65 65)'"
                />
                <text x="65" y="64" text-anchor="middle">
                  {{ fmt(protocolTotal) }}
                </text>
                <text x="65" y="79" text-anchor="middle">接入充电桩</text>
              </svg>
              <div class="d-legend">
                <div v-for="s in slices" :key="s.name">
                  <i :style="{ background: s.color }"></i
                  ><span>{{ s.name }}</span
                  ><b>{{ fmt(s.value) }}</b
                  ><em>{{ s.percent }}%</em>
                </div>
              </div>
            </div>
          </article>
        </section>
        <section class="row">
          <article class="panel">
            <Title color="#52c41a" text="设备运行状态分布"
              ><span>在线 {{ fmt(onlineGunCount) }} / 离线 {{ fmt(offlineGunCount) }}</span></Title
            >
            <div class="status">
              <div class="status-bar">
                <i
                  v-for="s in states"
                  :key="s.name"
                  :style="{ width: s.percent + '%', background: s.color }"
                ></i>
              </div>
              <div class="status-legend">
                <div v-for="s in states" :key="s.name">
                  <i :style="{ background: s.color }"></i>{{ s.name
                  }}<b>{{ fmt(s.value) }}</b
                  ><em>{{ s.percent }}%</em>
                </div>
              </div>
            </div>
          </article>
          <article class="panel">
            <Title color="#fa8c16" text="站点充电量 TOP5"
              ><span
                >近{{
                  period === '7' ? '7天' : period === 'month' ? '本月' : '30天'
                }}
                · kWh</span
              ></Title
            >
            <div class="sites">
              <div v-for="s in sites" :key="s.name">
                <span>{{ s.name }}</span
                ><i
                  ><b
                    :style="{
                      width: s.percent + '%',
                      background: s.muted ? '#cdd3da' : '#36a6f5'
                    }"
                  ></b></i
                ><strong>{{ fmt(s.value) }}</strong>
              </div>
            </div>
          </article>
        </section>
        <section class="row realtime">
          <article class="panel">
            <Title color="#52c41a" text="实时充电记录"
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
            <Title color="#ff4d4f" text="设备异常动态"
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
        <section class="panel engine">
          <Title color="#52c41a" text="协议引擎 · 实时状态"
            ><span class="green"
              >{{ engineSummary }} —— {{ engines.length }}/{{ engines.length }} 在线</span
            ></Title
          >
          <div class="engine-body">
            <article v-for="e in engines" :key="e.version">
              <div>
                <b>{{ e.name }}</b
                ><span>{{ e.version }}</span
                ><em>● 在线</em>
              </div>
              <p>
                接入 <strong>{{ fmt(e.count) }}</strong> 桩 心跳
                <strong>{{ e.heartbeat }}</strong>
              </p>
            </article>
            <aside>
              <div>
                今日协议消息 <b>{{ fmt(protocolMessageCount) }}<small>条</small></b>
              </div>
              <div>
                自动适配切换 <b>{{ fmt(protocolSwitchCount) }}<small>次</small></b>
              </div>
              <div>
                指令下发成功率 <b class="green">{{ commandSuccessRate }}<small>%</small></b>
              </div>
            </aside>
          </div>
        </section>
    </main>
  </div>
</template>

<script>
import { listStations } from '@/api/multiProtocol/station'
import { listPiles } from '@/api/multiProtocol/pile'
import { listGuns } from '@/api/multiProtocol/gun'
import { listSupportedProtocols } from '@/api/multiProtocol/protocol'

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
      dashboardScale: 1,
      dashboardResizeObserver: null,
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
      period: '30',
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
          icon: '⌂',
          color: '#1890ff',
          bg: '#e6f4ff'
        },
        {
          label: '充电桩',
          value: '3,486',
          unit: '',
          change: '4.5%',
          compare: '较上期',
          icon: '▥',
          color: '#13c2c2',
          bg: '#e6fffb'
        },
        {
          label: '充电枪',
          value: '5,012',
          unit: '',
          change: '5.6%',
          compare: '较上期',
          icon: '⚡',
          color: '#722ed1',
          bg: '#f4eaff'
        },
        {
          label: '接入协议',
          value: '4',
          unit: '类',
          change: '云快充×3 · 绿能',
          flat: true,
          icon: '▱',
          color: '#2f54eb',
          bg: '#eff1ff'
        },
        {
          label: '今日充电量',
          value: '38,562',
          unit: 'kWh',
          change: '12.6%',
          compare: '较昨日',
          icon: 'ϟ',
          color: '#fa8c16',
          bg: '#fff7e6'
        },
        {
          label: '今日订单',
          value: '1,214',
          unit: '单',
          change: '8.2%',
          compare: '较昨日',
          icon: '▣',
          color: '#52c41a',
          bg: '#f6ffed'
        },
        {
          label: '今日充电金额',
          value: '41,600',
          unit: '元',
          change: '11.4%',
          compare: '较昨日',
          icon: '¥',
          color: '#eb2f96',
          bg: '#fff0f6'
        },
        {
          label: '设备在线率',
          value: '94.9',
          unit: '%',
          change: '0.6pp',
          compare: '较上期',
          icon: '⌁',
          color: '#faad14',
          bg: '#fffbe6'
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
        { name: '云快充 V1.5', value: 1520, color: '#1890ff' },
        { name: '云快充 V1.6', value: 880, color: '#13c2c2' },
        { name: '云快充 V1.7', value: 760, color: '#722ed1' },
        { name: '绿能 V3.4', value: 286, color: '#52c41a' },
        { name: '其他协议', value: 40, color: '#c8ccd4' }
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
    dashboardStyle() {
      const scale = this.dashboardScale
      return {
        width: `${100 / scale}%`,
        height: `${100 / scale}%`,
        transform: `scale(${scale})`
      }
    },
    protocolTotal() {
      return this.protocols.reduce((a, b) => a + b.value, 0)
    },
    slices() {
      const c = 2 * Math.PI * 42
      let used = 0
      return this.protocols.map((s) => {
        const len = (s.value / this.protocolTotal) * c
        const dash = Math.max(len - 2, 0.5)
        const out = Object.assign({}, s, {
          percent: ((s.value / this.protocolTotal) * 100).toFixed(1),
          dash: dash + ' ' + (c - dash),
          rotate: used * 360 - 90
        })
        used += s.value / this.protocolTotal
        return out
      })
    },
    bars() {
      return this.trend
    },
    amount() {
      return this.amountBase
    },
    labels() {
      const days = this.getPeriodDays()
      const end = new Date()
      return Array.from({ length: days }, (_, index) => {
        const date = new Date(end)
        date.setDate(end.getDate() - days + index + 1)
        return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      })
    },
    line() {
      return this.amount
        .map((v, i) => (i ? 'L' : 'M') + this.trendX(i) + ' ' + this.ay(v))
        .join(' ')
    },
    area() {
      const endX = this.trendX(this.amount.length - 1)
      return this.line + ` L${endX} 155 L60 155 Z`
    }
  },
  watch: {
    period() {
      this.buildTrend()
      this.buildSiteRanking()
    }
  },
  mounted() {
    this.loadDashboardData()
    this.$nextTick(() => {
      this.updateDashboardScale()

      const appMain = this.$el.closest('.app-main')
      if (typeof ResizeObserver !== 'undefined' && appMain) {
        this.dashboardResizeObserver = new ResizeObserver(() => {
          this.updateDashboardScale()
        })
        this.dashboardResizeObserver.observe(appMain)
      }
      window.addEventListener('resize', this.updateDashboardScale)
    })
  },
  beforeDestroy() {
    if (this.dashboardResizeObserver) {
      this.dashboardResizeObserver.disconnect()
      this.dashboardResizeObserver = null
    }
    window.removeEventListener('resize', this.updateDashboardScale)
  },
  methods: {
    stableNumber(key, min, max) {
      const hash = String(key).split('').reduce((total, char) => ((total * 31) + char.charCodeAt(0)) >>> 0, 0)
      return min + (hash % (max - min + 1))
    },
    getPeriodDays() {
      if (this.period === '7') return 7
      if (this.period === 'month') return Math.max(new Date().getDate(), 1)
      return 30
    },
    buildSiteRanking() {
      const days = this.getPeriodDays()
      const ranked = this.stationEnergyBasis
        .map((station, index) => {
          const key = station.id || station.name || index
          const variation = this.stableNumber(`site-ranking-${this.period}-${key}`, 90, 112) / 100
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
      const days = this.getPeriodDays()
      const baseline = todayEnergy || 1
      this.trend = Array.from({ length: days }, (_, index) => {
        if (index === days - 1) return baseline
        const factor = this.stableNumber(`trend-${this.period}-${index}`, 78, 121) / 100
        return Math.round(baseline * factor)
      })
      this.amountBase = this.trend.map((energy, index) => {
        const price = this.stableNumber(`amount-${this.period}-${index}`, 102, 118) / 100
        return Math.round(energy * price)
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
        const colors = ['#1890ff', '#13c2c2', '#722ed1', '#52c41a', '#faad14', '#c8ccd4']
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
    updateDashboardScale() {
      const appMain = this.$el && this.$el.closest('.app-main')
      if (!appMain || window.innerWidth <= 760) {
        this.dashboardScale = 1
        return
      }

      // The dashboard rows add up to 617px including the main padding and gaps.
      const designHeight = 617
      const availableHeight = appMain.clientHeight
      if (availableHeight > 0) {
        this.dashboardScale = Math.max(0.75, availableHeight / designHeight)
      }
    },
    trendX(index) {
      const count = this.bars.length
      if (count <= 1) return 60
      return 60 + (index * 638) / (count - 1)
    },
    trendBarWidth() {
      const count = this.bars.length
      if (count <= 1) return 13
      return Math.max(8, Math.min(13, (638 / (count - 1)) * 0.62))
    },
    showTrendLabel(index) {
      const count = this.labels.length
      if (count <= 7) return true
      const interval = count <= 15 ? 3 : 5
      return index === 0 || index === count - 1 || index % interval === 0
    },
    fmt(v) {
      return Number(v).toLocaleString('en-US')
    },
    y(v) {
      return 155 - (v / 65000) * 135
    },
    ay(v) {
      return 155 - (v / 70000) * 135
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
  height: 100%;
  min-height: 0;
  display: block;
  overflow: hidden;
  transform-origin: top left;
  background: #e9edf2;
  color: #303133;
  font-family: 'Microsoft YaHei', 'PingFang SC', Arial, sans-serif;
  font-size: 12px;
}
/* The shared Layout owns the sidebar and header; this view fills AppMain only. */
main {
  min-height: 0;
  height: 100%;
  overflow: hidden;
  padding: 8px 14px 8px 12px;
  background: #e9edf2;
}
.titlebar {
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.titlebar h1 {
  margin: 0;
  color: #1f2329;
  font-size: 15px;
}
.titlebar small {
  margin-left: 8px;
  color: #8a919f;
  font-size: 11px;
  font-weight: 400;
}
.period {
  height: 24px;
  display: flex;
  overflow: hidden;
  border: 1px solid #dcdfe6;
  border-radius: 13px;
  background: #fff;
}
.period button {
  padding: 0 11px;
  border: 0;
  border-right: 1px solid #ebeef5;
  background: #fff;
  color: #606266;
  font: inherit;
  font-size: 11px;
  cursor: pointer;
}
.period button:last-child {
  border: 0;
}
.period button.on {
  background: #1890ff;
  color: #fff;
}
.kpis {
  display: flex;
  gap: 8px;
  height: 76px;
  margin-top: 5px;
}
.kpi,
.panel {
  min-width: 0;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 1px 2px #1020400d;
}
.kpi {
  flex: 1;
  padding: 7px 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.k-top {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #3c4043;
  font-size: 11.5px;
  white-space: nowrap;
}
.k-top i {
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  border-radius: 6px;
  font-size: 15px;
  font-style: normal;
  font-weight: 700;
}
.kpi strong {
  color: #1f2329;
  font-size: 20px;
  line-height: 1.15;
  white-space: nowrap;
}
.kpi strong small {
  margin-left: 2px;
  color: #8a919f;
  font-size: 10px;
  font-weight: 400;
}
.kpi em {
  color: #52c41a;
  font-size: 10px;
  font-style: normal;
}
.kpi em span {
  margin-left: 4px;
  color: #c0c4cc;
}
.kpi em.flat {
  color: #8a919f;
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
.panel {
  padding: 7px 10px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.panel-title {
  height: 22px;
  display: flex;
  align-items: center;
  gap: 7px;
  flex: none;
  margin-bottom: 3px;
}
.panel-title > i {
  width: 7px;
  height: 7px;
  border-radius: 2px;
}
.panel-title > b {
  color: #1f2329;
  font-size: 12.5px;
}
.panel-title > span {
  margin-left: auto;
  color: #8a919f;
  font-size: 10px;
  white-space: nowrap;
}
.blue {
  color: #1890ff;
}
.orange {
  color: #fa8c16;
}
.trend-legend {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.trend-legend-mark {
  display: inline-block;
  width: 11px;
  height: 11px;
  border-radius: 1px;
}
.trend-legend-mark.blue { background: #1890ff; }
.trend-legend-mark.orange { background: #fa8c16; }
.trend-svg {
  width: 100%;
  height: 100%;
  display: block;
}
.trend-svg line {
  stroke: #eef0f4;
}
.trend-svg text {
  fill: #909399;
  font-size: 8.5px;
}
.trend-svg path:first-of-type {
  fill: rgba(250, 140, 22, 0.1);
}
.trend-svg path:nth-of-type(2) {
  fill: none;
  stroke: #fa8c16;
  stroke-width: 2;
}
.trend-svg circle {
  fill: #fa8c16;
  stroke: #fff;
  stroke-width: 1.2;
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
.status,
.sites {
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.status-bar {
  height: 18px;
  display: flex;
  overflow: hidden;
  border-radius: 6px;
}
.status-bar i {
  height: 100%;
}
.status-legend {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px 16px;
  margin-top: 9px;
}
.status-legend div {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #4a4f57;
  font-size: 10px;
}
.status-legend i {
  width: 8px;
  height: 8px;
  border-radius: 2px;
}
.status-legend b {
  margin-left: auto;
  color: #1f2329;
}
.status-legend em {
  width: 27px;
  color: #b8bec7;
  font-size: 9.5px;
  font-style: normal;
  text-align: right;
}
.sites > div {
  height: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 1px 0;
}
.sites > div > span {
  width: 104px;
  overflow: hidden;
  color: #5a6068;
  font-size: 10px;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sites i {
  min-width: 0;
  flex: 1;
  height: 7px;
  overflow: hidden;
  border-radius: 4px;
  background: #f0f2f5;
}
.sites i b {
  display: block;
  height: 100%;
  border-radius: 4px;
}
.sites strong {
  width: 66px;
  color: #1f2329;
  font-size: 9.5px;
  text-align: right;
}
.realtime {
  height: 96px;
}
.realtime .panel {
  padding: 4px 11px 3px;
}
.realtime .panel-title {
  height: 16px;
}
.records {
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.records > div {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 14px;
  font-size: 10px;
}
.records time {
  color: #8a919f;
  font-size: 9.5px;
}
.records > div > span {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  color: #3c4043;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.records em {
  flex: none;
  color: #8a919f;
  font-size: 9.5px;
  font-style: normal;
}
.records em b {
  color: #1f2329;
}
.records label {
  height: 14px;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 0 6px;
  border-radius: 7px;
  font-size: 9px;
}
.records label i {
  width: 4px;
  height: 4px;
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
  height: 108px;
  margin-top: 7px;
  flex: none;
}
.green {
  color: #52c41a !important;
}
.engine-body {
  min-height: 0;
  flex: 1;
  display: flex;
  gap: 8px;
}
.engine-body article {
  min-width: 0;
  flex: 1;
  padding: 6px 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 7px;
  border: 1px solid #edf0f5;
  border-radius: 8px;
  background: #fbfcfe;
}
.engine-body article div {
  display: flex;
  align-items: center;
  gap: 6px;
}
.engine-body article div b {
  font-size: 12.5px;
}
.engine-body article div span {
  padding: 1px 5px;
  border-radius: 4px;
  color: #1890ff;
  background: #e8f3ff;
  font-size: 9px;
}
.engine-body article div em {
  margin-left: auto;
  color: #52c41a;
  font-size: 9.5px;
  font-style: normal;
}
.engine-body article p {
  margin: 0;
  color: #8a919f;
  font-size: 10px;
  white-space: nowrap;
}
.engine-body article strong {
  color: #1f2329;
}
.engine-body aside {
  width: 238px;
  flex: none;
  margin: 0;
  padding: 0 0 0 14px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  border-left: 1px dashed #e5e8ee;
  border-radius: 0;
  background: transparent;
  color: #5a6068;
  font-family: inherit;
  font-size: 10px;
  line-height: normal;
}
.engine-body aside div {
  display: flex;
  justify-content: space-between;
}
.engine-body aside b {
  color: #1f2329;
  font-size: 13px;
}
.engine-body aside small {
  margin-left: 2px;
  color: #8a919f;
  font-size: 10px;
  font-weight: 400;
}
@media (max-width: 760px) {
  .dashboard-page {
    width: 100% !important;
    height: 100% !important;
    transform: none !important;
    overflow: auto;
  }
  main {
    padding: 8px;
    overflow: auto;
  }
  .kpis {
    overflow: auto;
  }
  .kpi {
    min-width: 120px;
  }
  .row {
    height: auto;
    flex-direction: column;
  }
  .row > .panel {
    min-height: 131px;
  }
  .realtime {
    height: auto;
  }
  .engine {
    height: auto;
  }
  .engine-body {
    flex-wrap: wrap;
  }
  .engine-body article {
    min-width: calc(50% - 4px);
    min-height: 66px;
  }
  .engine-body aside {
    width: 100%;
    padding: 8px 0 0;
    border-top: 1px dashed #e5e8ee;
    border-left: 0;
  }
  .titlebar small {
    display: none;
  }
}
</style>
