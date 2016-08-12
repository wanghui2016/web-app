<style lang="scss">
  @import './index';
</style>

<template>
  <div class="module-black-board">
    <div class="board-head">小黑板</div>
    <div class="board-content">
      <p v-if="showText" v-html="content"></p>
      <img v-if="showImg" :src="imgUrl" @click="dialogImg = imgUrl, showDialog = true">
    </div>
    <div class="board-audio">语音直播</div>
    <div class="board-foot audio">
    </div>
    <div class="board-foot audio">
      <x-video :url.sync="videoUrl"></x-video>
    </div>
    <dialog :show.sync="showDialog">
      <img :src="dialogImg" alt="">
    </dialog>
  </div>
</template>

<script>
  import XVideo from '../../commons/Video'
  import constants from '../../../constants/'
  import Dialog from '../../commons/Dialog/'

  export default {
    components: {
      Dialog,
      XVideo
    },
    data () {
      return {
        dialogImg: '',
        showDialog: false,
        showText: false,
        content: '',
        showImg: false,
        imgUrl: ''
      }
    },
    props: {
      videoUrl: {
        type: String,
        twoWay: true
      }
    },
    vuex: {
      getters: {
        channelsLiveStatus: state => state.channel.channelsLiveStatus,
        curChannelId: state => state.channel.curChannelId,
        channelsLive: state => state.channel.channelsLive,
        blackBoardMessage: state => state.message.blackBoardMessage
      }
    },
    watch: {
      channelsLiveStatus () {
        let live = this.channelsLive[this.curChannelId]
        if (live && live.live_play_url) {
          this.$dispatch('openRightPannel') // to components/layouts/Container
          this.$dispatch('openLiveVideo', live.live_play_url) // to components/layouts/Container/
        } else {
          this.$dispatch('closeRightPannel')
        }
      },
      blackBoardMessage () {
        let mes = this.blackBoardMessage
        if (!mes) {
          return
        }
        if (mes.media_type === constants.MEDIA_TEXT) {
          this.showText = true
          this.showImg = false
          this.content = mes.content
        } else if (mes.media_type === constants.MEDIA_PHOTO) {
          this.showText = false
          this.showImg = true
          this.imgUrl = mes.content
        }
      }
    }
  }
</script>
