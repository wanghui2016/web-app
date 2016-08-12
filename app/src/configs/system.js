const hostName = window.location.hostname
let SOTRAGE_PREFIX = ''
let APP_ID = ''

if (hostName.indexOf('sudoboot') !== -1) { // sudoboot.com
  SOTRAGE_PREFIX = 'fk'
  APP_ID = '56971892243cb728205a20df'
} else if (hostName.indexOf('xinshengdaxue') !== -1 || hostName.indexOf('tinfinite') !== -1) { // xinshengdaxue
  SOTRAGE_PREFIX = 'xsdx'
  APP_ID = '56c6c309243cb728205a3dff'
} else {
  SOTRAGE_PREFIX = 'xsdx'
  APP_ID = '56c6c309243cb728205a3dff'
}
console.log('hostname:' + hostName)
console.log('APP_ID(system.js):' + APP_ID)
export {
  SOTRAGE_PREFIX,
  APP_ID
}
