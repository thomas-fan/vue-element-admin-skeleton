<template>
  <div class="app-container">
    <el-button type="primary" @click="handleAddPermission">新增权限</el-button>

    <el-table :data="permissionList" style="width: 100%;margin-top:30px;" border>
      <el-table-column align="center" label="ID" width="220">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="权限名" width="220">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="权限描述" width="220">
        <template slot-scope="scope">
          {{ scope.row.description }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="权限范围" width="220">
        <template slot-scope="scope">
          {{ scope.row.guard_name }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑权限':'新增权限'">
      <el-form :model="permission" label-width="80px" label-position="left">
        <el-form-item label="权限标识">
          <el-input v-model="permission.name" placeholder="权限标识名" />
        </el-form-item>
        <el-form-item label="权限描述">
          <el-input
            v-model="permission.description"
            type="textarea"
            placeholder="权限描述"
          />
        </el-form-item>
        <el-form-item label="权限范围">
          <el-select v-model="permission.guard_name">
            <el-option
              v-for="item in guardNames"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmPermission">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// import path from 'path'
import { deepClone } from '@/utils'
import { getPermissions, createPermission, updatePermission, deletePermission } from '@/api/permission'

const defaultPermission = {
  id: '',
  name: '',
  description: '',
  guard_name: 'admin'
}

export default {
  data() {
    return {
      permission: Object.assign({}, defaultPermission),
      guardNames: [{ value: 'admin', label: '后台' }],
      routes: [],
      permissionList: [],
      dialogVisible: false,
      dialogType: 'new',
      checkStrictly: false,
      defaultProps: {
        children: 'children',
        label: 'title'
      }
    }
  },
  computed: {
    routesData() {
      return this.routes
    }
  },
  created() {
    this.getPermissions()
  },
  methods: {
    async getPermissions() {
      const res = await getPermissions()
      this.permissionList = res.data
    },
    handleAddPermission() {
      this.permission = Object.assign({}, defaultPermission)
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    handleEdit(scope) {
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.checkStrictly = true
      this.permission = deepClone(scope.row)
    },
    handleDelete({ $index, row }) {
      this.$confirm('确定要删除选中权限?', 'Warning', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      })
        .then(async() => {
          await deletePermission(row.id)
          this.permissionList.splice($index, 1)
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        })
        .catch(err => {
          console.error(err)
        })
    },
    async confirmPermission() {
      const isEdit = this.dialogType === 'edit'

      if (isEdit) {
        await updatePermission(this.permission.id, this.permission)
        for (let index = 0; index < this.permissionList.length; index++) {
          if (this.permissionList[index].id === this.permission.id) {
            this.permissionList.splice(index, 1, Object.assign({}, this.permission))
            break
          }
        }
      } else {
        const { data } = await createPermission(this.permission)
        this.permission.id = data.id
        this.permission.name = data.name
        this.permissionList.push(this.permission)
      }

      const { description, guard_name, name } = this.permission
      this.dialogVisible = false
      this.$notify({
        title: 'Success',
        dangerouslyUseHTMLString: true,
        message: `
            <div>权限名称: ${name}</div>
            <div>权限描述: ${description}</div>
            <div>权限范围: ${guard_name}</div>
          `,
        type: 'success'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
