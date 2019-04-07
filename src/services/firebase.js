export default function install(Vue) {
  if (install.installed) {
    return;
  }

  install.installed = true;

  Vue.mixin({
    async created() {
      if (typeof this.$options.firebaseReady === 'function') {
        const firebase = await import('firebase/app');
        await import('firebase/auth');
        await import('firebase/firestore');

        const config = {
          apiKey: 'AIzaSyDakdubwr2GBDVIx2XdTMZCNGoEFxNc3PM',
          projectId: 'ped-table-soccer',
          authDomain: 'ped-table-soccer.firebaseapp.com',
        };

        let firebaseApp = null;

        if (!firebase.apps.length) {
          firebaseApp = firebase.initializeApp(config);
        } else {
          firebaseApp = firebase.app();
        }

        this.$firestore = firebaseApp.firestore();
        this.$firebase = firebase;
        this.$options.firebaseReady.call(this);
      }
    },
  });
}
