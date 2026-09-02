import request from '@/utils/mp-request'

export function listPiles(params) {
  return request({
    url: '/api/piles',
    method: 'get',
    params
  })
}

export function getPile(id) {
  return request({
    url: `/api/piles/${id}`,
    method: 'get'
  })
}

export function addPile(data) {
  return request({
    url: '/api/piles',
    method: 'post',
    data
  })
}

export function updatePile(id, data) {
  return request({
    url: `/api/piles/${id}`,
    method: 'put',
    data
  })
}

export function delPile(id) {
  return request({
    url: `/api/piles/${id}`,
    method: 'delete'
  })
}

export function listPileOptions() {
  return request({
    url: '/api/piles/options',
    method: 'get'
  })
}
