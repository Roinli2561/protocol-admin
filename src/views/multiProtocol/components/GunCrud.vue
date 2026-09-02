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
      <el-form-item label="充电枪名称">
        <el-input
          v-model.trim="queryParams.gunName"
          placeholder="请输入充电枪名称"
          clearable
          style="width: 220px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="充电枪编号">
        <el-input
          v-model.trim="queryParams.gunNo"
          placeholder="请输入充电枪编号"
          clearable
          style="width: 180px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="充电枪编码">
        <el-input
          v-model.trim="queryParams.gunCode"
          placeholder="请输入充电枪编码"
          clearable
          style="width: 220px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="所属站点">
        <el-select v-model="queryParams.stationId" placeholder="请选择站点" clearable filterable style="width: 220px" @change="handleQueryStationChange">
          <el-option
            v-for="item in stationOptions"
            :key="item.id"
            :label="item.stationName || item.label"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="所属充电桩">
        <el-select v-model="queryParams.pileId" placeholder="请选择充电桩" clearable filterable style="width: 220px">
          <el-option
            v-for="item in queryPileOptions"
            :key="item.id"
            :label="item.pileName || item.label"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="运行状态">
        <el-select v-model="queryParams.runStatus" placeholder="请选择状态" clearable style="width: 160px">
          <el-option v-for="item in gunStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="toolbar">
      <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd">新增充电枪</el-button>
    </div>

    <el-table v-loading="loading" :data="tableData" border>
      <el-table-column label="序号" width="70" align="center">
        <template slot-scope="scope">
          <span>{{ (queryParams.page - 1) * queryParams.size + scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="充电枪名称" prop="gunName" min-width="160" show-overflow-tooltip />
      <el-table-column label="充电枪编号" prop="gunNo" min-width="130" show-overflow-tooltip />
      <el-table-column label="充电枪编码" prop="gunCode" min-width="160" show-overflow-tooltip />
      <el-table-column label="所属站点" prop="stationName" min-width="180" show-overflow-tooltip />
      <el-table-column label="所属充电桩" prop="pileName" min-width="180" show-overflow-tooltip />
      <el-table-column label="充电桩编码" prop="pileCode" min-width="160" show-overflow-tooltip />
      <el-table-column label="运行状态" prop="runStatus" width="120" align="center">
        <template slot-scope="scope">
          <el-tag :type="getGunStatusTag(scope.row.runStatus)" size="mini">
            {{ formatGunStatus(scope.row.runStatus) }}
          </el-tag>
        </template>
      </el-table-column>
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
            <el-form-item label="充电枪名称" prop="gunName">
              <el-input v-model.trim="form.gunName" placeholder="请输入充电枪名称" maxlength="100" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="充电枪编号" prop="gunNo">
              <el-input v-model.trim="form.gunNo" :disabled="!!form.id" placeholder="请输入充电枪编号" maxlength="64" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="充电枪编码" prop="gunCode">
              <el-input v-model.trim="form.gunCode" :disabled="!!form.id" placeholder="请输入充电枪编码" maxlength="64" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属站点" prop="stationId">
              <el-select v-model="form.stationId" placeholder="请选择站点" filterable style="width: 100%" @change="handleFormStationChange">
                <el-option
                  v-for="item in stationOptions"
                  :key="item.id"
                  :label="item.stationName || item.label"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="所属充电桩" prop="pileId">
              <el-select v-model="form.pileId" placeholder="请选择充电桩" filterable style="width: 100%">
                <el-option
                  v-for="item in formPileOptions"
                  :key="item.id"
                  :label="item.pileName || item.label"
                  :value="item.id"
                />
              </el-select>
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
import { addGun, delGun, getGun, listGuns, updateGun } from '@/api/multiProtocol/gun'
import { listPileOptions } from '@/api/multiProtocol/pile'
import { listStationOptions } from '@/api/multiProtocol/station'

const gunStatusOptions = [
  { label: '空闲', value: 'IDLE' },
  { label: '已插枪', value: 'INSERTED' },
  { label: '充电中', value: 'CHARGING' },
  { label: '充电完成', value: 'CHARGE_COMPLETE' },
  { label: '放电准备', value: 'DISCHARGE_READY' },
  { label: '放电中', value: 'DISCHARGING' },
  { label: '放电完成', value: 'DISCHARGE_COMPLETE' },
  { label: '预约中', value: 'RESERVED' },
  { label: '故障', value: 'FAULT' }
]

export default {
  name: 'GunCrud',
  data() {
    return {
      gunStatusOptions,
      loading: false,
      submitLoading: false,
      open: false,
      title: '',
      total: 0,
      tableData: [],
      stationOptions: [],
      pileOptions: [],
      queryParams: {
        page: 1,
        size: 10,
        gunName: undefined,
        gunNo: undefined,
        gunCode: undefined,
        stationId: undefined,
        pileId: undefined,
        runStatus: undefined
      },
      form: {},
      rules: {
        gunName: [
          { required: true, message: '请输入充电枪名称', trigger: 'blur' }
        ],
        gunNo: [
          { required: true, message: '请输入充电枪编号', trigger: 'blur' }
        ],
        gunCode: [
          { required: true, message: '请输入充电枪编码', trigger: 'blur' }
        ],
        stationId: [
          { required: true, message: '请选择所属站点', trigger: 'change' }
        ],
        pileId: [
          { required: true, message: '请选择所属充电桩', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    queryPileOptions() {
      return this.filterPileOptions(this.queryParams.stationId)
    },
    formPileOptions() {
      return this.filterPileOptions(this.form.stationId)
    }
  },
  created() {
    this.loadBaseOptions()
    this.getList()
  },
  methods: {
    loadBaseOptions() {
      listStationOptions().then(res => {
        this.stationOptions = res.data || []
      })
      listPileOptions().then(res => {
        this.pileOptions = res.data || []
      })
    },
    filterPileOptions(stationId) {
      if (!stationId) {
        return this.pileOptions
      }
      return this.pileOptions.filter(item => item.stationId === stationId)
    },
    formatGunStatus(value) {
      const match = this.gunStatusOptions.find(item => item.value === value)
      return match ? match.label : value || '-'
    },
    getGunStatusTag(value) {
      if (value === 'CHARGING' || value === 'DISCHARGING') {
        return 'warning'
      }
      if (value === 'FAULT') {
        return 'danger'
      }
      if (value === 'IDLE') {
        return 'success'
      }
      return 'info'
    },
    reset() {
      this.form = {
        id: undefined,
        gunName: undefined,
        gunNo: undefined,
        gunCode: undefined,
        stationId: undefined,
        pileId: undefined
      }
      this.resetForm('form')
    },
    getList() {
      this.loading = true
      listGuns(this.queryParams).then(res => {
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
        gunName: undefined,
        gunNo: undefined,
        gunCode: undefined,
        stationId: undefined,
        pileId: undefined,
        runStatus: undefined
      }
      this.getList()
    },
    handleQueryStationChange() {
      this.queryParams.pileId = undefined
    },
    handleFormStationChange() {
      this.form.pileId = undefined
    },
    handleAdd() {
      this.reset()
      this.title = '新增充电枪'
      this.open = true
    },
    handleUpdate(row) {
      this.reset()
      getGun(row.id).then(res => {
        this.form = Object.assign({}, this.form, res.data)
        this.title = '编辑充电枪'
        this.open = true
      })
    },
    handleDelete(row) {
      this.$confirm(`确认删除充电枪“${row.gunName}”吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => delGun(row.id)).then(() => {
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
          gunName: this.form.gunName,
          gunNo: this.form.gunNo,
          gunCode: this.form.gunCode,
          stationId: this.form.stationId,
          pileId: this.form.pileId
        }
        const request = this.form.id
          ? updateGun(this.form.id, payload)
          : addGun(payload)
        this.submitLoading = true
        request.then(() => {
          this.$modal.msgSuccess(this.form.id ? '编辑成功' : '新增成功')
          this.open = false
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
