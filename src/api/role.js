import request from '@/utils/request'

export function getRoles() {
  return request({
    url: '/roles',
    method: 'get'
  })
}

export function createRole(data) {
  return request({
    url: '/roles',
    method: 'post',
    data
  })
}

export function updateRole(id, data) {
  return request({
    url: `/roles/${id}`,
    method: 'patch',
    data
  })
}

export function deleteRole(id) {
  return request({
    url: `/roles/${id}`,
    method: 'delete'
  })
}

export function getRolePermissions(id) {
  return request({
    url: `/roles/${id}/permissions`,
    method: 'get',
  })
}

export function setRolePermissions(id, data) {
  return request({
    url: `/roles/${id}/permissions`,
    method: 'put',
    data
  })
}
