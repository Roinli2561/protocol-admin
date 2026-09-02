<template>
  <div>
    <svg-icon icon-class="question" @click="goto" />
  </div>
</template>

<script>
export default {
  name: 'WitosDoc',
  data() {
    return {
      url: 'http://witos.doc.huizhidata.com'
    }
  },
  methods: {
    goto() {
      window.open(this.url)
    }
  }
}
</script>
