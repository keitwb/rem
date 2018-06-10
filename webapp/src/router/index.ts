import Vue from 'vue';
import Router from 'vue-router';
import Properties from '@/components/Properties.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      redirect: '/properties',
    },
    {
      path: '/properties',
      component: Properties,
    },
  ],
});
