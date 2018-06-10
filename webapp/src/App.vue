<template>
  <div class="container">
    <RemNav />
    <router-view />
  </div>
</template>

<script lang="ts">
import RemNav from '@/components/Nav.vue';

export default {
  name: 'App',
  components: {
    RemNav,
  }
};
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 50px;
}
</style>
