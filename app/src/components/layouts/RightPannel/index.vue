<style lang="scss">
  @import './index';
</style>

<template>
  <div class="layout-right">
    <posts-list :is-search.sync="isSearch" v-if="showPostsList"></posts-list>
    <black-board :video-url.sync="videoUrl" v-if="showBlackBoard"></black-board>
  </div>
</template>

<script>
  import BlackBoard from '../../modules/BlackBoard'
  import PostsList from '../../modules/PostsList'

  export default {
    data () {
      return {
        videoUrl: '',
        isSearch: false,
        showBlackBoard: false,
        showPostsList: false
      }
    },
    components: {
      BlackBoard,
      PostsList
    },
    events: {
      showLiveVideo (url) {
        // console.log(url)
        this.showBlackBoard = true
        this.showPostsList = false
        this.videoUrl = url
      },
      hideLiveVideo () {
        this.showBlackBoard = false
        this.showPostsList = true
      },
      addPostsList () {
        this.showPostsList = true
        this.showBlackBoard = false
      },
      searchPostsList () {
        this.showPostsList = true
        this.showBlackBoard = false
        this.isSearch = true
      },
      removePostsList () {
        this.showPostsList = false
        this.showBlackBoard = true
      }
    }
  }
</script>
