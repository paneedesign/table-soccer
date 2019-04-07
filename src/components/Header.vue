<template>
    <b-navbar toggleable="md" variant="light" fixed="top" :sticky="true">
        <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>

        <b-navbar-brand to="/">Table Soccer</b-navbar-brand>

        <b-collapse is-nav id="nav_collapse">
            <b-navbar-nav>
              <b-nav-item to="/games">Games</b-nav-item>
              <b-nav-item to="/ranking">Ranking</b-nav-item>
            </b-navbar-nav>

            <b-navbar-nav class="ml-auto">
                <b-nav-item @click="signInWithGoogle" v-if="!user">Sign in with Google</b-nav-item>
                <b-nav-item @click="signOut" v-if="user">Sign out</b-nav-item>
            </b-navbar-nav>
        </b-collapse>
    </b-navbar>
</template>

<script>
export default {
  name: 'Header',
  data() {
    return {
      user: null,
    };
  },
  firebaseReady() {
    this.$firebase.auth().onAuthStateChanged((user) => {
      this.user = user;
    });
  },
  methods: {
    signInWithGoogle() {
      const provider = new this.$firebase.auth.GoogleAuthProvider();
      this.$firebase.auth().signInWithPopup(provider).then((result) => {
        this.user = result;
        this.$toasted.show('Success: Signed in successfully', { type: 'success' });
      }).catch((error) => {
        this.$toasted.show(`Error: ${error.message}`, { type: 'error' });
        console.error(error);
      });
    },
    signOut() {
      this.$firebase.auth().signOut().then(() => {
        this.user = null;
        this.$toasted.show('Success: Signed out successfully', { type: 'success' });
        console.log('Sign out successfully');
      }).catch((error) => {
        this.$toasted.show(`Error: ${error.message}`, { type: 'error' });
        console.error(error);
      });
    },
  },
};
</script>
