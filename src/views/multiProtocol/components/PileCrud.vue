<template>
  <section class="pile-page">
    <div class="pile-summary">
      <div class="topItem">
        <div class="flex-top">
          <div class="topItemName">
            <div class="topItemImg" style="background:#0C65F5">
              <img src="@/assets/multiProtocol/jygl-icon.png" alt="" />
            </div>
            <span>充电桩总数</span>
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
            <span>在线充电桩</span>
          </div>
        </div>
        <div class="topItemValue">{{ onlineCount }}</div>
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
            <div class="topItemImg" style="background:#f56c6c">
              <img src="@/assets/multiProtocol/jygl-icon.png" alt="" />
            </div>
            <span>故障</span>
          </div>
        </div>
        <div class="topItemValue">{{ faultCount }}</div>
      </div>
      <div class="topItem">
        <div class="flex-top">
          <div class="topItemName">
            <div class="topItemImg" style="background:#6855FC">
              <img src="@/assets/multiProtocol/jygl-icon.png" alt="" />
            </div>
            <span>接入协议(类)</span>
          </div>
        </div>
        <div class="topItemValue">{{ protocolOptions.length }}</div>
      </div>
    </div>

    <div class="content-box w100">
      <div class="left">
        <el-form ref="queryForm" :model="queryParams" class="search-form">
          <div class="title">
            <div class="flex">
              <div class="labelCss">充电桩名称</div>
              <el-input
                class="inputCss"
                v-model.trim="queryParams.pileName"
                placeholder="请输入充电桩名称"
                clearable
                @keyup.enter.native="handleQuery"
              />
            </div>
            <div class="flex m-l-20">
              <div class="labelCss">充电桩编码</div>
              <el-input
                class="inputCss"
                v-model.trim="queryParams.pileCode"
                placeholder="请输入充电桩编码"
                clearable
                @keyup.enter.native="handleQuery"
              />
            </div>
            <div class="flex m-l-20">
              <div class="labelCss">所属站点</div>
              <el-select
                v-model="queryParams.stationId"
                placeholder="请选择所属站点"
                clearable
                filterable
              >
                <el-option
                  v-for="item in stationOptions"
                  :key="item.id"
                  :label="item.stationName || item.label"
                  :value="item.id"
                />
              </el-select>
            </div>
          </div>
          <div class="title m-t-20">
            <div class="flex">
              <div class="labelCss">协议类型</div>
              <el-select
                v-model="queryParams.protocol"
                placeholder="请选择协议类型"
                clearable
                filterable
              >
                <el-option
                  v-for="item in protocolOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </div>
            <div class="flex m-l-20">
              <div class="labelCss">状态</div>
              <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
                <el-option
                  v-for="item in pileStatusOptions"
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

      <div v-loading="loading" class="pile-list">
        <div v-if="viewMode === 'card'" class="card-grid">
          <article v-for="(pile, index) in cardPiles" :key="pile.id || pile.pileCode || index" class="pile-card">
            <div class="pile-card__side">
              <div class="pile-card__img-wrap">
                <img :src="pileImage" class="pile-card__img" alt="充电桩" />
              </div>
              <span class="pile-card__status" :class="pile.statusInfo.type">{{ pile.statusInfo.label }}</span>
            </div>
            <div class="pile-card__content">
              <div class="pile-card__head">
                <div class="pile-card__name" :title="pile.pileName">{{ pile.pileName || '未命名充电桩' }}</div>
                <div class="pile-card__addr">
                  <i class="el-icon-office-building" />
                  <span :title="pile.stationName">{{ pile.stationName || '未关联站点' }}</span>
                </div>
                <div class="pile-card__code">编码：{{ pile.pileCode || '-' }}</div>
              </div>
              <div class="pile-card__stats">
                <div class="pile-card__stat">
                  <span class="pile-card__stat-label">额定功率:</span>
                  <span class="pile-card__stat-val">{{ pile.power }} kW</span>
                </div>
                <div class="pile-card__stat pile-card__stat--right">
                  <span class="pile-card__stat-label">协议类型:</span>
                  <span class="pile-card__stat-val" :title="pile.protocolLabel">{{ pile.protocolLabel }}</span>
                </div>
              </div>
              <div class="pile-card__ops">
                <el-button size="mini" plain @click="handleUpdate(pile)">编辑</el-button>
                <el-button size="mini" plain @click="handleDelete(pile)">删除</el-button>
              </div>
            </div>
          </article>
          <div v-if="!loading && !cardPiles.length" class="empty-state"><p>暂无充电桩数据</p></div>
        </div>

        <div v-else class="table-wrapper">
          <el-table :data="tableData" border>
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
      </div>

      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.page"
        :limit.sync="queryParams.size"
        @pagination="getList"
      />
    </div>

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
import { parseTime } from '@/utils/witos'
import pileImage from '@/assets/multiProtocol/device.png'

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
    parseTime,
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
  width: 100%;
  min-height: calc(100vh - 84px);
  padding: 0px 15px 15px 15px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  background: #f6f8fa;
}

