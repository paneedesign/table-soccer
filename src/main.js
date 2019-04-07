import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import VeeValidate from 'vee-validate';
import VueOnToast from 'vue-on-toast';
import App from './App.vue';
import router from './router';
import firebaseVueInstall from './services/firebase';

import './assets/scss/main.scss';
// import store from './store';
// import './registerServiceWorker';

Vue.config.productionTip = false;

Vue.use(BootstrapVue);
Vue.use(VeeValidate, { fieldsBagName: 'formFields' });
Vue.use(VueOnToast);
Vue.use(firebaseVueInstall);

new Vue({
  router,
  // store,
  render: h => h(App),
}).$mount('#app');
