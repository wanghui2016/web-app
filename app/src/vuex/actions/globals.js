import socket from '../../utils/socket'
import storage from '../../utils/storage'
import { decorator } from './base'
import { SOCKET_URI, USER_INFO_KEY } from '../../configs/'
import request from '../../utils/request'

import * as T from '../mutation-types'

const singleChat = async (personId, callback) => {
  let res = await request.get({
    url: '/v3/channel/c30001',
    data: {
      to: personId
    }
  })
  callback(res.result)
}

const getChannelById = async (channelId, callback) => {
  let res = await request.get({
    url: '/v3/channel/c10009',
    data: {
      channel_id: channelId
    }
  })
  callback(res.result)
}

const globalsActions = decorator({

  // 获取 device id
  getDeviceId (dispatch, state) {
    dispatch(T.GET_DEVICE_ID)
  },

  // 清除已存储的 device id
  deleteDeviceId (dispatch, state) {
    dispatch(T.DELETE_DEVICE_ID)
  },

  // 存储登录用户个人信息
  saveUserInfo (dispatch, state, userInfo) {
    dispatch(T.SAVE_USER_INFO, userInfo)
  },

  // 初始化Socket
  socketInit (dispatch, state, userInfo) {
    socket.init({
      deviceId: userInfo.device_id,
      token: userInfo.token,
      uri: SOCKET_URI,
      userId: userInfo.user_id
    })
  },

  // 监听获取 message 的 Socket
  async socketListener (dispatch, state) {
    socket.on('M10000', (data) => { // todo：某个action可能会操作多个sotre，这里的decorator需要再优化
      let channelId = data.channel_id
      let userInfo = storage.get(USER_INFO_KEY)

      if (!state.channel.channels[channelId]) {
        if (userInfo.user_id === data.creator) { // 如果该条消息是自己在手机端发送的
          getChannelById(channelId, (channelItem) => {
            dispatch(T.ADD_NEW_CHANNEL, channelItem) // to channel
          })
        } else { // 如果 channelList 中没有该 channel
          singleChat(data.creator, (channelItem) => {
            dispatch(T.ADD_NEW_CHANNEL, channelItem) // to channel
          })
        }
      }
      dispatch(T.UPDATE_LAST_CUR_MESSAGE, state.channel.curChannelId, data) // 存储推送过来的信息到 curMessage & messages
      dispatch(T.UPDATE_CHANNELS_MESSAGE_NUM, data.channel_id) // update message_number of messages in store
      // dispatch(T.UPDATE_CHANNEL_LAST_MESSAGE, state.channel.curChannelId, data) // 更新 channels 中的 lastMessage & lastMessageCreatedAt

      if (userInfo.user_id !== data.creator) {
        dispatch(T.UPDATE_CHANNELS_UNREAD, data.channel_id) // to channel store, 更新未读数（只针对非当前curChannelId）
        !!state.channel.channels[channelId] && dispatch(T.CHANGE_CHANNEL_INDEX, data.channel_id) // channel 置顶非自己发的消息
      }
    })

    socket.on('M11000', (data) => {
      dispatch(T.PUT_IN_MESSAGE_ID, data) // 对m10000存储的信息进行补充ID
    })

    socket.on('PING', data => { // 创建初始单聊，需要自己通过PING事件去获取信息
      socket.emit('PING', data, () => {})
    })

    socket.on('P10000', (data) => {
      switch (data.action) {
        case 5:  // 离开(主动退出和被动踢出) 向离开者推送
          break
        case 6:  // 有人离开频道 向频道中其他人推送离开者id
          break
        case 7:  // 有人加入频道 向频道中其他人推送加入者id
          break
        case 8:  // 小黑板上面发送消息
          if (state.channel.curChannelId === data.channel_id) {
            dispatch(T.SEND_BLACK_BOARD, data)
          }
          break
        case 9:  // 开启/关闭小黑板
          break
        case 11: // 开启直播
          dispatch(T.OPEN_LIVE, data)
          break
        case 12: // 设置全体禁言
          dispatch(T.SET_CHAT_FORBBIDEN, data)
          break
        case 14: // 关闭直播
          dispatch(T.CLOSE_LIVE, data)
          break
      }
    })
  }
}, 'globals')

export default globalsActions
