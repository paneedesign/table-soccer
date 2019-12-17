import Vue from 'vue';
import Vuex from 'vuex';
import { firestore } from '../firebase';
import getPlayerData from '../utils/player';
import config from '../config';

Vue.use(Vuex);

const mutationTypes = {
  GET_PLAYERS_START: 'GET_PLAYERS_START',
  GET_PLAYERS_SUCCESS: 'GET_PLAYERS_SUCCESS',
  GET_GAMES_START: 'GET_GAMES_START',
  GET_GAMES_SUCCESS: 'GET_GAMES_SUCCESS',
  GET_MORE_GAMES_START: 'GET_MORE_GAMES_START',
  GET_MORE_GAMES_SUCCESS: 'GET_MORE_GAMES_SUCCESS',
  SET_GAMES_ORDER_BY: 'SET_GAMES_ORDER_BY',
  GET_PLAYERS_RANKING_START: 'GET_PLAYERS_RANKING_START',
  GET_PLAYERS_RANKING_SUCCESS: 'GET_PLAYERS_RANKING_SUCCESS',
  GET_TEAM_RANKING_START: 'GET_TEAM_RANKING_START',
  GET_TEAM_RANKING_SUCCESS: 'GET_TEAM_RANKING_SUCCESS',
  SET_PLAYERS_RANKING: 'SET_PLAYERS_RANKING',
  SET_TEAM_RANKING: 'SET_TEAM_RANKING',
};

export default new Vuex.Store({
  state: {
    playersRef: {
      data: [],
      pending: false,
    },
    games: {
      data: [],
      pending: false,
      orderBy: {
        prop: 'timestamp',
        value: 'desc',
      },
      pagination: {
        next: undefined,
      },
    },
    playersRanking: {},
    teamsRanking: {},
    pending: {
      playersRanking: false,
      teamsRanking: false,
    },
  },
  getters: {
    formatGames: state => state.games.data.map(game => ({
      id: game.docId,
      redDefender: getPlayerData(game.redTeam.defender.id, state.playersRef.data),
      redStriker: getPlayerData(game.redTeam.striker.id, state.playersRef.data),
      blueDefender: getPlayerData(game.blueTeam.defender.id, state.playersRef.data),
      blueStriker: getPlayerData(game.blueTeam.striker.id, state.playersRef.data),
      redScore: game.redTeam.score,
      blueScore: game.blueTeam.score,
      site: game.site,
      timestamp: game.timestamp.toDate(),
    })),
    hasMoreGames: state => state.games.pagination.next,
    formatPlayerRanking: state => site => Object.keys(state.playersRanking[site])
      .map((playerId) => {
        const ranking = state.playersRanking[site][playerId];
        const player = getPlayerData(playerId, state.playersRef.data);

        return {
          player,
          lost: ranking.played - ranking.won,
          ...ranking,
        };
      })
      .filter(ranking => ranking.player.enabled
          && ranking.played > config.playerRankingMinPlayedGames),
    formatTeamRanking:
      state => site => Object.keys(state.teamsRanking[site])
        .map((rankingKey) => {
          const ranking = state.teamsRanking[site][rankingKey];
          const [defenderId, strikerId] = rankingKey.split('-');
          const defender = getPlayerData(defenderId, state.playersRef.data);
          const striker = getPlayerData(strikerId, state.playersRef.data);

          return {
            defender,
            striker,
            lost: ranking.played - ranking.won,
            ...ranking,
          };
        }).filter(ranking => ranking.defender.enabled
          && ranking.striker.enabled),
  },
  mutations: {
    [mutationTypes.GET_PLAYERS_START](state) {
      state.playersRef.pending = true;
    },
    [mutationTypes.GET_PLAYERS_SUCCESS](state, payload) {
      state.playersRef.pending = false;
      state.playersRef.data = payload.data;
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
    [mutationTypes.SET_GAMES_ORDER_BY](state, payload) {
      state.games.orderBy = payload.orderBy;
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
      if (state.playersRef.data.length) return Promise.resolve;

      commit(mutationTypes.GET_PLAYERS_START);
      return firestore
        .collection('players')
        .orderBy('fullName', 'asc')
        .get()
        .then((querySnapshot) => {
          const data = [];
          querySnapshot.forEach(doc => data.push(doc));
          commit(mutationTypes.GET_PLAYERS_SUCCESS, {
            data,
          });
        });
    },
    async fetchGames({ state, commit, dispatch }) {
      if (state.playersRef.data.length === 0) {
        await dispatch('fetchPlayers');
      }

      commit(mutationTypes.GET_GAMES_START);

      firestore.collection('games')
        .orderBy(state.games.orderBy.prop, state.games.orderBy.value)
        .limit(20)
        .onSnapshot((querySnapshot) => {
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

      firestore.collection('games')
        .orderBy(state.games.orderBy.prop, state.games.orderBy.value)
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
    changeGamesOrder({ commit, dispatch }, orderBy) {
      commit(mutationTypes.SET_GAMES_ORDER_BY, {
        orderBy,
      });
      dispatch('fetchGames');
    },
    async fetchRanking({ state, dispatch }, site) {
      if (state.playersRef.data.length === 0) {
        await dispatch('fetchPlayers');
      }

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
