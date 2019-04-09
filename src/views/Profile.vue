<template>
  <div v-if="player">
    <h4 class="mb-4">Profile</h4>

    <div class="d-flex align-items-center mb-3">
      <b-img class="mr-2" :src="player.pictureUrl" rounded="circle" width="30" height="30"></b-img>
      <span class="mr-1">{{ player.fullName }}</span>
      <a :href="`mailto:${player.email}}`">
        <small><i>({{ player.email }})</i></small>
      </a>
    </div>

    <div class="mb-3">
      <span class="mr-2">Role:</span><strong class="mr-2">{{ player.role }}</strong>
      <b-link v-b-modal.modal-prevent.update-role-modal><small>(Update role)</small></b-link>
    </div>

    <b-modal
      id="update-role-modal"
      @ok="handleUpdateRoleOk"
      title="Update Role"
      ref="update-role-modal">
      <form @submit.stop.prevent="handleUpdateRoleSubmit">
        <label for="role">Role</label>
        <v-select
          id="role"
          name="role"
          v-validate="'required'"
          v-model="newRole"
          :options="['Striker','Defender', 'Any']"
          :class="{'is-danger': errors.has('role')}"
          class="mb-3"></v-select>
      </form>
    </b-modal>

    <b-button class="mt-2" variant="primary" @click="signOut" v-if="player">Sign out</b-button>
  </div>
  <div class="text-center" v-else>
    <b-spinner></b-spinner>
  </div>
</template>

<script>
import vSelect from 'vue-select';
import { firebase, firestore } from '../firebase';

export default {
  name: 'Profile',
  data() {
    return {
      player: null,
      pending: null,
      newRole: null,
    };
  },
  components: {
    'v-select': vSelect,
  },
  mounted() {
    firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        this.player = await this.getPlayer(user);
      } else {
        this.$router.push('games');
      }
    });
  },
  methods: {
    async handleUpdateRoleOk(event) {
      event.preventDefault();
      const valid = await this.$validator.validateAll();

      if (!valid) {
        this.$toasted.show('Error: Check your data and retry', { type: 'error' });
        return;
      }

      this.handleUpdateRoleSubmit();
    },
    async handleUpdateRoleSubmit() {
      if (this.pending) return;
      this.pending = true;

      const valid = await this.$validator.validateAll();
      if (!valid) {
        this.$toasted.show('Error: Check your data and retry', { type: 'error' });
        this.pending = false;
        return;
      }

      const data = {
        role: this.newRole,
        lastUpdateOn: new Date(),
      };

      firestore
        .collection('players')
        .doc(this.player.id)
        .update(data)
        .then((response) => {
          console.log('Document successfully updated!', response);
          this.player.role = this.newRole;

          this.$nextTick(() => {
            this.$refs['update-role-modal'].hide();
            this.newRole = null;
            this.errors.clear();
            this.$toasted.show('Success: Role updated', { type: 'success' });
          });
        })
        .catch((error) => {
          console.error('Error updating role: ', error);
          this.$toasted.show(`Error: ${error.message}`, { type: 'error' });
        })
        .finally(() => {
          this.pending = false;
        });
    },
    async getPlayer(user) {
      return firestore
        .collection('players')
        .where('uid', '==', user.uid)
        .get()
        .then((querySnapshot) => {
          let player = null;

          querySnapshot.forEach((doc) => {
            player = doc.data();
            player.id = doc.id;
          });

          return player;
        })
        .catch((error) => {
          this.$toasted.show(`Error: ${error.message}`, { type: 'error' });
        });
    },
    signOut() {
      firebase.auth().signOut().then(() => {
        this.player = null;
        this.$router.go();
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

<style lang="scss">
  .is-danger {
    border-color: #ff6262;

    > .dropdown-toggle {
      border-color: #ff6262;
    }
  }
</style>
