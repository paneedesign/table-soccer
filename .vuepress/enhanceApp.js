import BootstrapVue from 'bootstrap-vue';
import axios from 'axios'
import VueAxios from 'vue-axios'
import VeeValidate from 'vee-validate';
import VueOnToast from 'vue-on-toast';
import firebaseVueInstall from './services/firebase';

export default ({Vue}) => {
  Vue.use(BootstrapVue);
  Vue.use(VueAxios, axios);
  Vue.use(VeeValidate, { fieldsBagName: 'formFields' });
  Vue.use(VueOnToast);
  Vue.use(firebaseVueInstall);
};
