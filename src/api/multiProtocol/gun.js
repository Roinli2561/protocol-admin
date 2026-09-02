import request from '@/utils/mp-request'

export function listGuns(params) {
  return request({
    url: '/api/guns',
    method: 'get',
    params
  })
}

export function getGun(id) {
  return request({
    url: `/api/guns/${id}`,
    method: 'get'
  })
}

export function addGun(data) {
  return request({
    url: '/api/guns',
    method: 'post',
    data
  })
}

export function updateGun(id, data) {
  return request({
    url: `/api/guns/${id}`,
    method: 'put',
    data
  })
}

export function delGun(id) {
  return request({
    url: `/api/guns/${id}`,
    method: 'delete'
  })
}
