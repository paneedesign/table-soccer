import Vue from 'vue';

Vue.filter('formatFullName', (value) => {
  if (!value) return '';
  const [name, surname, ...other] = value.split(' ');
  return `${name} ${surname.charAt(0).toUpperCase()}. ${other.map(o => `${o.charAt(0).toUpperCase()}.`)}`;
});
