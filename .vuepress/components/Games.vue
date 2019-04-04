<template>
    <div>
        <ClientOnly>
            <b-row>
                <b-col xs="12" lg="6" class="mb-3">
                    <b-button v-b-modal.add-new>Add new game</b-button>
                </b-col>
                <b-col xs="12" lg="6" class="mb-3">
                    <b-alert :show="alertDismissCountDown"
                             dismissible
                             variant="success"
                             @dismissed="alertDismissCountDown = 0"
                             @dismiss-count-down="countDownChanged">
                        Game added successfully
                    </b-alert>
                </b-col>
            </b-row>

            <b-row>
                <b-col lg="12">
                    <b-table v-if="games.length" responsive striped hover :items="games"></b-table>
                    <h4 v-else class="text-center">
                        <b-spinner></b-spinner>
                    </h4>
                </b-col>
            </b-row>

            <b-modal id="add-new" title="Add new game" @ok="handleOk">
                <h3>Red Team</h3>
                <label for="red-team-defender">Defender</label>
                <b-form-select id="red-team-defender" v-model="newGame.redTeam.defender" :options="players" class="mb-3">
                    <option :value="null">Select a defender</option>
                </b-form-select>

                <label for="red-team-striker">Striker</label>
                <b-form-select id="red-team-striker" v-model="newGame.redTeam.striker" :options="players" class="mb-3">
                    <option :value="null">Select a striker</option>
                </b-form-select>

                <label for="red-team-score">Score</label>
                <b-form-input id="red-team-score" v-model="newGame.redTeam.score" placeholder="Enter score" type="number" class="mb-3"></b-form-input>

                <h3>Blue Team</h3>
                <label for="red-team-defender">Defender</label>
                <b-form-select id="blue-team-defender" v-model="newGame.blueTeam.defender" :options="players" class="mb-3">
                    <option :value="null">Select a defender</option>
                </b-form-select>

                <label for="red-team-striker">Striker</label>
                <b-form-select id="blue-team-striker" v-model="newGame.blueTeam.striker" :options="players" class="mb-3">
                    <option :value="null">Select a striker</option>
                </b-form-select>

                <label for="blue-team-score">Score</label>
                <b-form-input id="blue-team-score" v-model="newGame.blueTeam.score" placeholder="Enter score" type="number" class="mb-3"></b-form-input>
            </b-modal>
        </ClientOnly>
    </div>
</template>

<script>
  import asyncGetFirebase from '../services/firebase';

  const gameModel = () => {
    return {
      redTeam: {
        defender: null,
        striker: null,
        score: 0,
      },
      blueTeam: {
        defender: null,
        striker: null,
        score: 0,
      },
    };
  };

  export default {
    name: 'Games',
    data() {
      return {
        playersRef: [],
        games: [],
        newGame: { ...gameModel() },
        alertDismissCountDown: 0,
      };
    },
    computed: {
      players() {
        return this.playersRef
          .map(playerRef => ({
            value: playerRef.id,
            text: `${playerRef.data().name} ${playerRef.data().surname}`
          }));
      }
    },
    async mounted() {
      const { firestore } = await asyncGetFirebase();
      this.firestore = firestore;

      await this.firestore.collection('players').get().then((querySnapshot) => {
        querySnapshot.forEach(doc => this.playersRef.push(doc));
      });

      this.firestore
        .collection('games')
        .orderBy('timestamp', 'desc')
        .onSnapshot((querySnapshot) => {
          this.games = [];

          querySnapshot.forEach((doc) => {
            this.games.push(this.parseGame(doc.data()))
          });
        });
    },
    methods: {
      parseGame(game) {
        const redDefender = this.playersRef.find((player) => player.id === game.redTeam.defender.id).data();
        const redStriker = this.playersRef.find((player) => player.id === game.redTeam.striker.id).data();
        const blueDefender = this.playersRef.find((player) => player.id === game.blueTeam.defender.id).data();
        const blueStriker = this.playersRef.find((player) => player.id === game.blueTeam.striker.id).data();

        return {
          redDefender: redDefender.name,
          redStriker: redStriker.name,
          blueDefender: blueDefender.name,
          blueStriker: blueStriker.name,
          redScore: game.redTeam.score,
          blueScore: game.blueTeam.score,
        };
      },
      handleOk() {
        // TODO: Add VeeValidate
        const data = {
          redTeam: {
            defender: this.firestore.doc(`players/${this.newGame.redTeam.defender}`),
            striker: this.firestore.doc(`players/${this.newGame.redTeam.striker}`),
            score: parseInt(this.newGame.redTeam.score, 10),
          },
          blueTeam: {
            defender: this.firestore.doc(`players/${this.newGame.blueTeam.defender}`),
            striker: this.firestore.doc(`players/${this.newGame.blueTeam.striker}`),
            score: parseInt(this.newGame.blueTeam.score, 10),
          },
          timestamp: new Date(),
          // Hardcoded site location
          site: 'Catania',
        };

        this.firestore
          .collection('games')
          .add(data)
          .then((docRef) => {
            console.debug('Document written with ID: ', docRef.id);

            // Show an alert
            this.alertDismissCountDown = 3;

            // Reset game model
            this.newGame = { ...gameModel() };
          })
          .catch((error) => {
            console.error('Error adding document: ', error);
          });
      },
      countDownChanged(dismissCountDown) {
        this.alertDismissCountDown = dismissCountDown;
      },
    }
  };
</script>
