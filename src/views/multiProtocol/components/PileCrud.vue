<template>
  <div class="mp-crud-page">
    <el-form
      ref="queryForm"
      :model="queryParams"
      size="small"
      :inline="true"
      label-width="90px"
      class="query-form"
    >
      <el-form-item label="充电桩名称">
        <el-input
          v-model.trim="queryParams.pileName"
          placeholder="请输入充电桩名称"
          clearable
          style="width: 220px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="充电桩编码">
        <el-input
          v-model.trim="queryParams.pileCode"
          placeholder="请输入充电桩编码"
          clearable
          style="width: 220px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="所属站点">
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
      <el-form-item label="协议类型">
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
      <el-form-item label="状态">
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
      <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd">新增充电桩</el-button>
    </div>

    <el-table v-loading="loading" :data="tableData" border>
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
          <el-tag :type="scope.row.status === 'ONLINE' ? 'success' : 'info'" size="mini">
            {{ formatPileStatus(scope.row.status) }}
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

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.page"
      :limit.sync="queryParams.size"
      @pagination="getList"
    />

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
  </div>
</template>

<script>
import { listSupportedProtocols } from '@/api/multiProtocol/protocol'
import { listStationOptions } from '@/api/multiProtocol/station'
import { addPile, delPile, getPile, listPiles, updatePile } from '@/api/multiProtocol/pile'

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
      stationOptions: [],
      protocolOptions: [],
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
    }
  },
  created() {
    this.loadStationOptions()
    this.loadProtocolOptions()
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
        }).finally(() => {
          this.submitLoading = false
        })
      })
    }
  }
}
</script>

<style scoped>
.mp-crud-page {
  background: #fff;
  padding: 16px;
}

.query-form {
  margin-bottom: 8px;
}

.toolbar {
  margin-bottom: 12px;
}
</style>
