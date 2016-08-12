<template>
  <div class="message-text-con">
    <div class="message-item-avatar" @click="showNameCard = true"><img class="message-avatar-img" :src="(user && user[message.creator] && (user[message.creator].avatar || defaultAvatar)) + '?imageMogr2/thumbnail/160'"><name-card :pre-show.sync="showNameCard" :user="user && user[message.creator]"></name-card></div>
    <div class="message-item-info">
      <div class="message-name-datetime">
        <span class="message-item-name">{{ user && user[message.creator] && user[message.creator].fullname }}</span>
        <span class="message-item-datetime">{{ message.created_at | dateFormat 'HH:mm:ss'}}</span>
      </div>
      <div class="message-item-content">
        <pre v-if="message.media_type === media_text" :data-tseq="message.tseq" data-html="{{ message.content }}" v-html="message.content | linkReplace | emojiReplace"></pre>

        <img width="{{ relativeWH(message.extend, 'w') }}" v-if="message.media_type === media_photo" v-lazyload="message.content && message.content" src="http://7xo06a.com1.z0.glb.clouddn.com/avatar%2Fxinshengdaxue_w.png?imageMogr2/thumbnail/160" @click="dialogImg = message.content, showDialog = true">

        <a v-if="message.media_type === media_link" target="_blank" :href="message.content">{{ message.content }}</a>

        <pre v-if="message.media_type !== media_text && message.media_type !== media_photo && message.media_type !== media_link"><span class="no-support-message">当前版本暂不支持，请在手机上查看</span></pre>
      </div>
    </div>
  </div>
  <dialog :show.sync="showDialog">
    <img :src="dialogImg" alt="">
  </dialog>
</template>

<script>
  import constants from '../../../constants/'
  import NameCard from '../NameCard/'
  import Dialog from '../../commons/Dialog/'
  import dateFormat from '../../../filters/dateFormat'
  import linkReplace from '../../../filters/linkReplace'
  import emojiReplace from '../../../filters/emojiReplace'
  import { DEFAULT_GROUP_AVATAR } from '../../../configs/'
  import { arrToObjByKey } from '../../../utils/enhance'

  export default {
    data () {
      return {
        dialogImg: '',
        showDialog: false,
        media_text: constants.MEDIA_TEXT,
        media_photo: constants.MEDIA_PHOTO,
        media_link: constants.MEDIA_LINK,
        showNameCard: false,
        defaultAvatar: DEFAULT_GROUP_AVATAR
      }
    },

    components: {
      NameCard,
      Dialog
    },

    vuex: {
      getters: {
        user: state => arrToObjByKey('id', state.user.usersInfoStorage)
      }
    },

    props: {
      message: {
        type: Object,
        required: true,
        twoWay: true
      }
    },
    filters: {
      dateFormat,
      linkReplace,
      emojiReplace
    },
    methods: {
      relativeWH (extend, type) {
        if (!extend || !type) {
          return ''
        }

        let w = extend.img_w
        let h = extend.img_h

        if (!w || !h) {
          return ''
        }

        let maxWidth = 400
        let width = 0
        let height = 0

        if (w <= maxWidth) {
          width = w
          height = h
        } else {
          width = maxWidth
          height = h * maxWidth / w
        }

        if (type === 'w') {
          return width
        } else if (type === 'h') {
          return height
        }
      }
    }
  }
</script>
