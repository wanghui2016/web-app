import { set } from 'vue'
import * as T from '../mutation-types'
import array from 'lodash/array'

// initial state
const state = {
  messages: {},           // 所有 channel 的 messages 集合，作为存储用
  curMessage: [],         // 当前 channel 的 messages 集合，作为渲染用
  seqMessages: {},        // 所有 channel 的 messages seq 标记
  lastMessages: {},       // 每个 channel 的最后一条 message
  blackBoardMessage: {},  // 小黑板信息
  channelSendState: false // 发送消息的状态标志
}

// mutations
const mutations = {
  [T.GET_MESSAGES] (state, channelId, messages, newSeq) {
    let curMsg = state.messages[channelId]

    if (!curMsg) { // 首次点开 channel，对应 messages 为空的时候
      state.messages[channelId] = messages
    } else {       // 分页存储数据
      state.messages[channelId] = array.concat(messages, state.messages[channelId])
    }

    state.seqMessages[channelId] = newSeq
    if (newSeq === 1) {
      state.seqMessages[channelId] = 0
    }

    state.curMessage = state.messages[channelId]
  },

  [T.SEND_TEXT_MESSAGE] (state, message) { // 废弃
    set(state.lastMessages, message.channel_id, message)
    state.curMessage.push(message)
  },

  [T.GET_CUR_MESSAGE] (state, channelId) {
    let curMessage = state.messages[channelId]
    if (curMessage) {
      state.curMessage = curMessage
    } else {
      state.curMessage = []
    }
  },

  [T.CLEAR_MESSAGES] (state) {
    state.messages = {}
    state.curMessage = []
  },

  [T.UPDATE_LAST_CUR_MESSAGE] (state, curChannelId, message) {
    set(state.lastMessages, message.channel_id, message)
    if (curChannelId === message.channel_id) {
      state.curMessage.push(message)
    }
    // todo 如果后面做 message 缓存，这里需要修改 messages 的值
  },

  [T.PUT_IN_MESSAGE_ID] (state, message) {
    let channelId = message.channel_id
    let index = array.findIndex(state.messages[channelId], { tseq: message.tseq })
    if (index === -1) {
      return
    }
    state.messages[channelId][index].id = message.id
  },

  [T.GET_LAST_MESSAGE_OF_CHANNELS] (state, lastMessages) {
    state.lastMessages = lastMessages
  },

  [T.SEND_BLACK_BOARD] (state, data) {
    let index = array.findIndex(state.curMessage, {
      id: data.message_id
    })
    state.blackBoardMessage = state.curMessage[index]
  },

  [T.TOGGLE_CHANNEL_SEND] (state) {
    state.channelSendState = !state.channelSendState
  }
}

export default {
  state,
  mutations
}
