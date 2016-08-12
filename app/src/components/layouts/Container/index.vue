<style lang="scss">
  @import './index';
</style>

<template>
  <div class="layout-container" @click="globalHideClick($event)">
    <channels-pannel></channels-pannel>
    <body-pannel :open-right.sync="openRight"></body-pannel>
  </div>
</template>

<script>
  import $ from 'jquery'
  import storage from '../../../utils/storage'
  import cookie from '../../../utils/cookie'
  import { TOP_LEVEL_HOST, USER_INFO_KEY, APP_TOKEN_KEY } from '../../../configs/'
  import ChannelsPannel from '../ChannelsPannel/'
  import BodyPannel from '../BodyPannel/'

  import {
    socketInit,
    socketListener
  } from '../../../vuex/actions'

  export default {
    data () {
      return {
        openRight: false
      }
    },
    components: {
      ChannelsPannel,
      BodyPannel
    },
    vuex: {
      actions: {
        socketInit,
        socketListener
      }
    },
    created () {
      let userInfo = storage.get(USER_INFO_KEY)
      if (!userInfo) {
        storage.clear()
        cookie.delCookie(APP_TOKEN_KEY, TOP_LEVEL_HOST)
        window.history.go(0)
        return
      }
      this.socketInit(userInfo) // socket 初始化
      this.socketListener()
    },
    events: {
      openRightPannel () {
        this.openRight = true
      },
      closeRightPannel () {
        this.openRight = false
      },
      openLiveVideo (url) {
        this.$broadcast('showLiveVideo', url)
      },
      colseLiveVideo () {
        this.$broadcast('hideLiveVideo')
      },
      addPostsList () {
        this.$broadcast('addPostsList')
      },
      removePostsList () {
        this.$broadcast('removePostsList')
      },
      searchPostsList () {
        this.$broadcast('searchPostsList')
      },
      colseChannelNotice () {
        this.$broadcast('colseChannelNotice')
      }
    },
    methods: {
      _hasNoClasses (ele, classes) {
        for (let item of classes) {
          if (ele.hasClass(item)) {
            return false
          }
        }
        return true
      },

      globalHideClick (e) {
        let target = $(e.target)

        // to components/modules/ChatSend
        if (this._hasNoClasses(target, ['chat-emoji', 'emoji-nav-item', 'module-emoji', 'emoji-tab-list', 'emoji-data-list'])) {
          this.$broadcast('hideEmojiPannel')
        }

        // to components/modules/PersonProfile
        if ($('.module-profile').find(target).length === 0) {
          this.$broadcast('hideProfileDialog')
        }

        // to components/modules/ChatHead
        if (this._hasNoClasses(target, ['chat-head-name', 'group-menu-dialog'])) {
          this.$broadcast('hideGroupMenu')
        }

        // to components/modules/NameCard
        if ($('module-name-card').find(target).length === 0 && this._hasNoClasses(target, ['message-avatar-img', 'go-chat'])) {
          this.$broadcast('hideNameCard')
        }
      }
    }
  }
</script>
