import { decorator } from './base'
import log from '../../utils/logger'
import request from '../../utils/request'
import socket from '../../utils/socket'
import { MESSAGES_LIMIT } from '../../configs/index'

import * as T from '../mutation-types'

let mediaType = {
  text: -1,          // 文本
  audio: 0,          // 音频
  contact: 1,        // 名片
  document: 2,       // 文件
  geo: 3,            // 地理位置
  photo: 4,          // 图片
  video: 5,          // 视频
  channel: 6,        // 频道申请链接（频道名片）
  chargeChannel: 7,  // 经费群邀请消息
  personalCard: 8,   // 个人名片(除了自己的其他人)
  myCard: 9,         // 我的名片（带履历）
  link: 10,          // 网址
  note: 11           // 笔记消息（收藏分享）
}

// 取得指定大于 seq 的 limit 条消息 M10003
const getMessagesByChannelId = async (channelId, seq, limit, callback) => {
  let realSeq = seq - MESSAGES_LIMIT + 1
  if (realSeq <= 0) { // 处理最后一页的逻辑
    realSeq = 1
    limit = seq
  }
  let res = await request.get({
    url: '/v3/message/m10003',
    data: {
      channel_id: channelId,
      seq: realSeq,
      limit: limit
    }
  })
  callback(res, realSeq - 1)
}

const messageActions = decorator({

  // 清空 messages 数据
  clearMessages (dispatch) {
    dispatch(T.CLEAR_MESSAGES)
  },

  // 获取频道 messages，并保存至内存
  getMessages (dispatch, state, channelId, seq) {
    if (seq === 0) { // 加载完毕
      return
    }
    getMessagesByChannelId(channelId, seq, MESSAGES_LIMIT, (res, newSeq) => {
      dispatch(T.GET_MESSAGES, channelId, res.result, newSeq)
    })
  },

  // 获取指定 channel 的 message 的集合
  getCurMessage (dispatch, state, channelId) {
    dispatch(T.GET_CUR_MESSAGE, channelId)
  },

  toggleChannelSend (dispatch) {
    dispatch(T.TOGGLE_CHANNEL_SEND)
  },

  // 推送消息
  sendMessage (dispatch, state, type, channelId, content, extend, callback) {
    if (channelId === state.channel.curChannelId) {
      dispatch(T.CHANGE_CHANNEL_INDEX, channelId) // to channel store，自己发送的消息需要推到顶部，但是如果自己发送的图片在切换channel以后就不会再置顶
      dispatch(T.CHANNEL_INDEX_ACTIVE) // to channel sotre
    }
    dispatch(T.TOGGLE_CHANNEL_SEND) // to message store
    socket.emit('M10000', {
      channel_id: channelId,
      content: content,
      extend: extend,
      media_type: mediaType[type]
    }, (res) => {
      if (!res) {
        log.error('M10000:', res)
        return
      }
      callback && callback()
      // 去socketListener接受信息
    })
  }
}, 'message')

export default messageActions
