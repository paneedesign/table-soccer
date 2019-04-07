import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';
import NotFound from './views/NotFound.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: '/table-soccer/',
  title: 'P&D Table Soccer',
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/games',
      name: 'games',
      component: () => import(/* webpackChunkName: "games" */ './views/Games.vue'),
    },
    {
      path: '/ranking',
      name: 'ranking',
      component: () => import(/* webpackChunkName: "ranking" */ './views/Ranking.vue'),
    },
    {
      path: '*',
      component: NotFound,
    },
  ],
});
