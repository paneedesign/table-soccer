import SITES from './sites';
import * as firebase from 'firebase';
import Timestamp = firebase.firestore.Timestamp;

export interface IRanking {
  [k: string]: {
    [x: string]: IRankingObject,
  }
}

export interface IRankingObject {
  won: number;
  played: number;
  goalScored: number;
  goalSuffered: number;
  rating: number;
}

export interface IGame {
  redTeam: {
    striker: {
      id: string;
    },
    defender: {
      id: string;
    }
    score: number;
  },
  blueTeam: {
    striker: {
      id: string;
    },
    defender: {
      id: string;
    }
    score: number;
  },
  site: SITES;
  timestamp: Timestamp;
}
