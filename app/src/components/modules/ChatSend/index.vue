<style lang="scss">
  @import "./index";
</style>

<template>
  <div class="modules-chat-send" v-if="showChatSend">
    <div class="chat-forbidden" v-if="showChatForbidden">
      <div><i class="icon"></i>当前为全体禁言模式，不能说话</div>
    </div>
    <div class="chat-forbidden" v-if="showPublicForbidden">
      <div><i class="icon"></i>对方设置了私聊保护，请使用手机端发一张名片才能跟对方私聊</div>
    </div>
    <div class="chat-forbidden" v-if="showAuthForbidden">
      <div><i class="icon"></i>请先使用手机端进行实名认证</div>
    </div>
    <div class="chat-handle">
      <i class="chat-emoji icon" @click="showEmoji = true"></i>
      <i class="chat-upload-img icon" @click='uploadChannelId = curChannelId'><upload-img :channel-id.sync="uploadChannelId"></upload-img></i>
      <emoji :show.sync="showEmoji" :choose-word="ChooseWordEmoji"></emoji>
    </div>
    <textarea class="chat-box" placeholder="说点儿什么…" v-model="messageText" @keydown.enter="sendText($event)"></textarea>
  </div>
</template>

<script>
  import $ from 'jquery'
  import xss from 'xss'
  import NProgress from 'nprogress'
  import Emoji from '../Emoji/'
  import array from 'lodash/array'
  import storage from '../../../utils/storage'
  import pasteImg from '../../../utils/pasteImg'
  import emojiUtil from '../../../utils/emoji'
  import constants from '../../../constants/'
  import { USER_INFO_KEY } from '../../../configs/'
  import { sendMessage } from '../../../vuex/actions'
  import UploadImg from '../../commons/UploadImg/'

  export default {
    data () {
      return {
        uploadChannelId: '',
        showAuthForbidden: false,
        showPublicForbidden: false,
        showChatForbidden: false,
        showEmoji: false,
        showChatSend: false,
        messageText: ''
      }
    },
    components: {
      UploadImg,
      Emoji
    },
    vuex: {
      actions: {
        sendMessage
      },
      getters: {
        curChannelPublicStatus: state => state.channel.curChannelPublicStatus,
        channels: state => state.channel.channels,
        chatForbiddenStatus: state => state.channel.chatForbiddenStatus,
        channelRoleInfo: state => state.channel.channelRoleInfo,
        curChannelId: state => state.channel.curChannelId
      }
    },
    ready () {
      pasteImg((imgBase64) => {
        // console.log(imgBase64) // 这里需要做图片焦点判断
      })
    },
    events: {
      hideEmojiPannel () { // from components/layouts/Container/
        this.showEmoji = false
      },
      uploadHide () {
        $('#nprogress').hide()
        NProgress.done()
      },
      uploadBefore (extend) {
        $('#nprogress').show()
        NProgress.configure({ parent: '.modules-chat-send' }).start()
      },
      uploadFail () { // 发送失败
        $('#nprogress').hide()
        NProgress.done()
      },
      uploadComplete (uploadChannelId, data, extend) { // from components/commons/UploadImg
        this.sendMessage('photo', uploadChannelId, data.photo, extend, () => {
          NProgress.done()
        })
      }
    },
    watch: {
      curChannelId () {
        this.showChatSend = true
        let userInfo = storage.get(USER_INFO_KEY)

        if (userInfo.verify && userInfo.verify.status !== 1) {
          this.showAuthForbidden = true
          return
        }
        this._dealForbidden(this.channels[this.curChannelId])
      },

      chatForbiddenStatus () {
        this._dealForbidden(this.channels[this.curChannelId])
      },

      curChannelPublicStatus () {
        if (this.curChannelPublicStatus) {
          this.showPublicForbidden = false
        } else {
          this.showPublicForbidden = true
        }
      }
    },
    methods: {
      ChooseWordEmoji (word) {
        this.messageText += word
        $('.chat-box').focus()
      },
      sendText (event) {
        if ($('.global-error-tip').css('display') !== 'none') {
          event.preventDefault()
          return
        }
        if (event.shiftKey) {
          return
        } else {
          if ($.trim(this.messageText) === '') {
            return
          }
          let text = $('<div/>').text($.trim(this.messageText)).html()
          let xssText = xss(text, {
            whiteList: [],
            stripIgnoreTag: true,
            stripIgnoreTagBody: ['script']
          })
          if (!xssText) {
            window.alert('文本中包含非法字符，请重新输入！')
            return
          }
          this.sendMessage('text', this.curChannelId, emojiUtil.replace_colons_ex(text))
          setTimeout(() => {
            this.messageText = ''
          }, 0)
        }
      },
      _dealForbidden (data) { // 只有演讲者可以发送信息
        this.showChatForbidden = false // 不显示禁言遮罩
        if (!data.id) {
          return
        }
        if (data.mute_anything !== 1) { // 全体禁言 0：关闭， 1：开启。禁言未开启 或者 设置禁言关闭
          return
        }
        let roles = []
        let user = storage.get(USER_INFO_KEY)
        let userId = user.user_id // 当前登录的用户ID
        let channelId = data.id   // 当前的channelId
        let roleInfo = this.channelRoleInfo[channelId]
        let flag = false
        roles = array.concat(roles, roleInfo.permanent, roleInfo.temporary)

        for (let item of roles) {
          if (item.user_id === userId && (item.role_code === constants.ROLE_OWNER || item.ROLE_OWNER === constants.ROLE_ADMIN || item.role_code === constants.ROLE_SPEAKER_DEFAULT || item.role_code === constants.ROLE_SPEAKER || item.role_code === constants.ROLE_SPEAKER_MASTER)) {
            flag = true // （群主 || 管理员 || 演讲者）
            break
          }
        }
        this.showChatForbidden = !flag
      }
    }
  }
</script>