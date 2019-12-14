import Vue from 'vue';
import Vuex from 'vuex';
import { firestore } from '../firebase';
import { parseGames, parsePlayerRanking, parseTeamRanking } from '../utils/parse';
import { getPlayerIdByUid } from '../utils/players';

Vue.use(Vuex);

const mutationTypes = {
  GET_PLAYERS_START: 'GET_PLAYERS_START',
  GET_PLAYERS_SUCCESS: 'GET_PLAYERS_SUCCESS',
  GET_GAMES_START: 'GET_GAMES_START',
  GET_GAMES_SUCCESS: 'GET_GAMES_SUCCESS',
  GET_PLAYERS_RANKING_START: 'GET_PLAYERS_RANKING_START',
  GET_PLAYERS_RANKING_SUCCESS: 'GET_PLAYERS_RANKING_SUCCESS',
  GET_TEAM_RANKING_START: 'GET_TEAM_RANKING_START',
  GET_TEAM_RANKING_SUCCESS: 'GET_TEAM_RANKING_SUCCESS',
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
      playersRanking: false,
      teamsRanking: false,
    },
    playersRanking: {},
    teamsRanking: {},
  },
  getters: {
    playersRefBySite: state => site => state.playersRef
      .filter(playerRef => playerRef.data().site === site),
    parsedGames: state => parseGames(state.gamesRef, state.playersRef),
    parsedPlayerRanking:
      state => site => parsePlayerRanking(state.playersRanking[site], state.playersRef),
    parsedTeamRanking:
      state => site => parseTeamRanking(state.teamsRanking[site], state.playersRef),
    getPlayerIdByUid: state => uid => getPlayerIdByUid(uid, state.playersRef),
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
    [mutationTypes.GET_PLAYERS_RANKING_START](state) {
      state.pending.playersRanking = true;
    },
    [mutationTypes.GET_PLAYERS_RANKING_SUCCESS](state, payload) {
      const { site, data } = payload;
      state.pending.playersRanking = false;
      Vue.set(state.playersRanking, site, data);
    },
    [mutationTypes.GET_TEAM_RANKING_START](state) {
      state.pending.teamsRanking = true;
    },
    [mutationTypes.GET_TEAM_RANKING_SUCCESS](state, payload) {
      const { site, data } = payload;
      state.pending.teamsRanking = false;
      Vue.set(state.teamsRanking, site, data);
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
        });
    },
    async getRanking({ dispatch }, site) {
      await dispatch('getPlayers');
      dispatch('getPlayerRanking', site);
      dispatch('getTeamRanking', site);
    },
    getPlayerRanking({ commit }, site) {
      commit(mutationTypes.GET_PLAYERS_RANKING_START);

      firestore
        .collection('playersRanking')
        .doc(site)
        .get()
        .then((doc) => {
          if (doc.exists) {
            commit(mutationTypes.GET_PLAYERS_RANKING_SUCCESS, {
              site,
              data: doc.data(),
            });
          }
        });
    },
    getTeamRanking({ commit }, site) {
      commit(mutationTypes.GET_TEAM_RANKING_START);

      firestore
        .collection('teamsRanking')
        .doc(site)
        .get()
        .then((doc) => {
          if (doc.exists) {
            commit(mutationTypes.GET_TEAM_RANKING_SUCCESS, {
              site,
              data: doc.data(),
            });
          }
        });
    },
  },
});
