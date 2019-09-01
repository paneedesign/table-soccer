<template>
  <div class="upcoming-games">
    <b-row>
      <b-col lg="2" class="mt-4">
        <h5 class="mb-4">Not available</h5>
        <b-form-checkbox-group id="unavailable-players"
                               class="d-flex flex-wrap"
                               v-model="unavailablePlayers"
                               name="unavailable-players">
          <b-form-checkbox
            class="mb-2"
            v-for="playerRef in $store.getters.playersRefBySite('Catania')"
            :key="playerRef.id"
            :value="playerRef.id">{{ parseFullName(playerRef.data()) }}</b-form-checkbox>
        </b-form-checkbox-group>

        <b-button variant="primary" class="mb-2 mt-2" @click="selectAll()">Select All</b-button>
        <b-button variant="primary" class="mb-3" @click="deselectAll()">Deselect All</b-button>
      </b-col>
      <b-col lg="10">
        <b-row class="align-items-center mb-4 pt-3">
          <b-col xs="6">
            <h4 class="mb-0">Upcoming games</h4>
          </b-col>
          <b-col xs="6" class="text-right">
            <b-dropdown class="mx-1" right text="Generate">
              <b-dropdown-item @click="generateGames()">By Ranking</b-dropdown-item>
              <b-dropdown-item @click="generateRandomGames()">Randomly</b-dropdown-item>
            </b-dropdown>
          </b-col>
        </b-row>

        <b-table
          id="upcoming-game-table"
          responsive
          striped
          hover
          :items="$store.state.upcomingGames"
          :fields="tableFields"
          v-if="$store.state.upcomingGames.length">
          <template slot="redDefender" slot-scope="data">
            <div class="d-flex align-items-center"
                 :class="{'team-won': redTeamWon(data.item) && canAddGame(data.item)}">
              <b-img
                v-if="data.item.redTeam.defender.pictureUrl"
                class="mr-2"
                :src="data.item.redTeam.defender.pictureUrl"
                rounded="circle"
                width="20"
                height="20" />
              <div>
                <span>{{ parseFullName(data.item.redTeam.defender) }}</span>
              </div>
            </div>
          </template>
          <template slot="redStriker" slot-scope="data">
            <div class="d-flex align-items-center"
                 :class="{'team-won': redTeamWon(data.item) && canAddGame(data.item)}">
              <b-img
                v-if="data.item.redTeam.striker.pictureUrl"
                class="mr-2"
                :src="data.item.redTeam.striker.pictureUrl"
                rounded="circle"
                width="20"
                height="20" />
              <div>
                <span>{{ parseFullName(data.item.redTeam.striker) }}</span>
              </div>
            </div>
          </template>
          <template slot="blueDefender" slot-scope="data">
            <div class="d-flex align-items-center"
                 :class="{'team-won': !redTeamWon(data.item) && canAddGame(data.item)}">
              <b-img
                v-if="data.item.blueTeam.defender.pictureUrl"
                class="mr-2"
                :src="data.item.blueTeam.defender.pictureUrl"
                rounded="circle"
                width="20"
                height="20" />
              <div>
                <span>{{ parseFullName(data.item.blueTeam.defender) }}</span>
              </div>
            </div>
          </template>
          <template slot="blueStriker" slot-scope="data">
            <div class="d-flex align-items-center"
                 :class="{'team-won': !redTeamWon(data.item) && canAddGame(data.item)}">
              <b-img
                v-if="data.item.blueTeam.striker.pictureUrl"
                class="mr-2"
                :src="data.item.blueTeam.striker.pictureUrl"
                rounded="circle"
                width="20"
                height="20" />
              <div>
                <span>{{ parseFullName(data.item.blueTeam.striker) }}</span>
              </div>
            </div>
          </template>
          <template slot="redScore" slot-scope="data">
            <b-input type="number" v-model="data.item.redScore"></b-input>
          </template>
          <template slot="blueScore" slot-scope="data">
            <b-form-input type="number" v-model="data.item.blueScore"></b-form-input>
          </template>
          <template slot="actions" slot-scope="data">
            <b-button @click="addGame(data.item)" :disabled="pending">Add</b-button>
          </template>
        </b-table>
        <div class="text-center" v-else>
          <span>Generate teams by clicking on the select menu.</span>
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import { firestore } from '../../firebase';
import { parseFullName } from '../../utils/parse';

export default {
  name: 'UpcomingGames',
  data() {
    return {
      pending: false,
      unavailablePlayers: [],
      tableFields: [
        'redDefender',
        'redStriker',
        'blueDefender',
        'blueStriker',
        'redScore',
        'blueScore',
        'actions',
      ],
    };
  },
  methods: {
    parseFullName(item) {
      return parseFullName(item.fullName);
    },
    selectAll() {
      this.unavailablePlayers = this.$store.getters.playersRefBySite('Catania').map(player => player.id);
    },
    deselectAll() {
      this.unavailablePlayers = [];
    },
    generateGames() {
      this.$store.dispatch('getUpcomingGames', this.unavailablePlayers);
    },
    generateRandomGames() {
      this.$store.dispatch('getUpcomingGamesRandomly', this.unavailablePlayers);
    },
    redTeamWon(game) {
      return parseInt(game.redScore, 10) > parseInt(game.blueScore, 10);
    },
    canAddGame(game) {
      return parseInt(game.redScore, 10) > -1
        && parseInt(game.blueScore, 10) > -1
        && parseInt(game.redScore, 10) !== parseInt(game.blueScore, 10);
    },
    async addGame(game) {
      if (this.pending) return;
      this.pending = true;

      if (!this.canAddGame(game)) {
        this.$toasted.show('Error: Check your data and retry', { type: 'error' });
        this.pending = false;
        return;
      }

      const data = {
        redTeam: {
          defender: firestore.doc(`players/${this.$store.getters.getPlayerIdByUid(game.redTeam.defender.uid)}`),
          striker: firestore.doc(`players/${this.$store.getters.getPlayerIdByUid(game.redTeam.striker.uid)}`),
          score: parseInt(game.redScore, 10),
        },
        blueTeam: {
          defender: firestore.doc(`players/${this.$store.getters.getPlayerIdByUid(game.blueTeam.defender.uid)}`),
          striker: firestore.doc(`players/${this.$store.getters.getPlayerIdByUid(game.blueTeam.striker.uid)}`),
          score: parseInt(game.blueScore, 10),
        },
        timestamp: new Date(),
        site: 'Catania',
      };

      firestore
        .collection('games')
        .add(data)
        .then((docRef) => {
          console.debug('Document written with ID: ', docRef.id);

          // TODO: Do this when create action will be done in the store.
          this.$store.dispatch('removeUpcomingGame', game);
          this.$nextTick(() => {
            this.$toasted.show('Success: Game inserted', { type: 'success' });
          });
        })
        .catch((error) => {
          console.error('Error adding document: ', error);
          this.$toasted.show(`Error: ${error.message}`, { type: 'error' });
        })
        .finally(() => {
          this.pending = false;
        });
    },
  },
};
</script>
