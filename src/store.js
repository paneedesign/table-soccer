import Vue from 'vue';
import Vuex from 'vuex';
import { firestore } from './firebase';
import { parseGames, parsePlayerRanking, parseTeamRanking } from './utils/parse';
import { getPlayersRanking, getTeamsRanking } from './utils/ranking';
import { getRandomUpcomingGames, getUpcomingGames } from './utils/games';
import { getPlayerIdByUid } from './utils/players';

Vue.use(Vuex);

const mutationTypes = {
  GET_PLAYERS_START: 'GET_PLAYERS_START',
  GET_PLAYERS_SUCCESS: 'GET_PLAYERS_SUCCESS',
  GET_GAMES_START: 'GET_GAMES_START',
  GET_GAMES_SUCCESS: 'GET_GAMES_SUCCESS',
  SET_PLAYERS_RANKING: 'SET_PLAYERS_RANKING',
  SET_TEAM_RANKING: 'SET_TEAM_RANKING',
  SET_UPCOMING_GAMES: 'SET_UPCOMING_GAMES',
  SET_UPCOMING_GAMES_RANDOMLY: 'SET_UPCOMING_GAMES_RANDOMLY',
  REMOVE_UPCOMING_GAME: 'REMOVE_UPCOMING_GAME',
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
    upcomingGames: [],
  },
  getters: {
    parsedGames: state => parseGames(state.gamesRef, state.playersRef),
    parsedPlayerRanking: state => parsePlayerRanking(state.playersRanking, state.playersRef),
    parsedTeamRanking: state => parseTeamRanking(state.teamsRanking, state.playersRef),
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
    [mutationTypes.SET_PLAYERS_RANKING](state, gamesRef) {
      state.playersRanking = getPlayersRanking(gamesRef, state.playersRef);
    },
    [mutationTypes.SET_TEAM_RANKING](state, gamesRef) {
      state.teamsRanking = getTeamsRanking(gamesRef, state.playersRef);
    },
    [mutationTypes.SET_UPCOMING_GAMES](state, unavailablePlayers) {
      state.upcomingGames = getUpcomingGames(
        getPlayersRanking(state.gamesRef, state.playersRef),
        unavailablePlayers,
        state.playersRef,
      );
    },
    [mutationTypes.SET_UPCOMING_GAMES_RANDOMLY](state, unavailablePlayers) {
      state.upcomingGames = getRandomUpcomingGames(
        getPlayersRanking(state.gamesRef, state.playersRef),
        unavailablePlayers,
        state.playersRef,
      );
    },
    [mutationTypes.REMOVE_UPCOMING_GAME](state, upcomingGameIndex) {
      state.upcomingGames.splice(upcomingGameIndex, 1);
    },
  },
  actions: {
    getPlayers({ state, commit }) {
      if (state.playersRef.length) return Promise.resolve;

      commit(mutationTypes.GET_PLAYERS_START);
      return firestore
        .collection('players')
        .where('enabled', '==', true)
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
    getUpcomingGames({ commit }, unavailablePlayers) {
      commit('SET_UPCOMING_GAMES', unavailablePlayers);
    },
    getUpcomingGamesRandomly({ commit }, unavailablePlayers) {
      commit('SET_UPCOMING_GAMES_RANDOMLY', unavailablePlayers);
    },
    removeUpcomingGame({ state, commit }, game) {
      const upcomingGameIndex = state.upcomingGames
        .findIndex(games => games.id === game.id);
      commit('REMOVE_UPCOMING_GAME', upcomingGameIndex);
    },
  },
});
