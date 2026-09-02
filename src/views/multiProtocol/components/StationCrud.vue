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
      <el-form-item label="充电站名称">
        <el-input
          v-model.trim="queryParams.stationName"
          placeholder="请输入充电站名称"
          clearable
          style="width: 220px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="充电站编码">
        <el-input
          v-model.trim="queryParams.stationCode"
          placeholder="请输入充电站编码"
          clearable
          style="width: 220px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="toolbar">
      <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd">新增充电站</el-button>
    </div>

    <el-table v-loading="loading" :data="tableData" border>
      <el-table-column label="序号" width="70" align="center">
        <template slot-scope="scope">
          <span>{{ (queryParams.page - 1) * queryParams.size + scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="充电站名称" prop="stationName" min-width="180" show-overflow-tooltip />
      <el-table-column label="充电站编码" prop="stationCode" min-width="160" show-overflow-tooltip />
      <el-table-column label="省" prop="province" min-width="100" show-overflow-tooltip />
      <el-table-column label="市" prop="city" min-width="100" show-overflow-tooltip />
      <el-table-column label="区县" prop="county" min-width="120" show-overflow-tooltip />
      <el-table-column label="详细地址" prop="address" min-width="220" show-overflow-tooltip />
      <el-table-column label="经纬度" min-width="180">
        <template slot-scope="scope">
          <span>{{ formatCoordinate(scope.row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createdTime" width="170" align="center">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createdTime) }}</span>
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
  </div>
</template>

<script>
import { addStation, delStation, getStation, listStations, updateStation } from '@/api/multiProtocol/station'
import { parseTime } from '@/utils/witos'

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
      queryParams: {
        page: 1,
        size: 10,
        stationName: undefined,
        stationCode: undefined,
        keyword: undefined
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
  },
  methods: {
    parseTime,
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
        keyword: undefined
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
