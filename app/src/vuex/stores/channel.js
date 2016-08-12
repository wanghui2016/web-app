// sotre - globals: 存储 channel 的状态
import { set } from 'vue'
import * as T from '../mutation-types'
import { arrToObjByKey } from '../../utils/enhance'
import array from 'lodash/array'

// initial state
const state = {
  channels: {},             // 所有聊天列表数据
  channelsIndex: [],
  channelIndexActive: 0,
  /*
    channels: {
      ...channelId: { ...channelItems }
    }
  */
  channelsMembersCount: {}, // 群组人数数据
  curChannelId: '',         // 当前选中的 channel 的 id
  channelRoleInfo: {},
  chatForbiddenStatus: 0,   // 利用简单数据结构计数器来做变监听
  channelsLive: {},
  channelsLiveStatus: 0,
  curChannelPublicStatus: null,
  topChannels: [], // 置顶会话
  normalChannelsWithMes: [], // 普通会话（有最后一条消息的）
  normalChannelsWithoutMes: [] // 普通会话（没有最后一条消息的）
}

let sortArrayObject = (name) => {
  return (o, p) => {
    let a, b
    if (typeof o === 'object' && typeof p === 'object' && o && p) {
      a = o[name]
      b = p[name]
      if (a === b) {
        return 0
      }
      if (typeof a === typeof b) {
        return a < b ? 1 : -1
      }
      return typeof a < typeof b ? 1 : -1
    } else {
      throw new Error('sortArrayObject error')
    }
  }
}

const sortTopChannel = (channels) => {
  channels.sort((item1, item2) => {
    return new Date(item1.sort_time) < new Date(item2.sort_time)
  })
  return channels
}

const sortNormalChannelWithMes = (channels) => {
  for (let item of channels) {
    item.lastMessageCreatedAt = new Date(item.lastMessage.created_at).getTime()
  }
  channels.sort(sortArrayObject('lastMessageCreatedAt'))
  return channels
}

