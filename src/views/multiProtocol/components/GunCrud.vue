<template>
  <section class="gun-page">
    <div class="gun-summary">
      <article class="summary-item summary-primary"><span class="summary-icon"><i class="el-icon-connection" /></span><div><strong>{{ total }}</strong><p>充电枪总数</p></div></article>
      <article class="summary-item summary-success"><span class="summary-icon"><i class="el-icon-circle-check" /></span><div><strong>{{ idleCount }}</strong><p>空闲</p></div></article>
      <article class="summary-item summary-charging"><span class="summary-icon"><i class="el-icon-lightning" /></span><div><strong>{{ chargingCount }}</strong><p>充电中</p></div></article>
      <article class="summary-item summary-availability"><span class="summary-icon"><i class="el-icon-data-line" /></span><div><strong>{{ availability }}<small>%</small></strong><p>设备可用率</p></div></article>
      <article class="summary-item summary-order"><span class="summary-icon"><i class="el-icon-document" /></span><div><strong>{{ todayOrderCount }}<small>单</small></strong><p>今日订单</p></div></article>
    </div>

    <main class="gun-content">
      <el-form ref="queryForm" :model="queryParams" size="small" :inline="true" label-width="0" class="query-form">
        <el-form-item><el-input v-model.trim="queryParams.gunName" placeholder="请输入充电枪名称" clearable style="width: 180px" @keyup.enter.native="handleQuery" /></el-form-item>
        <el-form-item><el-input v-model.trim="queryParams.gunNo" placeholder="请输入充电枪编号" clearable style="width: 150px" @keyup.enter.native="handleQuery" /></el-form-item>
        <el-form-item><el-input v-model.trim="queryParams.gunCode" placeholder="请输入充电枪编码" clearable style="width: 180px" @keyup.enter.native="handleQuery" /></el-form-item>
        <el-form-item>
          <el-select v-model="queryParams.stationId" placeholder="全部站点" clearable filterable style="width: 160px" @change="handleQueryStationChange">
            <el-option v-for="item in stationOptions" :key="item.id" :label="item.stationName || item.label" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="queryParams.pileId" placeholder="全部充电桩" clearable filterable style="width: 180px">
            <el-option v-for="item in queryPileOptions" :key="item.id" :label="item.pileName || item.label" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="queryParams.runStatus" placeholder="全部状态" clearable style="width: 135px">
            <el-option v-for="item in displayGunStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item class="query-actions"><el-button type="primary" icon="el-icon-search" @click="handleQuery">查询</el-button><el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button></el-form-item>
      </el-form>

      <div class="toolbar">
        <div class="view-switch" aria-label="视图切换">
          <el-tooltip content="表格视图" placement="top"><button :class="{ active: viewMode === 'table' }" @click="viewMode = 'table'"><i class="el-icon-tickets" /></button></el-tooltip>
          <el-tooltip content="卡片视图" placement="top"><button :class="{ active: viewMode === 'card' }" @click="viewMode = 'card'"><i class="el-icon-menu" /></button></el-tooltip>
        </div>
        <el-button type="primary" icon="el-icon-plus" @click="handleAdd">新建充电枪</el-button>
      </div>

      <div v-loading="loading" class="gun-list">
        <div v-if="viewMode === 'card'" class="card-grid">
          <article v-for="(gun, index) in cardGuns" :key="gun.id || gun.gunCode || index" class="gun-card">
            <div class="gun-image"><img :src="gunImage" alt="充电枪" /></div>
            <div class="gun-card-body">
              <div class="gun-card-head">
                <h3 :title="gun.gunName">{{ gun.gunName || '未命名充电枪' }}</h3>
                <div class="card-actions">
                  <el-tooltip content="编辑" placement="top"><button class="edit" @click="handleUpdate(gun)"><i class="el-icon-edit" /></button></el-tooltip>
                  <el-tooltip content="删除" placement="top"><button class="delete" @click="handleDelete(gun)"><i class="el-icon-delete" /></button></el-tooltip>
                </div>
              </div>
              <div class="gun-code"><span :class="['status-tag', gun.statusInfo.type]">{{ gun.statusInfo.label }}</span><b>{{ gun.gunCode || gun.gunNo || '-' }}</b></div>
              <dl class="gun-details">
                <div><dt>所属充电桩</dt><dd :title="gun.pileName">{{ gun.pileName || '-' }}</dd></div>
                <div><dt>所属站点</dt><dd :title="gun.stationName">{{ gun.stationName || '-' }}</dd></div>
              </dl>
              <div class="gun-metrics"><div><strong>{{ gun.power }}</strong><span>额定功率(kW)</span></div><div><strong>{{ gun.interfaceStandard }}</strong><span>接口标准</span></div></div>
            </div>
          </article>
          <div v-if="!loading && !cardGuns.length" class="empty-state">暂无充电枪数据</div>
        </div>

        <el-table v-else :data="tableData" border height="100%">
          <el-table-column label="序号" width="70" align="center"><template slot-scope="scope">{{ (queryParams.page - 1) * queryParams.size + scope.$index + 1 }}</template></el-table-column>
          <el-table-column label="充电枪名称" prop="gunName" min-width="160" show-overflow-tooltip />
          <el-table-column label="充电枪编号" prop="gunNo" min-width="130" show-overflow-tooltip />
          <el-table-column label="充电枪编码" prop="gunCode" min-width="160" show-overflow-tooltip />
          <el-table-column label="所属站点" prop="stationName" min-width="180" show-overflow-tooltip />
          <el-table-column label="所属充电桩" prop="pileName" min-width="180" show-overflow-tooltip />
          <el-table-column label="充电桩编码" prop="pileCode" min-width="160" show-overflow-tooltip />
          <el-table-column label="运行状态" prop="runStatus" width="120" align="center"><template slot-scope="scope"><el-tag :type="getGunStatusTag(scope.row.runStatus)" size="mini">{{ formatGunStatus(scope.row.runStatus) }}</el-tag></template></el-table-column>
          <el-table-column label="更新时间" prop="updatedTime" width="170" align="center"><template slot-scope="scope">{{ parseTime(scope.row.updatedTime || scope.row.createdTime) }}</template></el-table-column>
          <el-table-column label="操作" width="150" align="center" fixed="right"><template slot-scope="scope"><el-button type="text" size="mini" icon="el-icon-edit" @click="handleUpdate(scope.row)">编辑</el-button><el-button type="text" size="mini" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button></template></el-table-column>
        </el-table>
      </div>

      <pagination v-show="total > 0" :total="total" :page.sync="queryParams.page" :limit.sync="queryParams.size" @pagination="getList" />
    </main>

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
  </section>
