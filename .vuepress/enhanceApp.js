import BootstrapVue from 'bootstrap-vue';
import axios from 'axios'
import VueAxios from 'vue-axios'

export default ({Vue}) => {
  Vue.use(BootstrapVue);
  Vue.use(VueAxios, axios)
};
