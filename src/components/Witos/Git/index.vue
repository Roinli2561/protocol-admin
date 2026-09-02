<template>
  <div>
    <svg-icon icon-class="github" @click="goto" />
  </div>
</template>

<script>
export default {
  name: 'WitosGit',
  data() {
    return {
      url: 'https://github.com/roinli/HUIZHI-witos-cloud'
    }
  },
  methods: {
    goto() {
      window.open(this.url)
    }
  }
}
</script>