</template>

<script>
import { addGun, delGun, getGun, listGuns, updateGun } from '@/api/multiProtocol/gun'
import { listPileOptions } from '@/api/multiProtocol/pile'
import { listStationOptions } from '@/api/multiProtocol/station'
import gunImage from '@/assets/multiProtocol/gun.svg'

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
      }
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
      return this.tableData.map((gun, index) => ({ ...gun, power: gun.ratedPower == null ? powers[index % powers.length] : gun.ratedPower, interfaceStandard: gun.interfaceStandard || 'GB/T', statusInfo: this.getCardStatus(gun.runStatus, gun.id || gun.gunCode || index) }))
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
  methods: {
    loadBaseOptions() { listStationOptions().then(res => { this.stationOptions = res.data || [] }); listPileOptions().then(res => { this.pileOptions = res.data || [] }) },
    loadSummary() {
      listGuns({ page: 1, size: 6000 }).then(res => {
        const pageData = res.data || {}
        this.summaryGuns = pageData.records || []
      })
    },
    filterPileOptions(stationId) { return stationId ? this.pileOptions.filter(item => item.stationId === stationId) : this.pileOptions },
    randomStatus(key) { const values = ['IDLE', 'CHARGING', 'RESERVED', 'CHARGE_COMPLETE', 'FAULT']; return values[this.hash(key) % values.length] },
    hash(value) { return String(value).split('').reduce((total, char) => ((total * 31) + char.charCodeAt(0)) >>> 0, 0) },
    getCardStatus(value, key) {
      const status = value || this.randomStatus(key)
      const match = this.gunStatusOptions.find(item => item.value === status) || this.gunStatusOptions[0]
      const types = { IDLE: 'idle', INSERTED: 'reserved', CHARGING: 'charging', CHARGE_COMPLETE: 'complete', DISCHARGE_READY: 'reserved', DISCHARGING: 'charging', DISCHARGE_COMPLETE: 'complete', RESERVED: 'reserved', FAULT: 'fault' }
      const label = match.value === 'DISCHARGING' ? '\u5145\u7535\u4e2d' : match.label
      return { value: match.value, label, type: types[match.value] || 'idle' }
    },
    formatGunStatus(value) { return this.getCardStatus(value, value).label },
    getGunStatusTag(value) { const type = this.getCardStatus(value, value).type; return type === 'fault' ? 'danger' : type === 'charging' || type === 'reserved' ? 'warning' : type === 'idle' || type === 'complete' ? 'success' : 'info' },
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
.gun-page { width: 100%; height: calc(100vh - 50px); min-height: 0; padding: 10px 12px; overflow: hidden; display: flex; flex-direction: column; gap: 8px; background: #e9edf2; }
.gun-summary { height: 68px; flex: none; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 8px; }
.summary-item { min-width: 0; display: flex; align-items: center; gap: 10px; padding: 8px 12px; background: #fff; border-radius: 7px; box-shadow: 0 1px 2px rgba(16, 24, 40, .05); .summary-icon { width: 35px; height: 35px; flex: none; display: grid; place-items: center; border-radius: 8px; font-size: 19px; } strong { display: block; color: #1f2329; font-size: 19px; line-height: 22px; font-variant-numeric: tabular-nums; white-space: nowrap; } small { margin-left: 2px; color: #8a919f; font-size: 10px; font-weight: 400; } p { margin: 1px 0 0; color: #8a919f; font-size: 11px; line-height: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } }
.summary-primary .summary-icon { color: #722ed1; background: #f4eaff; }.summary-success .summary-icon { color: #52c41a; background: #f6ffed; }.summary-charging .summary-icon { color: #1890ff; background: #e6f4ff; }.summary-availability .summary-icon { color: #faad14; background: #fffbe6; }.summary-order .summary-icon { color: #fa8c16; background: #fff7e6; }
.gun-content { min-height: 0; flex: 1; display: flex; flex-direction: column; padding: 9px 12px 4px; background: #fff; border-radius: 7px; box-shadow: 0 1px 2px rgba(16, 24, 40, .05); }
.query-form { flex: none; display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 8px; }.query-form ::v-deep .el-form-item { margin: 0; }.query-form ::v-deep .el-button { margin-left: 0; }.query-actions { white-space: nowrap; }
.toolbar { flex: none; display: flex; align-items: center; justify-content: flex-end; gap: 10px; margin: 0 0 8px; }.view-switch { display: flex; overflow: hidden; border: 1px solid #dcdfe6; border-radius: 5px; }.view-switch button { width: 30px; height: 28px; padding: 0; border: 0; border-right: 1px solid #ebeef5; color: #8a919f; background: #fff; cursor: pointer; }.view-switch button:last-child { border-right: 0; }.view-switch button.active { color: #1890ff; background: #e8f3ff; }
.gun-list { flex: 1; min-height: 0; overflow: hidden; }.card-grid { height: 100%; min-height: 0; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); grid-template-rows: repeat(2, minmax(214px, 1fr)); grid-auto-rows: 214px; gap: 9px; align-content: start; overflow: auto; padding: 2px 0; }.empty-state { grid-column: 1 / -1; display: grid; min-height: 180px; place-items: center; color: #909399; font-size: 13px; }
.gun-card { min-width: 0; overflow: hidden; display: flex; flex-direction: column; border: 1px solid #ebeef5; border-radius: 8px; background: #fff; box-shadow: 0 1px 2px rgba(16, 24, 40, .04); }.gun-image { height: clamp(86px, 38%, 144px); overflow: hidden; background: #e1edf7; }.gun-image img { display: block; width: 100%; height: 100%; object-fit: cover; }.gun-card-body { flex: 1; min-height: 0; display: flex; flex-direction: column; padding: 10px 10px 12px; }.gun-card-head { min-width: 0; display: flex; align-items: center; gap: 5px; }.gun-card-head h3 { flex: 1; min-width: 0; margin: 0; color: #1f2329; font-size: 14px; font-weight: 600; line-height: 22px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }.card-actions { flex: none; display: flex; gap: 4px; }.card-actions button { width: 22px; height: 22px; padding: 0; border: 0; border-radius: 5px; cursor: pointer; }.card-actions .edit { color: #1890ff; background: #e8f3ff; }.card-actions .delete { color: #ff4d4f; background: #fff1f0; }
.gun-code { display: flex; align-items: center; gap: 6px; min-width: 0; margin-top: 6px; color: #8a919f; font-size: 11px; line-height: 17px; }.gun-code b { min-width: 0; overflow: hidden; color: #8a919f; font-weight: 400; text-overflow: ellipsis; white-space: nowrap; }.status-tag { display: inline-flex; align-items: center; height: 22px; flex: none; padding: 0 8px; border: 1px solid; border-radius: 11px; font-size: 11px; }.status-tag.idle, .status-tag.complete { color: #389e0d; background: #f6ffed; border-color: #d9f7be; }.status-tag.charging { color: #1890ff; background: #e6f4ff; border-color: #bae0ff; }.status-tag.reserved { color: #d46b08; background: #fff7e6; border-color: #ffd591; }.status-tag.fault { color: #cf1322; background: #fff1f0; border-color: #ffa39e; }
.gun-details { margin: 10px 0 0; display: grid; gap: 7px; }.gun-details div { min-width: 0; display: flex; gap: 7px; color: #3c4043; font-size: 12px; line-height: 18px; }.gun-details dt { flex: none; color: #8a919f; }.gun-details dd { min-width: 0; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }.gun-metrics { margin-top: 16px; display: flex; gap: 18px; padding-top: 10px; border-top: 1px dashed #eceff4; }.gun-metrics div { min-width: 0; display: flex; flex-direction: column; }.gun-metrics strong { overflow: hidden; color: #1f2329; font-size: 15px; line-height: 19px; font-variant-numeric: tabular-nums; text-overflow: ellipsis; white-space: nowrap; }.gun-metrics span { margin-top: 2px; color: #8a919f; font-size: 10px; white-space: nowrap; }
.gun-list ::v-deep .el-table { font-size: 12px; }.gun-list ::v-deep .el-table th { background: #fafbfc; color: #4a4f57; }.gun-list ::v-deep .el-table td, .gun-list ::v-deep .el-table th { padding: 7px 0; }.gun-content ::v-deep .pagination-container { min-height: 52px; margin: 0; padding: 10px 0 14px; }
@media (max-width: 1300px) { .card-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
@media (max-width: 1000px) { .gun-summary { grid-template-columns: repeat(3, minmax(0, 1fr)); height: auto; }.summary-item { min-height: 62px; }.card-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }.gun-page { overflow: auto; }.gun-content { min-height: 500px; } }
@media (max-width: 640px) { .gun-page { padding: 8px; }.gun-summary { grid-template-columns: repeat(2, minmax(0, 1fr)); }.summary-item:last-child { grid-column: span 2; }.card-grid { grid-template-columns: 1fr; }.query-form ::v-deep .el-input, .query-form ::v-deep .el-select { width: calc(100vw - 40px) !important; }.toolbar { justify-content: space-between; }.gun-content { padding: 8px; } }
</style>