// mutations
const mutations = {
  [T.GET_CHANNELS] (state, channels) {
    for (let key in channels) {
      let item = channels[key]
      item.unRead = 0 // web端初始下，不再统计未读数 item.message_number - item.latest_read

      if (item.is_top === 1) {
        state.topChannels.push(item)
      } else if (item.lastMessage) {
        state.normalChannelsWithMes.push(item)
      } else {
        state.normalChannelsWithoutMes.push(item)
      }
    }

    state.topChannels = sortTopChannel(state.topChannels)
    state.normalChannelsWithMes = sortNormalChannelWithMes(state.normalChannelsWithMes)

    let sortedChannels = array.concat(state.topChannels, state.normalChannelsWithMes, state.normalChannelsWithoutMes)
    let channelsIndex = []

    for (let item of sortedChannels) {
      channelsIndex.push(item.id)
    }

    state.channels = arrToObjByKey('id', sortedChannels)
    state.channelsIndex = channelsIndex
    // storage.set('channel-index', state.channelsIndex)
  },

  [T.SET_CUR_CHANNEL] (state, curChannelId) {
    state.curChannelId = curChannelId
  },

  [T.UPDATE_CHANNELS_MESSAGE_NUM] (state, channelId) {
    if (state.channels && state.channels[channelId]) {
      state.channels[channelId].message_number += 1
    }
  },

  [T.SINGLE_CHAT] (state, singleChat) {
    let channel = singleChat
    let curChannelId = channel.id

    if (channel.is_top === 1) {
      array.remove(state.topChannels, (o) => o.id === curChannelId)
      state.topChannels.unshift(channel)
    } else if (channel.lastMessage) {
      array.remove(state.normalChannelsWithMes, (o) => o.id === curChannelId)
      state.normalChannelsWithMes.unshift(channel)
    } else {
      array.remove(state.normalChannelsWithoutMes, (o) => o.id === curChannelId)
      state.normalChannelsWithoutMes.unshift(channel)
    }

    let sortedChannels = array.concat(state.topChannels, state.normalChannelsWithMes, state.normalChannelsWithoutMes)
    let channelsIndex = []

    for (let item of sortedChannels) {
      channelsIndex.push(item.id)
    }

    state.channelsIndex = array.uniq(channelsIndex)

    state.channels = arrToObjByKey('id', sortedChannels)
    state.curChannelId = channel.id
  },

  [T.GET_CHANNEL_MEMBERS_COUNT] (state, channelId, count) {
    set(state.channelsMembersCount, channelId, count)
  },

  [T.UPDATE_CHANNELS_UNREAD] (state, channelId) {
    for (let item in state.channels) {
      let channel = state.channels[item]
      if (channelId === channel.id && state.curChannelId !== channelId) {
        state.channels[item].unRead++
        set(state.channels, channelId, state.channels[item])
        break
      }
    }
  },

  [T.SET_CHAT_FORBBIDEN] (state, data) {
    let channelId = data.channel_id
    let curChannel = state.channels[channelId]

    curChannel.mute_anything = data.type
    set(state.channels, channelId, curChannel)
    state.chatForbiddenStatus++
  },

  [T.GET_ROLE_INFO_OF_CHANNELS] (state, data) {
    state.channelRoleInfo = data
  },

  [T.OPEN_LIVE] (state, data) {
    state.channelsLiveStatus++
    set(state.channelsLive, data.channel_id, data)
  },

  [T.CLOSE_LIVE] (state, data) {
    state.channelsLiveStatus++
    set(state.channelsLive, data.channel_id, data)
  },

  [T.CHANGE_CHANNEL_INDEX] (state, curChannelId) {
    let channel = state.channels[curChannelId]
    if (channel.is_top === 1) {
      array.remove(state.topChannels, (o) => o.id === curChannelId)
      state.topChannels.unshift(channel)
    } else if (channel.lastMessage) {
      array.remove(state.normalChannelsWithMes, (o) => o.id === curChannelId)
      state.normalChannelsWithMes.unshift(channel)
    } else {
      array.remove(state.normalChannelsWithoutMes, (o) => o.id === curChannelId)
      state.normalChannelsWithoutMes.unshift(channel)
    }

    let sortedChannels = array.concat(state.topChannels, state.normalChannelsWithMes, state.normalChannelsWithoutMes)
    let channelsIndex = []

    for (let item of sortedChannels) {
      channelsIndex.push(item.id)
    }

    state.channels = arrToObjByKey('id', sortedChannels)
    state.channelsIndex = channelsIndex
  },

  [T.CHANNEL_INDEX_ACTIVE] (state) {
    state.channelIndexActive++
  },

  [T.SET_SEQ_OF_CHANNEL] (state, channelId) {
    state.channels[channelId].latest_read = state.channels[channelId].message_number
    state.channels[channelId].unRead = 0
  },

  [T.GET_PUBLIC_STATUS] (state, isPublic) {
    if (typeof isPublic === 'undefined') {
      state.curChannelPublicStatus = true
      return
    }
    switch (isPublic) {
      case 0: // 对方未设置
        state.curChannelPublicStatus = true
        break
      case 1: // 对方设置需要上传名片，且尚未上传
        state.curChannelPublicStatus = false
        break
      case 2: // 对方设置需要上传名片， 并且已经上传
        state.curChannelPublicStatus = true
        break
    }
  },
  [T.ADD_NEW_CHANNEL] (state, channelItem) {
    let channel = channelItem
    let curChannelId = channel.id
    let channelsIndex = []
    let sortedChannels = []

    if (channel.is_top === 1) {
      state.topChannels.unshift(channel)
    } else if (channel.lastMessage) {
      state.normalChannelsWithMes.unshift(channel)
    } else {
      state.normalChannelsWithoutMes.unshift(channel)
    }

    channel.unRead = 1
    set(state.channels, curChannelId, channel)
    sortedChannels = array.concat(state.topChannels, state.normalChannelsWithMes, state.normalChannelsWithoutMes)

    for (let item of sortedChannels) {
      channelsIndex.push(item.id)
    }

    state.channels = arrToObjByKey('id', sortedChannels)
    state.channelsIndex = channelsIndex
  },

  [T.UPDATE_CHANNEL_LAST_MESSAGE] (state, curChannelId, message) {
    if (message) {
      state.channels[curChannelId].lastMessage = message
      state.channels[curChannelId].lastMessageCreatedAt = new Date(message.created_at).getTime()
    }
  }
}

export default {
  state,
  mutations
}
