import Vue from 'vue';
import Vuex from 'vuex';
import { firestore } from './firebase';
import SITES from './utils/sites';
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
    playersRanking: {},
    teamsRanking: {},
    upcomingGames: [],
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
    [mutationTypes.SET_PLAYERS_RANKING](state, payload) {
      const { gamesRef, site } = payload;
      state.playersRanking[site] = getPlayersRanking(gamesRef, state.playersRef, site);
    },
    [mutationTypes.SET_TEAM_RANKING](state, payload) {
      const { gamesRef, site } = payload;
      state.teamsRanking[site] = getTeamsRanking(gamesRef, state.playersRef, site);
    },
    [mutationTypes.SET_UPCOMING_GAMES](state, unavailablePlayers) {
      const playersRef = state.playersRef
        .filter(playerRef => playerRef.data().site === SITES.CATANIA);
      const playersRanking = getPlayersRanking(state.gamesRef, state.playersRef, SITES.CATANIA)
        .filter(playerRanking => playersRef
          .find(playerRef => playerRef.id === playerRanking.playerId));

      state.upcomingGames = getUpcomingGames(
        playersRanking,
        unavailablePlayers,
        playersRef,
      );
    },
    [mutationTypes.SET_UPCOMING_GAMES_RANDOMLY](state, unavailablePlayers) {
      const playersRef = state.playersRef
        .filter(playerRef => playerRef.data().site === SITES.CATANIA);
      const playersRanking = getPlayersRanking(state.gamesRef, state.playersRef, SITES.CATANIA)
        .filter(playerRanking => playersRef
          .find(playerRef => playerRef.id === playerRanking.playerId));

      state.upcomingGames = getRandomUpcomingGames(
        playersRanking,
        unavailablePlayers,
        playersRef,
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

          Object.keys(SITES).forEach((key) => {
            const site = SITES[key];
            commit(mutationTypes.SET_PLAYERS_RANKING, {
              gamesRef,
              site,
            });
            commit(mutationTypes.SET_TEAM_RANKING, {
              gamesRef,
              site,
            });
          });
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
