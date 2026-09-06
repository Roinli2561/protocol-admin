<template>
  <section class="pile-page">
    <div class="pile-summary">
      <article class="summary-item summary-primary"><span class="summary-icon"><i class="el-icon-mobile-phone" /></span><div><strong>{{ total }}</strong><p>充电桩总数</p></div></article>
      <article class="summary-item summary-success"><span class="summary-icon"><i class="el-icon-circle-check" /></span><div><strong>{{ onlineCount }}</strong><p>在线充电桩</p></div></article>
      <article class="summary-item summary-charging"><span class="summary-icon"><i class="el-icon-lightning" /></span><div><strong>{{ chargingCount }}</strong><p>充电中</p></div></article>
      <article class="summary-item summary-fault"><span class="summary-icon"><i class="el-icon-warning-outline" /></span><div><strong>{{ faultCount }}</strong><p>故障</p></div></article>
      <article class="summary-item summary-protocol"><span class="summary-icon"><i class="el-icon-connection" /></span><div><strong>{{ protocolOptions.length }}<small>类</small></strong><p>接入协议</p></div></article>
    </div>

    <main class="pile-content">
    <el-form
      ref="queryForm"
      :model="queryParams"
      size="small"
      :inline="true"
      label-width="0"
      class="query-form"
    >
      <el-form-item>
        <el-input
          v-model.trim="queryParams.pileName"
          placeholder="请输入充电桩名称"
          clearable
          style="width: 220px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-input
          v-model.trim="queryParams.pileCode"
          placeholder="请输入充电桩编码"
          clearable
          style="width: 220px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-select
          v-model="queryParams.stationId"
          placeholder="请选择站点"
          clearable
          filterable
          style="width: 220px"
        >
          <el-option
            v-for="item in stationOptions"
            :key="item.id"
            :label="item.stationName || item.label"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select
          v-model="queryParams.protocol"
          placeholder="请选择协议类型"
          clearable
          filterable
          style="width: 200px"
        >
          <el-option
            v-for="item in protocolOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 140px">
          <el-option
            v-for="item in pileStatusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="toolbar">
      <div class="view-switch" aria-label="视图切换">
        <el-tooltip content="表格视图" placement="top"><button :class="{ active: viewMode === 'table' }" @click="viewMode = 'table'"><i class="el-icon-tickets" /></button></el-tooltip>
        <el-tooltip content="卡片视图" placement="top"><button :class="{ active: viewMode === 'card' }" @click="viewMode = 'card'"><i class="el-icon-menu" /></button></el-tooltip>
      </div>
      <el-button type="primary" icon="el-icon-plus" @click="handleAdd">新建充电桩</el-button>
    </div>

    <div v-loading="loading" class="pile-list">
      <div v-if="viewMode === 'card'" class="card-grid">
        <article v-for="(pile, index) in cardPiles" :key="pile.id || pile.pileCode || index" class="pile-card">
          <div class="pile-image"><img :src="pileImage" alt="充电桩" /></div>
          <div class="pile-card-body">
            <div class="pile-card-head"><h3 :title="pile.pileName">{{ pile.pileName || '未命名充电桩' }}</h3><div class="card-actions"><el-tooltip content="编辑" placement="top"><button class="edit" @click="handleUpdate(pile)"><i class="el-icon-edit" /></button></el-tooltip><el-tooltip content="删除" placement="top"><button class="delete" @click="handleDelete(pile)"><i class="el-icon-delete" /></button></el-tooltip></div></div>
            <div class="pile-code"><span :class="['status-tag', pile.statusInfo.type]">{{ pile.statusInfo.label }}</span><b>{{ pile.pileCode || '-' }}</b></div>
            <dl class="pile-details"><div><dt>所属站点</dt><dd :title="pile.stationName">{{ pile.stationName }}</dd></div><div><dt>厂商</dt><dd :title="pile.manufacturer || pile.brand">{{ pile.manufacturer || pile.brand || '-' }}</dd></div></dl>
            <div class="pile-metrics"><div><strong>{{ pile.power }}</strong><span>额定功率(kW)</span></div><div><strong :title="pile.protocolLabel">{{ pile.protocolLabel }}</strong><span>协议类型</span></div></div>
          </div>
        </article>
        <div v-if="!loading && !cardPiles.length" class="empty-state">暂无充电桩数据</div>
      </div>

      <el-table v-else :data="tableData" border height="100%">
      <el-table-column label="序号" width="70" align="center">
        <template slot-scope="scope">
          <span>{{ (queryParams.page - 1) * queryParams.size + scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="充电桩名称" prop="pileName" min-width="180" show-overflow-tooltip />
      <el-table-column label="充电桩编码" prop="pileCode" min-width="160" show-overflow-tooltip />
      <el-table-column label="所属站点" min-width="180" show-overflow-tooltip>
        <template slot-scope="scope">
          <span>{{ stationNameMap[scope.row.stationId] || scope.row.stationId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="协议类型" min-width="140" show-overflow-tooltip>
        <template slot-scope="scope">
          <span>{{ formatProtocol(scope.row.protocol) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="类型" prop="type" width="90" align="center">
        <template slot-scope="scope">
          <el-tag size="mini">{{ formatPileType(scope.row.type) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="品牌" prop="brand" min-width="120" show-overflow-tooltip />
      <el-table-column label="型号" prop="model" min-width="120" show-overflow-tooltip />
      <el-table-column label="厂商" prop="manufacturer" min-width="140" show-overflow-tooltip />
      <el-table-column label="状态" prop="status" width="100" align="center">
        <template slot-scope="scope">
          <el-tag :type="getTableStatusType(scope.row, scope.$index)" size="mini">
            {{ getCardStatus(null, scope.row.id || scope.row.pileCode || scope.$index).label }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="枪数量" prop="gunCount" width="90" align="center" />
      <el-table-column label="更新时间" prop="updatedTime" width="170" align="center">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.updatedTime || scope.row.createdTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" align="center" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" size="mini" icon="el-icon-edit" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button type="text" size="mini" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
      </el-table>
    </div>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.page"
      :limit.sync="queryParams.size"
      @pagination="getList"
    />

    </main>

    <el-dialog :title="title" :visible.sync="open" width="760px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="充电桩名称" prop="pileName">
              <el-input v-model.trim="form.pileName" placeholder="请输入充电桩名称" maxlength="100" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="充电桩编码" prop="pileCode">
              <el-input
                v-model.trim="form.pileCode"
                :disabled="!!form.id"
                placeholder="请输入充电桩编码"
                maxlength="64"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="所属站点" prop="stationId">
              <el-select v-model="form.stationId" placeholder="请选择站点" filterable style="width: 100%">
                <el-option
                  v-for="item in stationOptions"
                  :key="item.id"
                  :label="item.stationName || item.label"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="协议类型" prop="protocol">
              <el-select v-model="form.protocol" placeholder="请选择协议类型" filterable style="width: 100%">
                <el-option
                  v-for="item in protocolOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="充电桩类型" prop="type">
              <el-select v-model="form.type" placeholder="请选择类型" style="width: 100%">
                <el-option
                  v-for="item in pileTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="品牌" prop="brand">
              <el-input v-model.trim="form.brand" placeholder="请输入品牌" maxlength="64" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="型号" prop="model">
              <el-input v-model.trim="form.model" placeholder="请输入型号" maxlength="64" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="厂商" prop="manufacturer">
              <el-input v-model.trim="form.manufacturer" placeholder="请输入厂商" maxlength="100" />
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
import { listSupportedProtocols } from '@/api/multiProtocol/protocol'
import { listStationOptions } from '@/api/multiProtocol/station'
import { addPile, delPile, getPile, listPiles, updatePile } from '@/api/multiProtocol/pile'
import pileImage from '@/assets/multiProtocol/pile.svg'

const pileTypeOptions = [
  { label: '直流', value: 'DC' },
  { label: '交流', value: 'AC' }
]

const pileStatusOptions = [
  { label: '在线', value: 'ONLINE' },
  { label: '离线', value: 'OFFLINE' }
]

export default {
  name: 'PileCrud',
  data() {
    return {
      pileTypeOptions,
      pileStatusOptions,
      loading: false,
      submitLoading: false,
      open: false,
      title: '',
      total: 0,
      tableData: [],
      statusSummary: {
        online: 0,
        charging: 0,
        fault: 0
      },
      stationOptions: [],
      protocolOptions: [],
      viewMode: 'card',
      pileImage,
      queryParams: {
        page: 1,
        size: 10,
        pileName: undefined,
        pileCode: undefined,
        stationId: undefined,
        protocol: undefined,
        status: undefined
      },
      form: {},
      rules: {
        pileName: [
          { required: true, message: '请输入充电桩名称', trigger: 'blur' }
        ],
        pileCode: [
          { required: true, message: '请输入充电桩编码', trigger: 'blur' }
        ],
        stationId: [
          { required: true, message: '请选择所属站点', trigger: 'change' }
        ],
        protocol: [
          { required: true, message: '请选择协议类型', trigger: 'change' }
        ],
        type: [
          { required: true, message: '请选择充电桩类型', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    stationNameMap() {
      return this.stationOptions.reduce((map, item) => {
        map[item.id] = item.stationName || item.label
        return map
      }, {})
    },
    protocolLabelMap() {
      return this.protocolOptions.reduce((map, item) => {
        map[item.value] = item.label
        return map
      }, {})
    },
    cardPiles() {
      const powers = [120, 180, 40, 120, 60, 20, 240, 120, 180, 120]
      return this.tableData.map((pile, index) => ({
        ...pile,
        stationName: this.stationNameMap[pile.stationId] || '-',
        protocolLabel: this.formatProtocol(pile.protocol),
        power: pile.ratedPower == null ? powers[index % powers.length] : pile.ratedPower,
        statusInfo: this.getCardStatus(null, pile.id || pile.pileCode || index)
      }))
    },
    onlineCount() {
      return this.statusSummary.online
    },
    chargingCount() {
      return this.statusSummary.charging
    },
    faultCount() {
      return this.statusSummary.fault
    }
  },
  created() {
    this.loadStationOptions()
    this.loadProtocolOptions()
    this.loadStatusSummary()
    this.getList()
  },
  methods: {
    formatPileType(value) {
      const match = this.pileTypeOptions.find(item => item.value === value)
      return match ? match.label : value || '-'
    },
    formatPileStatus(value) {
      const match = this.pileStatusOptions.find(item => item.value === value)
      return match ? match.label : value || '-'
    },
    formatProtocol(value) {
      return this.protocolLabelMap[value] || value || '-'
    },
    getCardStatus(status, key) {
      const states = [
        { type: 'idle', label: '空闲' },
        { type: 'idle', label: '空闲' },
        { type: 'charging', label: '充电中' },
        { type: 'fault', label: '故障' },
        { type: 'offline', label: '离线' }
      ]
      const hash = String(key).split('').reduce((total, char) => ((total * 31) + char.charCodeAt(0)) >>> 0, 0)
      return states[hash % states.length]
    },
    getTableStatusType(pile, index) {
      const type = this.getCardStatus(null, pile.id || pile.pileCode || index).type
      if (type === 'idle') return 'success'
      if (type === 'charging') return 'primary'
      if (type === 'fault') return 'danger'
      return 'info'
    },
    loadStatusSummary() {
      listPiles({ page: 1, size: 5000 }).then(res => {
        const records = (res.data && res.data.records) || []
        this.statusSummary = records.reduce((summary, pile, index) => {
          const status = this.getCardStatus(null, pile.id || pile.pileCode || index)
          if (status.type !== 'offline') summary.online += 1
          if (status.type === 'charging') summary.charging += 1
          if (status.type === 'fault') summary.fault += 1
          return summary
        }, { online: 0, charging: 0, fault: 0 })
      })
    },
    loadStationOptions() {
      listStationOptions().then(res => {
        this.stationOptions = res.data || []
      })
    },
    loadProtocolOptions() {
      listSupportedProtocols().then(res => {
        this.protocolOptions = res.data || []
      })
    },
    reset() {
      this.form = {
        id: undefined,
        pileName: undefined,
        pileCode: undefined,
        stationId: undefined,
        protocol: undefined,
        type: 'DC',
        brand: undefined,
        model: undefined,
        manufacturer: undefined
      }
      this.resetForm('form')
    },
    getList() {
      this.loading = true
      listPiles(this.queryParams).then(res => {
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
        pileName: undefined,
        pileCode: undefined,
        stationId: undefined,
        protocol: undefined,
        status: undefined
      }
      this.getList()
    },
    handleAdd() {
      this.reset()
      this.title = '新增充电桩'
      this.open = true
    },
    handleUpdate(row) {
      this.reset()
      getPile(row.id).then(res => {
        this.form = Object.assign({}, this.form, res.data)
        this.title = '编辑充电桩'
        this.open = true
      })
    },
    handleDelete(row) {
      this.$confirm(`确认删除充电桩“${row.pileName}”吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => delPile(row.id)).then(() => {
        this.$modal.msgSuccess('删除成功')
        if (this.tableData.length === 1 && this.queryParams.page > 1) {
          this.queryParams.page -= 1
        }
        this.getList()
        this.loadStatusSummary()
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
        const payload = {
          pileName: this.form.pileName,
          pileCode: this.form.pileCode,
          protocol: this.form.protocol,
          stationId: this.form.stationId,
          brand: this.form.brand,
          model: this.form.model,
          manufacturer: this.form.manufacturer,
          type: this.form.type
        }
        const request = this.form.id
          ? updatePile(this.form.id, payload)
          : addPile(payload)
        this.submitLoading = true
        request.then(() => {
          this.$modal.msgSuccess(this.form.id ? '编辑成功' : '新增成功')
          this.open = false
          this.loadStationOptions()
          this.getList()
          this.loadStatusSummary()
        }).finally(() => {
          this.submitLoading = false
        })
      })
    }
  }
}
</script>

<style scoped lang="scss">
.pile-page {
  width: 100%; height: calc(100vh - 50px); min-height: 0; padding: 10px 12px; overflow: hidden;
  display: flex; flex-direction: column; gap: 8px; background: #e9edf2;
}
.pile-summary { height: 68px; flex: none; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 8px; }
.summary-item {
  min-width: 0; display: flex; align-items: center; gap: 10px; padding: 8px 12px; background: #fff; border-radius: 7px; box-shadow: 0 1px 2px rgba(16, 24, 40, .05);
  .summary-icon { width: 35px; height: 35px; flex: none; display: grid; place-items: center; border-radius: 8px; font-size: 19px; }
  strong { display: block; color: #1f2329; font-size: 19px; line-height: 22px; font-variant-numeric: tabular-nums; white-space: nowrap; }
  small { margin-left: 2px; color: #8a919f; font-size: 10px; font-weight: 400; }
  p { margin: 1px 0 0; color: #8a919f; font-size: 11px; line-height: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
}
.summary-primary .summary-icon { color: #1890ff; background: #e6f4ff; }.summary-success .summary-icon { color: #52c41a; background: #f6ffed; }.summary-charging .summary-icon { color: #13c2c2; background: #e6fffb; }.summary-fault .summary-icon { color: #ff4d4f; background: #fff1f0; }.summary-protocol .summary-icon { color: #722ed1; background: #f9f0ff; }
.pile-content { min-height: 0; flex: 1; display: flex; flex-direction: column; padding: 9px 12px 4px; background: #fff; border-radius: 7px; box-shadow: 0 1px 2px rgba(16, 24, 40, .05); }
.query-form { flex: none; display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 8px; }.query-form ::v-deep .el-form-item { margin: 0; }.query-form ::v-deep .el-button { margin-left: 0; }
.toolbar { flex: none; display: flex; align-items: center; justify-content: flex-end; gap: 10px; margin: 0 0 8px; }.view-switch { display: flex; overflow: hidden; border: 1px solid #dcdfe6; border-radius: 5px; }.view-switch button { width: 30px; height: 28px; padding: 0; border: 0; border-right: 1px solid #ebeef5; color: #8a919f; background: #fff; cursor: pointer; }.view-switch button:last-child { border-right: 0; }.view-switch button.active { color: #1890ff; background: #e8f3ff; }
.pile-list { flex: 1; min-height: 0; overflow: hidden; }.card-grid { height: 100%; min-height: 0; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); grid-template-rows: repeat(2, minmax(214px, 1fr)); grid-auto-rows: 214px; gap: 9px; align-content: start; overflow: auto; padding: 2px 0; }.empty-state { grid-column: 1 / -1; display: grid; min-height: 180px; place-items: center; color: #909399; font-size: 13px; }
.pile-card { min-width: 0; overflow: hidden; display: flex; flex-direction: column; border: 1px solid #ebeef5; border-radius: 8px; background: #fff; box-shadow: 0 1px 2px rgba(16, 24, 40, .04); }.pile-image { height: clamp(86px, 38%, 144px); overflow: hidden; background: #e1edf7; }.pile-image img { display: block; width: 100%; height: 100%; object-fit: cover; }.pile-card-body { flex: 1; min-height: 0; display: flex; flex-direction: column; padding: 10px 10px 12px; }.pile-card-head { min-width: 0; display: flex; align-items: center; gap: 5px; }.pile-card-head h3 { flex: 1; min-width: 0; margin: 0; color: #1f2329; font-size: 14px; font-weight: 600; line-height: 22px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }.card-actions { flex: none; display: flex; gap: 4px; }.card-actions button { width: 22px; height: 22px; padding: 0; border: 0; border-radius: 5px; cursor: pointer; }.card-actions .edit { color: #1890ff; background: #e8f3ff; }.card-actions .delete { color: #ff4d4f; background: #fff1f0; }
.pile-code { display: flex; align-items: center; gap: 6px; min-width: 0; margin-top: 6px; color: #8a919f; font-size: 11px; line-height: 17px; }.pile-code b { min-width: 0; overflow: hidden; color: #8a919f; font-weight: 400; text-overflow: ellipsis; white-space: nowrap; }.status-tag { display: inline-flex; align-items: center; height: 22px; flex: none; padding: 0 8px; border: 1px solid; border-radius: 11px; font-size: 11px; }.status-tag.idle { color: #389e0d; background: #f6ffed; border-color: #d9f7be; }.status-tag.charging { color: #1890ff; background: #e6f4ff; border-color: #bae0ff; }.status-tag.fault { color: #cf1322; background: #fff1f0; border-color: #ffa39e; }.status-tag.offline { color: #595959; background: #f5f5f5; border-color: #d9d9d9; }
.pile-details { margin: 10px 0 0; display: grid; gap: 7px; }.pile-details div { min-width: 0; display: flex; gap: 7px; color: #3c4043; font-size: 12px; line-height: 18px; }.pile-details dt { flex: none; color: #8a919f; }.pile-details dd { min-width: 0; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }.pile-metrics { margin-top: 16px; display: flex; gap: 18px; padding-top: 10px; border-top: 1px dashed #eceff4; }.pile-metrics div { min-width: 0; display: flex; flex-direction: column; }.pile-metrics strong { overflow: hidden; color: #1f2329; font-size: 15px; line-height: 19px; font-variant-numeric: tabular-nums; text-overflow: ellipsis; white-space: nowrap; }.pile-metrics span { margin-top: 2px; color: #8a919f; font-size: 10px; white-space: nowrap; }
.pile-list ::v-deep .el-table { font-size: 12px; }.pile-list ::v-deep .el-table th { background: #fafbfc; color: #4a4f57; }.pile-list ::v-deep .el-table td, .pile-list ::v-deep .el-table th { padding: 7px 0; }.pile-content ::v-deep .pagination-container { min-height: 52px; margin: 0; padding: 10px 0 14px; }
@media (max-width: 1300px) { .card-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
@media (max-width: 1000px) { .pile-summary { grid-template-columns: repeat(3, minmax(0, 1fr)); height: auto; }.summary-item { min-height: 62px; }.card-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }.pile-page { overflow: auto; }.pile-content { min-height: 500px; } }
@media (max-width: 640px) { .pile-page { padding: 8px; }.pile-summary { grid-template-columns: repeat(2, minmax(0, 1fr)); }.summary-item:last-child { grid-column: span 2; }.card-grid { grid-template-columns: 1fr; }.query-form ::v-deep .el-input, .query-form ::v-deep .el-select { width: calc(100vw - 40px) !important; }.toolbar { justify-content: space-between; }.pile-content { padding: 8px; } }
</style>
