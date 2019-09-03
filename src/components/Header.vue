<template>
    <b-navbar toggleable="md" variant="light" fixed="top" :sticky="true">
        <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>

        <b-navbar-brand to="/">
          <img src="../assets/logo.svg">
          <span class="env" v-if="isDev">DEV</span>
        </b-navbar-brand>

        <b-collapse is-nav id="nav_collapse">
            <b-navbar-nav>
              <b-nav-item to="/games">Games</b-nav-item>
              <b-nav-item to="/ranking">Ranking</b-nav-item>
            </b-navbar-nav>

            <b-navbar-nav class="ml-auto">
                <b-nav-item
                  @click="signInWithGoogle"
                  v-if="!player">Sign in with Google</b-nav-item>
                <div class="d-flex align-items-center" v-if="player">
                  <b-link class="d-flex align-items-center" to="/profile">
                    <div class="mr-2">
                      <span>{{ player.fullName }}</span>
                    </div>
                    <b-img :src="player.pictureUrl" rounded="circle" width="30" height="30"></b-img>
                  </b-link>
                </div>
            </b-navbar-nav>
        </b-collapse>
    </b-navbar>
</template>

<script>
import { firebase, firestore } from '../firebase';
import SITES from '../utils/sites';

export default {
  name: 'Header',
  data() {
    return {
      player: null,
    };
  },
  mounted() {
    firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        this.player = await this.getPlayer(user);
      }
    });
  },
  computed: {
    isDev() {
      return process.env.NODE_ENV === 'development';
    },
  },
  methods: {
    signInWithGoogle() {
      const provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithPopup(provider).then(async (result) => {
        if (result.user) {
          let player = await this.getPlayer(result.user);

          if (!player) {
            console.debug('Player not found, creating new player');
            player = await this.createPlayer(result.user);
          }

          this.player = player;
          this.$toasted.show('Success: Signed in successfully', { type: 'success' });
        }
      }).catch((error) => {
        this.$toasted.show(`Error: ${error.message}`, { type: 'error' });
        console.error(error);
      });
    },
    // Google logged user -> Firebase User
    async getPlayer(user) {
      return firestore
        .collection('players')
        .where('uid', '==', user.uid)
        .get()
        .then((querySnapshot) => {
          let player = null;

          querySnapshot.forEach((doc) => {
            player = doc.data();
          });

          return player;
        })
        .catch((error) => {
          this.$toasted.show(`Error: ${error.message}`, { type: 'error' });
        });
    },
    // Google logged user -> Firebase new User
    async createPlayer(user) {
      const data = {
        uid: user.uid,
        email: user.email,
        fullName: user.displayName,
        pictureUrl: user.photoURL,
        role: 'Any',
        createdAt: new Date(),
        lastUpdateOn: new Date(),
        enabled: false,
        site: SITES.CATANIA,
      };

      return firestore
        .collection('players')
        .add(data)
        .then((docRef) => {
          console.debug('Document (Player) written with ID: ', docRef.id);
          return data;
        })
        .catch((error) => {
          console.error('Error creating player: ', error);
          this.$toasted.show(`Error: ${error.message}`, { type: 'error' });
        });
    },
  },
};
</script>

<style>
  .env {
    position: absolute;
    bottom: 8px;
    font-size: 8px;
    font-weight: bold;
    color: red;
  }
</style>
