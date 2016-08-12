<style lang="scss">
  @import "./index";
</style>

<template>
  <div class="module-message-item" >
    <div v-if="message.message_type === message_service" class="message-service">
      <div class="service-content">{{ message.content }}</div>
    </div>

    <!--   <div class="message-date"> // 时间分界线
      <hr/>
      <div class="date-content"><span>今天</span></div>
    </div> -->

    <plain-message v-if="message.message_type === message_plain" :message.sync="message"></plain-message>

    <!-- <non-support-message  :message.sync="message"></non-support-message> -->
  </div>

</template>

<script>
  import constants from '../../../constants/'
  import PlainMessage from './plainMessage'
  import nonSupportMessage from './nonSupportMessage'

  export default {
    data () {
      return {
        message_service: constants.MESSAGE_SERVICE,
        message_plain: constants.MESSAGE_PLAIN
      }
    },
    components: {
      PlainMessage,
      nonSupportMessage
    },
    props: {
      message: {
        type: Object,
        required: true,
        twoWay: true
      }
    }
  }
</script>
