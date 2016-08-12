import cookie from '../utils/cookie'

// env
let loc = window.location
let host = loc.host
let ENV = ''

const APP_XSDX = '56c6c309243cb728205a3dff'
const APP_FK = '56971892243cb728205a20df'
let APP_ID = ''

if (loc.href.indexOf('sudoboot') !== -1) {
  APP_ID = APP_FK
} else if (loc.href.indexOf('xinshengdaxue') !== -1 || loc.href.indexOf('tinfinite') !== -1) {
  APP_ID = APP_XSDX
} else {
  APP_ID = APP_XSDX
}

console.log('url(index.js):' + loc)
console.log('APP_ID(index.js):' + APP_ID)

let hasDev = host.indexOf('dev') !== -1
let hasPort = !!host.port

if (hasPort) { // 有端口，肯定本地
  ENV = hasDev ? 'dev-local' : 'pro-local'
} else {       // 无端口，线上
  ENV = hasDev ? 'dev' : 'pro'
}

// top level hostname
let topHostMatch = loc.hostname.match(/\.([^\.]+\.com)$/)
let TOP_LEVEL_HOST = topHostMatch && topHostMatch[1]

let isDev = ENV.indexOf('dev') !== -1

// uri prefix
let URI_PREFIX = isDev ? '//api-saas-dev.tinfinite.com' : '//api-saas.tinfinite.com'

// uri socket
let SOCKET_URI = isDev ? 'http://im-saas-dev.tinfinite.com' : 'http://im-saas.tinfinite.com'

// storage for userInfo (include app_id, avatar, device_id, fullname, token, user_id)
const USER_INFO_KEY = isDev ? 'user_info_dev' : 'user_info'

// storage & cookie for deviceId
const DEVICE_ID_KEY = isDev ? '_device_id_dev' : '_device_id'

// cookie for token key
const APP_TOKEN_KEY = isDev ? '_app_token_dev' : '_app_token'

// cookie for urserId key
const APP_USERID_KEY = isDev ? '_app_userid_dev' : '_app_userid'

// cookie for token
let TOKEN = cookie.getCookie(APP_TOKEN_KEY) || ''

// 消息每次加载数
const MESSAGES_LIMIT = 50

// 群成员每次加载数
const USERS_LIMIT = 70

// default group's avatar
const DEFAULT_PERSON_AVATAR = 'http://7xrnqf.dl1.z0.glb.clouddn.com/img/default_avatar.png'

// default personal avatar
const DEFAULT_GROUP_AVATAR = 'http://7xrnqf.dl1.z0.glb.clouddn.com/img/default_avatar.png'

export {
  URI_PREFIX,
  TOKEN,
  ENV,
  DEVICE_ID_KEY,
  USER_INFO_KEY,
  APP_TOKEN_KEY,
  APP_USERID_KEY,
  MESSAGES_LIMIT,
  SOCKET_URI,
  USERS_LIMIT,
  DEFAULT_PERSON_AVATAR,
  DEFAULT_GROUP_AVATAR,
  TOP_LEVEL_HOST,
  APP_ID
}
