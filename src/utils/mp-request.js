import axios from 'axios'
import { Message } from 'element-ui'
import { getToken } from '@/utils/auth'

const service = axios.create({
  baseURL: process.env.VUE_APP_MP_API || '/mp-api',
  timeout: 20000
})

service.interceptors.request.use(
  config => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = 'Bearer ' + token
    }
    return config
  },
  error => Promise.reject(error)
)

service.interceptors.response.use(
  response => {
    const res = response.data
    if (res && Object.prototype.hasOwnProperty.call(res, 'success')) {
      if (!res.success) {
        const message = res.message || '请求失败'
        Message.error(message)
        return Promise.reject(new Error(message))
      }
      return res
    }
    return res
  },
  error => {
    const message = error.response?.data?.message || error.message || '请求失败'
    Message.error(message)
    return Promise.reject(error)
  }
)

export default service
