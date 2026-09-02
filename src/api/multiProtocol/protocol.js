import request from '@/utils/mp-request'

export function listSupportedProtocols() {
  return request({
    url: '/api/protocols/supported',
    method: 'get'
  })
}
