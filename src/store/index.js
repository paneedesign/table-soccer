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
  GET_MORE_GAMES_START: 'GET_MORE_GAMES_START',
  GET_MORE_GAMES_SUCCESS: 'GET_MORE_GAMES_SUCCESS',
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
    games: {
      data: [],
      pending: false,
      pagination: {
        next: undefined,
      },
    },
    playersRanking: {},
    teamsRanking: {},
    pending: {
      playersRef: false,
      playersRanking: false,
      teamsRanking: false,
    },
  },
  getters: {
    playersRefBySite: state => site => state.playersRef
      .filter(playerRef => playerRef.data().site === site),
    parsedGames: state => parseGames(state.games.data, state.playersRef),
    parsedPlayerRanking:
      state => site => parsePlayerRanking(state.playersRanking[site], state.playersRef),
    parsedTeamRanking:
      state => site => parseTeamRanking(state.teamsRanking[site], state.playersRef),
    getPlayerIdByUid: state => uid => getPlayerIdByUid(uid, state.playersRef),
    hasMoreGames: state => state.games.pagination.next,
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
      state.games.pending = true;
    },
    [mutationTypes.GET_GAMES_SUCCESS](state, payload) {
      const { pagination, data } = payload;
      state.games.pending = false;
      state.games.pagination = pagination;
      state.games.data = data;
    },
    [mutationTypes.GET_MORE_GAMES_START](state) {
      state.games.pending = true;
    },
    [mutationTypes.GET_MORE_GAMES_SUCCESS](state, payload) {
      const { pagination, data } = payload;
      state.games.pending = false;
      state.games.pagination = pagination;
      state.games.data.push(...data);
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
    fetchPlayers({ state, commit }) {
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
    async fetchGames({ commit, dispatch }) {
      await dispatch('fetchPlayers');
      commit(mutationTypes.GET_GAMES_START);

      const gamesRef = firestore.collection('games');

      gamesRef
        .orderBy('timestamp', 'desc')
        .limit(20)
        .get()
        .then((querySnapshot) => {
          const data = [];

          querySnapshot.forEach(doc => data.push({
            docId: doc.id,
            ...doc.data(),
          }));

          commit(mutationTypes.GET_GAMES_SUCCESS, {
            data,
            pagination: {
              next: querySnapshot.docs[querySnapshot.docs.length - 1],
            },
          });
        });
    },
    fetchMoreGames({ state, commit }) {
      if (state.games.pending) return;
      commit(mutationTypes.GET_MORE_GAMES_START);

      const gamesRef = firestore.collection('games');

      gamesRef
        .orderBy('timestamp', 'desc')
        .startAfter(state.games.pagination.next)
        .limit(20)
        .get()
        .then((querySnapshot) => {
          const next = querySnapshot.docs[querySnapshot.docs.length - 1];
          const data = [];

          querySnapshot.forEach(doc => data.push({
            docId: doc.id,
            ...doc.data(),
          }));

          commit(mutationTypes.GET_MORE_GAMES_SUCCESS, {
            data,
            pagination: {
              next,
            },
          });
        });
    },
    async fetchRanking({ dispatch }, site) {
      await dispatch('fetchPlayers');
      dispatch('fetchPlayerRanking', site);
      dispatch('fetchTeamRanking', site);
    },
    fetchPlayerRanking({ commit }, site) {
      commit(mutationTypes.GET_PLAYERS_RANKING_START);

      firestore
        .collection('playersRanking')
        .doc(site)
        .onSnapshot((querySnapshot) => {
          if (querySnapshot.exists) {
            commit(mutationTypes.GET_PLAYERS_RANKING_SUCCESS, {
              site,
              data: querySnapshot.data(),
            });
          }
        });
    },
    fetchTeamRanking({ commit }, site) {
      commit(mutationTypes.GET_TEAM_RANKING_START);

      firestore
        .collection('teamsRanking')
        .doc(site)
        .onSnapshot((querySnapshot) => {
          if (querySnapshot.exists) {
            commit(mutationTypes.GET_TEAM_RANKING_SUCCESS, {
              site,
              data: querySnapshot.data(),
            });
          }
        });
    },
  },
});
