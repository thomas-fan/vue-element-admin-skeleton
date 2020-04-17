import request from '@/utils/request'

export function getPermissions() {
  return request({
    url: '/permissions',
    method: 'get'
  })
}

export function createPermission(data) {
  return request({
    url: '/permissions',
    method: 'post',
    data
  })
}

export function updatePermission(id, data) {
  return request({
    url: `/permissions/${id}`,
    method: 'patch',
    data
  })
}

export function deletePermission(id) {
  return request({
    url: `/permissions/${id}`,
    method: 'delete'
  })
}
