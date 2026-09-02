import request from '@/utils/mp-request'

export function listStations(params) {
  return request({
    url: '/api/stations',
    method: 'get',
    params
  })
}

export function getStation(id) {
  return request({
    url: `/api/stations/${id}`,
    method: 'get'
  })
}

export function addStation(data) {
  return request({
    url: '/api/stations',
    method: 'post',
    data
  })
}

export function updateStation(id, data) {
  return request({
    url: `/api/stations/${id}`,
    method: 'put',
    data
  })
}

export function delStation(id) {
  return request({
    url: `/api/stations/${id}`,
    method: 'delete'
  })
}

export function listStationOptions() {
  return request({
    url: '/api/stations/options',
    method: 'get'
  })
}
