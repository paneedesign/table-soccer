import Vue from 'vue';
import Vuex from 'vuex';
import { firestore } from './firebase';
import { parseGames, parsePlayerRanking, parseTeamRanking } from './utils/parse';
import { getPlayersRanking, getTeamsRanking } from './utils/ranking';

Vue.use(Vuex);

const mutationTypes = {
  GET_PLAYERS_START: 'GET_PLAYERS_START',
  GET_PLAYERS_SUCCESS: 'GET_PLAYERS_SUCCESS',
  GET_GAMES_START: 'GET_PLAYERS_START',
  GET_GAMES_SUCCESS: 'GET_GAMES_SUCCESS',
  SET_PLAYERS_RANKING: 'SET_PLAYERS_RANKING',
  SET_TEAM_RANKING: 'SET_TEAM_RANKING',
};

export default new Vuex.Store({
  state: {
    playersRef: [],
    gamesRef: [],
    pending: {
      playersRef: false,
      gamesRef: false,
    },
    playersRanking: [],
    teamsRanking: [],
  },
  getters: {
    parsedGames(state) {
      return parseGames(state.gamesRef, state.playersRef);
    },
    parsedPlayerRanking(state) {
      return parsePlayerRanking(state.playersRanking, state.playersRef);
    },
    parsedTeamRanking(state) {
      return parseTeamRanking(state.teamsRanking, state.playersRef);
    },
  },
  mutations: {
    [mutationTypes.GET_PLAYERS_START](state) {
      state.pending.playersRef = true;
    },
    [mutationTypes.GET_PLAYERS_SUCCESS](state, playersRef) {
      state.pending.playersRef = false;
      state.playersRef = playersRef;
    },
    [mutationTypes.GET_GAMES_START](state) {
      state.pending.gamesRef = true;
    },
    [mutationTypes.GET_GAMES_SUCCESS](state, gamesRef) {
      state.pending.gamesRef = false;
      state.gamesRef = gamesRef;
    },
    [mutationTypes.SET_PLAYERS_RANKING](state, gamesRef) {
      state.playersRanking = getPlayersRanking(gamesRef, state.playersRef);
    },
    [mutationTypes.SET_TEAM_RANKING](state, gamesRef) {
      state.teamsRanking = getTeamsRanking(gamesRef, state.playersRef);
    },
  },
  actions: {
    getPlayers({ state, commit }) {
      if (state.playersRef.length) return Promise.resolve;

      commit(mutationTypes.GET_PLAYERS_START);
      return firestore
        .collection('players')
        .orderBy('fullName', 'asc')
        .get()
        .then((querySnapshot) => {
          const playersRef = [];
          querySnapshot.forEach(doc => playersRef.push(doc));
          commit(mutationTypes.GET_PLAYERS_SUCCESS, playersRef);
        });
    },
    async getGames({ state, commit, dispatch }) {
      if (state.gamesRef.length) return;

      await dispatch('getPlayers');
      commit(mutationTypes.GET_GAMES_START);

      firestore
        .collection('games')
        .orderBy('timestamp', 'asc')
        .onSnapshot((querySnapshot) => {
          const gamesRef = [];
          querySnapshot.forEach(doc => gamesRef.push(doc));
          commit(mutationTypes.GET_GAMES_SUCCESS, gamesRef);
          commit(mutationTypes.SET_PLAYERS_RANKING, gamesRef);
          commit(mutationTypes.SET_TEAM_RANKING, gamesRef);
        });
    },
  },
});
