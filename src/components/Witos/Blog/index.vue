<template>
  <div>
    <svg-icon icon-class="form" @click="goto" />
  </div>
</template>

<script>
export default {
  name: 'WitosBlog',
  data() {
    return {
      url: 'http://www.huizhidata.com/'
    }
  },
  methods: {
    goto() {
      window.open(this.url)
    }
  }
}
</script>