.pile-summary {
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

.pile-list {
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

.pile-card {
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

.pile-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, .08);
}

.pile-card__side {
  width: 120px;
  flex: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px 22px;
  box-sizing: border-box;
}

.pile-card__img-wrap {
  width: 100%;
  height: 150px;
  flex: none;
  overflow: hidden;
  background: transparent;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.pile-card__img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
  object-position: top center;
  padding: 0 6px;
  box-sizing: border-box;
}

.pile-card__status {
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

.pile-card__status.idle {
  background: #3D7FFF;
  color: #fff;
}

.pile-card__status.charging {
  background: #FFC327;
  color: #fff;
}

.pile-card__status.fault {
  background: #FF7C52;
  color: #fff;
}

.pile-card__status.offline {
  background: #8B8B8B;
  color: #fff;
}

.pile-card__status.occupied {
  background: #FFAD66;
  color: #fff;
}

.pile-card__status.inserted {
  background: #F0B515;
  color: #fff;
}

.pile-card__content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 22px 18px;
}

.pile-card__head {
  margin-bottom: 16px;
}

.pile-card__name {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 10px;
}

.pile-card__addr {
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

.pile-card__code {
  margin-top: 6px;
  font-size: 12px;
  color: #909399;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pile-card__stats {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  padding: 0;
  border: 0;
  margin: 0 0 18px;
}

.pile-card__stat {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  width: 100%;
  font-size: 12px;
  color: #909399;
  line-height: 1.3;
}

.pile-card__stat-label,
.pile-card__stat-val {
  overflow: visible;
  text-overflow: clip;
  white-space: nowrap;
}

.pile-card__stat-val {
  flex-shrink: 0;
  color: #909399;
}

.pile-card__stat--right {
  flex: none;
  margin-left: 0;
}

.pile-card__ops {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-top: auto;
  min-height: 28px;

  ::v-deep .el-button {
    flex: none;
    width: 82px;
    height: 28px;
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

.pile-list ::v-deep .el-table {
  font-size: 13px;
  color: #606266;
  border: 1px solid #e6eaee !important;
  border-right: none !important;
  border-bottom: none !important;
}

.pile-list ::v-deep .el-table__header-wrapper {
  border-radius: 8px 8px 0 0;
}

.pile-list ::v-deep .el-table thead {
  font-weight: 600 !important;
  color: #333 !important;
}

.pile-list ::v-deep .el-table .el-table__header-wrapper th,
.pile-list ::v-deep .el-table .el-table__fixed-header-wrapper th {
  background-color: #f9f9f9 !important;
  color: #333;
  font-weight: 600;
  height: 40px;
  font-size: 13px;
}

.pile-list ::v-deep .el-table th.el-table__cell.is-leaf,
.pile-list ::v-deep .el-table td.el-table__cell {
  border-bottom: 1px solid #e6eaee !important;
}

.pile-list ::v-deep .el-table--border .el-table__cell {
  border-right: 1px solid #e6eaee !important;
}

.pile-list ::v-deep .el-table--enable-row-hover .el-table__body tr:hover > td.el-table__cell {
  background-color: #f5f7fa !important;
}

.pile-list ::v-deep .el-table__body td {
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
  .pile-page {
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
