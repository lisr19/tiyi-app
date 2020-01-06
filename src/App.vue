<template>
  <div id="app">
	  <keep-alive>
		  <router-view v-if="$route.meta.keepAlive"></router-view>
	  </keep-alive>
	  <router-view v-if="!$route.meta.keepAlive"></router-view>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style lang="less">
  @import '../src/assets/style/style.less';
  @import '../src/assets/style/mint_ui.css';
</style>
