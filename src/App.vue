<template>
  <div id="app">
    <site-header/>
    <b-container class="mt-4">
      <router-view/>
      <site-footer/>
    </b-container>
  </div>
</template>

<script>
import SiteHeader from './components/Header.vue';
import SiteFooter from './components/Footer.vue';

export default {
  components: {
    SiteHeader,
    SiteFooter,
  },
};
</script>
