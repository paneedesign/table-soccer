<template>
    <b-navbar toggleable="md" variant="light" fixed="top" :sticky="true">
        <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>

        <b-navbar-brand to="/">{{ $site.title }}</b-navbar-brand>

        <b-collapse is-nav id="nav_collapse">
            <b-navbar-nav>
                <b-nav-item :to="$withBase('games.html')">Games</b-nav-item>
                <b-nav-item :to="$withBase('ranking.html')">Ranking</b-nav-item>
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
      }
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
          this.$vueOnToast.pop('success', 'Success', 'Signed in successfully');
        }).catch((error) => {
          this.$vueOnToast.pop('error', 'Error', error.message);
          console.error(error);
        });
      },
      signOut() {
        this.$firebase.auth().signOut().then(() => {
          this.user = null;
          this.$vueOnToast.pop('success', 'Success', 'Signed out successfully');
          console.log('Sign out successfully');
        }).catch((error) => {
          this.$vueOnToast.pop('error', 'Error', error.message);
          console.error( error);
        });
      }
    },
  };
</script>
