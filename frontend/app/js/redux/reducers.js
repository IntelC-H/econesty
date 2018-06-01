
/*
  State Structure
  {
    requirements: {
      fetched: <unix epoch offset>,
      loading: false,
      stopLoading: <fn>
      error: <string>,
      page: <int>,
      requirements: []
    },
    wallets: {
      fetched: <unix epoch offset>,
      loading: false,
      stopLoading: <fn>,
      error: <string>,
      wallets: []
    },
    transactions: {
      <user_id>: {
        fetched: <unix epoch offset>,
        loading: false,
        stopLoading: <fn>,
        error: <string>,
        page: <int>,
        transactions: []
      }
    },
    users: {
      <id>: {
        fetched: <unix epoch offset>,
        error: <string>,
        stopLoading: <fn>,
        loading: false,
	user: {},
      }
    },
    searches: {
      <collection name>: {
        <query>: {
          results: [],
          page: <int>,
          error: <string>,
          stopLoading: <fn>,
          loading: false,
          fetched: <unix epoch offset>
        }
      }
    }
  }

*/

import { combineReducers } from 'redux';
import * as ActionTypes from './actionTypes';

const requirements = (state = {}, action) => {
  return state;
};

const wallets = (state = { fetched: -1, loading: false, error: null, wallets: [], stopLoading: () => undefined }, { type, error, wallets, fetched, stopLoading }) => {
  switch (type) {
    case ActionTypes.LOAD_WALLETS_START:
      return { ...state, loading: true, stopLoading };
    case ActionTypes.LOAD_WALLETS_COMPLETE:
      return { ...state, loading: false, stopLoading: () => undefined, fetched, error, wallets };
    case ActionTypes.LOAD_WALLETS_ABORT:
      return { ...state, loading: false, stopLoading: () => undefined };
    default:
      return state;
  }
};

const users = (state = {}, { type, userId, user, error, fetched, stopLoading }) => {
  switch (type) {
    case ActionTypes.LOAD_USER_START: {
      let newState = Object.assign({}, state);
      newState[userId] = { ...(state[userId] || {}), loading: true, stopLoading };
      return newState;
    }
    case ActionTypes.LOAD_USER_ABORT: {
      let newState = Object.assign({}, state);
      newState[userId] = { ...(state[userId] || {}), loading: false, stopLoading: () => undefined };
      return newState;
    }
    case ActionTypes.LOAD_USER_COMPLETE: {
      let newState = Object.assign({}, state);
      newState[userId] = { ...(state[userId] || {}), loading: false, stopLoading: () => undefined, fetched, error, user };
      return newState;
    }
    default:
      return state;
  }
};

const transactions = (state = {}, { type, userId, transactions, page, nextPage, previousPage, count, error, fetched, stopLoading }) => {
  switch (type) {
    case ActionTypes.LOAD_TRANSACTIONS_START: {
      let newState = Object.assign({}, state);
      newState[userId] = { ...(newState[userId] || {}), loading: true, stopLoading };
      return newState;
    }
    case ActionTypes.LOAD_TRANSACTIONS_ABORT: {
      let newState = Object.assign({}, state);
      newState[userId] = { ...(newState[userId] || {}), loading: false, stopLoading: () => undefined };
      return newState;
    }
    case ActionTypes.LOAD_TRANSACTIONS_COMPLETE: {
      let newState = Object.assign({}, state);
      newState[userId] = { ...(newState[userId] || {}), loading: false, stopLoading: () => undefined, transactions, page, error, fetched, nextPage, previousPage, count };
      return newState;
    }
    default:
      return state;
  }
};

export const root = combineReducers({
  requirements,
  wallets,
  users,
  transactions
});
