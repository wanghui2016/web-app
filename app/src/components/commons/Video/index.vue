<style lang="scss">
  @import './index';
</style>

<template>
  <div id="playerContainer"></div>
</template>

<script>
  import cyberPlayer from './cyberplayer'
  import { ENV } from '../../../configs/'
  import logger from '../../../utils/logger'
  export default {
    data () {
      return {
        player: null
      }
    },
    props: {
      url: {
        type: String,
        twoWay: true,
        required: true
      }
    },
    ready () {
      if (this.player) {
        this.player = null
      }
      if (this.url) {
        logger.print('live url: ', this.url)
        this.playVideo(this.url)
      }
    },
    vuex: {
      getters: {
        curChannelId: state => state.channel.curChannelId,
        channels: state => state.channel.channels
      }
    },
    watch: {
      curChannelId () {
        let curChannel = this.channels[this.curChannelId]
        if (curChannel.live_play_url) {
          this.playVideo(curChannel.live_play_url)
          ENV.indexOf('dev') === -1 && window.sa.track('evt_join_live')
        } else if (this.PLAYER) {
          this.player.remove()
        }
      }
    },
    methods: {
      playVideo (url) {
        this.player = cyberPlayer('playerContainer').setup({
          flashplayer: 'http://7xrnqf.dl1.z0.glb.clouddn.com/swf/cyberplayer.flash.swf',
          width: 349,
          height: 200,
          autostart: true,
          stretching: 'none',
          file: url,
          ak: 'b2d09fbd6b774177957fb4c3aa6f53f6',
          autoStart: true,
          repeat: false,
          volume: 100,
          rtmp: {
            reconnecttime: 5
          }
        })
        this.player.on('complete', () => { // 当发生流断了以后，需要重新连接上。
          this.player.play()
        })
      }
    }
  }
</script>
