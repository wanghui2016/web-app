import { decorator } from './base'
import log from '../../utils/logger'
import request from '../../utils/request'

import {
  GET_QR,
  GET_IDENTIFYING_CODE,
  GET_VOICE,
  CHECK_CLIENT_SUBMIT_LOGIN,
  LOGIN_SUCCESS
} from '../mutation-types'

const loginActions = decorator({

  // 获取 qr
  getQr (dispatch, state) {
    let deviceId = state.globals.deviceId
    request.post({
      url: '/v2/l',
      data: {
        device_id: deviceId
      }
    }).then(
      (data) => {
        dispatch(GET_QR, data)
      },
      (err) => {
        log.error('getQr:', err)
      }
    )
  },

  // 检查客户端是否确认扫码登录
  checkClientSubmitLogin (dispatch, state) {
    let deviceId = state.globals.deviceId
    let qr = state.login.qr

    request.get({
      url: '/v2/l?qr=' + qr + '&device_id=' + deviceId
    }).then(
      (data) => {
        dispatch(CHECK_CLIENT_SUBMIT_LOGIN, data)
      },
      (err) => {
        log.error('checkClientSubmitLogin:', err)
      }
    )
  },

  // 获取登录手机验证码
  getIdentifyingCode (dispatch, state, phone, fn) {
    let type = state.type || 0
    request.get({
      url: '/v2/passport/vcode?phone=' + phone + '&type=' + type
    }).then(
      (data) => {
        if (data.code !== 0) {
          dispatch(GET_IDENTIFYING_CODE, data)
          fn && fn()
        } else {
          window.alert(data.message)
        }
      },
      (err) => {
        log.error('getIdentifyingCode:', err)
      }
    )
  },

  // 获取语音验证码
  getVoice (dispatch, state, phone) {
    request.get({
      url: '/v2/passport/code/voice?phone=' + phone
    }).then(
      (data) => {
        dispatch(GET_VOICE, data)
      },
      (err) => {
        log.error('getVoice:', err)
      }
    )
  },

  // 登录成功，进入系统
  loginSuccess (dispatch, state) {
    dispatch(LOGIN_SUCCESS)
  },

  // 手机号码登录验证，进入系统
  phoneLogin (dispatch, state, data, fn) {
    request.post({
      url: '/v2/passport/sign-in',
      data: data
    }).then(
      (data) => {
        if (data.code === 0) {
          window.alert(data.message)
          return false
        }
        dispatch(LOGIN_SUCCESS)
        dispatch(CHECK_CLIENT_SUBMIT_LOGIN, data)
        fn && fn()
      },
      (err) => {
        log.error('loginSuccess2:', err)
      }
    )
  }
}, 'login')

export default loginActions
