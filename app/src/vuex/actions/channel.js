import { decorator } from './base'
import request from '../../utils/request'
import { arrToObjByKey } from '../../utils/enhance'
import * as T from '../mutation-types'

const getMessageBySeqChannelId = async (params) => {
  let res = await request.get({
    url: '/v3/message/m10003',
    data: {
      channel_id: params.channelId,
      seq: params.seq,
      limit: 1
    }
  })
  return res.result
}

const channelActions = decorator({

  // 获取聊天列表
  async getChannels (dispatch, state) {
    let res = await request.get({ url: '/v3/channel/c10008' })
    let channels = res.result

    channels = arrToObjByKey('id', channels)

    // 获取每个 channel 最后一条 message
    let seqs = []

    for (let key in channels) {
      let item = channels[key]
      seqs.push({
        channelId: item.id,
        seq: item.message_number
      })
    }

    let lastMes = {}
    let lastMessages = {}

    for (let item of seqs) {
      lastMes = await getMessageBySeqChannelId({
        channelId: item.channelId,
        seq: item.seq
      })
      channels[item.channelId].lastMessage = lastMes[0]
      lastMessages[item.channelId] = lastMes[0]
    }

    dispatch(T.GET_CHANNELS, channels)
    dispatch(T.GET_LAST_MESSAGE_OF_CHANNELS, lastMessages)
  },

  // 切换会话
  switchChannel (dispatch, state, curChannelId) {
    dispatch(T.SET_CUR_CHANNEL, curChannelId)
  },

  // 获取单聊
  async singleChat (dispatch, state, personId) {
    let res = await request.get({
      url: '/v3/channel/c30001',
      data: {
        to: personId
      }
    })
    dispatch(T.SINGLE_CHAT, res.result)
  },

  // 获取 channel 的私聊保护状态
  async getPublicStatus (dispatch, state, channelId) {
    let res = await request.get({
      url: '/v3/channel/c30003',
      data: {
        channel_id: channelId
      }
    })
    dispatch(T.GET_PUBLIC_STATUS, res.result)
  },

  // 获取 channel 人数
  async getChannelMembersCount (dispatch, state, channelId) {
    let res = await request.get({
      url: '/v3/channel/c10012',
      data: {
        channel_id: channelId
      }
    })
    dispatch(T.GET_CHANNEL_MEMBERS_COUNT, channelId, res.result)
  },

  // 同步本channel最后阅读消息seq
  async setSeqOfChannel (dispatch, state, channelId, tseq) {
    if (tseq) {
      await request.post({
        url: '/v3/channel/c10003',
        data: {
          tseq: tseq,
          channel_id: channelId
        }
      })
    }
    dispatch(T.SET_SEQ_OF_CHANNEL, channelId)
  },

  // 获取每个群的角色信息
  async getRoleInfoOfChannels (dispatch, state, channelIds) {
    let res = await request.post({
      url: '/v3/privilege/pr10003',
      data: {
        channel_ids: channelIds
      }
    })
    dispatch(T.GET_ROLE_INFO_OF_CHANNELS, res.result)
  }

}, 'channel')

export default channelActions
