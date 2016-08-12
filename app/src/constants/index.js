import object from 'lodash/object'
import storageName from './storageName'
import mediaType from './mediaType'
import messageType from './messageType'
import channelType from './channelType'
import roleType from './roleType'
import systemMessageType from './systemMessageType'

let constants = object.assignIn({},
  storageName,
  mediaType,
  messageType,
  channelType,
  roleType,
  systemMessageType
)

export default constants
