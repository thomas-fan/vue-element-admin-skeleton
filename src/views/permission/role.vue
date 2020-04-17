<template>
  <div class="app-container">
    <el-button type="primary" @click="handleAddRole">新增角色</el-button>

    <el-table :data="roleList" style="width: 100%;margin-top:30px;" border>
      <el-table-column align="center" label="ID" width="220">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="角色名" width="220">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="角色描述" width="220">
        <template slot-scope="scope">
          {{ scope.row.description }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="角色范围" width="220">
        <template slot-scope="scope">
          {{ scope.row.guard_name }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope)">编辑</el-button>
          <el-button size="small" @click="handleAssignPermissions(scope)">分配权限</el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :visible.sync="roleDialogVisible" :title="roleDialogType==='edit'?'编辑角色':'新增角色'">
      <el-form :model="role" label-width="80px" label-position="left">
        <el-form-item label="角色标识">
          <el-input v-model="role.name" placeholder="角色标识名"/>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input
            v-model="role.description"
            type="textarea"
            placeholder="角色描述"
          />
        </el-form-item>
        <el-form-item label="角色范围">
          <el-select v-model="role.guard_name">
            <el-option
              v-for="item in guardNames"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="roleDialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmRole">确认</el-button>
      </div>
    </el-dialog>

    <el-dialog
      :visible.sync="assignPermissionVisible"
      :title="permissionTitle">
      <el-checkbox
        @change="handleCheckAllChange"
        :indeterminate="isIndeterminate"
        v-model="checkAllPermissions">全选</el-checkbox>
      <div style="margin: 15px 0;"></div>
      <el-checkbox-group v-model="currentRolePermissions"
                         @change="handlePermissionChange">
        <el-checkbox
          v-for="permission in permissions"
          :key="permission.id"
          :label="permission.name">{{ permission.description }}</el-checkbox>
      </el-checkbox-group>
      <div style="text-align:right;">
        <el-button type="danger" @click="assignPermissionVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmPermission">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {deepClone} from '../../utils'
import {createRole, deleteRole, getRolePermissions, getRoles, setRolePermissions, updateRole} from "../../api/role"
import {getPermissions} from "../../api/permission"

const defaultRole = {
  id: '',
  name: '',
  description: '',
  guard_name: 'admin',
}

export default {
  data() {
    return {
      role: Object.assign({}, defaultRole),
      guardNames: [{ value: 'admin', label: '后台' }],
      permissionTitle: '分配权限',
      routes: [],
      roleList: [],
      permissions: [],
      permissionKeys: [],
      currentRoleId: [],
      currentRolePermissions: [],
      roleDialogVisible: false,
      assignPermissionVisible: false,
      isIndeterminate: false,
      checkAllPermissions: false,
      roleDialogType: 'new',
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
    this.getRoles()
    this.getPermissions()
  },
  methods: {
    async getRoles() {
      const res = await getRoles()
      this.roleList = res.data
    },
    async getPermissions() {
      const res = await getPermissions()
      this.permissions = res.data
      this.permissionKeys = res.data.map(permission => {
        return permission.name
      })
    },
    async getRolePermissions(id) {
      this.resetRolePermissions()
      const res = await getRolePermissions(id)
      this.currentRolePermissions = res.data.map(permission => {
        return permission.name
      })
      this.currentRoleId = id
      this.checkAllPermissions = this.currentRolePermissions.length === this.permissions.length
      this.isIndeterminate = this.currentRolePermissions.length > 0 && this.currentRolePermissions.length < this.permissions.length
    },
    resetRolePermissions() {
      this.currentRolePermissions = []
      this.currentRoleId = ''
    },
    handlePermissionChange(value) {
      let checkedCount = value.length
      this.checkAllPermissions = checkedCount === this.permissions.length
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.permissions.length
    },
    handleCheckAllChange(val) {
      this.currentRolePermissions = val ? this.permissionKeys : []
      this.isIndeterminate = false
    },
    handleAssignPermissions(scope) {
      let role = scope.row
      this.getRolePermissions(role.id)
      this.assignPermissionVisible = true
    },
    handleAddRole() {
      this.role = Object.assign({}, defaultRole)
      this.roleDialogType = 'new'
      this.roleDialogVisible = true
    },
    handleEdit(scope) {
      this.roleDialogType = 'edit'
      this.roleDialogVisible = true
      this.checkStrictly = true
      this.role = deepClone(scope.row)
    },
    handleDelete({ $index, row }) {
      this.$confirm('确定要删除选中角色?', 'Warning', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          await deleteRole(row.id)
          this.roleList.splice($index, 1)
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        })
        .catch(err => {
          console.error(err)
        })
    },
    confirmPermission(){
      const data = {
        permissions: this.currentRolePermissions
      }

      setRolePermissions(this.currentRoleId, data)
      this.assignPermissionVisible = false
      this.$notify({
        title: '分配权限成功!',
        dangerouslyUseHTMLString: true,
        type: 'success'
      })
    },
    async confirmRole() {
      const isEdit = this.roleDialogType === 'edit'

      if (isEdit) {
        await updateRole(this.role.id, this.role)
        for (let index = 0; index < this.roleList.length; index++) {
          if (this.roleList[index].id === this.role.id) {
            this.roleList.splice(index, 1, Object.assign({}, this.role))
            break
          }
        }
      } else {
        const { data } = await createRole(this.role)
        this.role.id = data.id
        this.role.name = data.name
        this.roleList.push(this.role)
      }

      const { description, guard_name, name } = this.role
      this.roleDialogVisible = false
      this.$notify({
        title: 'Success',
        dangerouslyUseHTMLString: true,
        message: `
            <div>角色名称: ${name}</div>
            <div>角色描述: ${description}</div>
            <div>角色范围: ${guard_name}</div>
          `,
        type: 'success'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
