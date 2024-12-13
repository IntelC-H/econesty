
/*
  State Structure
  {
    requirements: {
      fetched: <unix epoch offset>,
      loading: false,
      stopLoading: <fn>
      error: <string>,
      page: <int>,
      previousPage: <int>,
      nextPage: <int>,
      requirements: []
    },
    wallets: {
      fetched: <unix epoch offset>,
      loading: false,
      stopLoading: <fn>,
      error: <string>,
      wallets: []
    },
    transactionsCache: {
      <tid>: { ...transaction... }
    }
    transactions: {
      <user_id>: {
        fetched: <unix epoch offset>,
        loading: false,
        stopLoading: <fn>,
        error: <string>,
        page: <int>,
        previousPage: <int>,
        nextPage: <int>,
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
    transactions_in_progress: {
      "<sender_id>_<recipient_id>": {
        ...transactionShape
      }
    },
    searches: {
      <collection name>: {
        <query>: {
          results: [],
          page: <int>,
          previousPage: <int>,
          nextPage: <int>,
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

function replaceByIdPure(xs, obj) {
  return xs.map(x => x.id === obj.id ? obj : x);
}

function removeByIdPure(xs, id) {
  return xs.filter(x => x.id !== id);
}

function removeByIndexPure(xs, idx) {
  return xs.filter((x, i) => i !== idx);
}

const transaction_in_progress = (state = {}, { type, sender_id, recipient_id, ...actionRemaining }) => {
  let key = `${sender_id}_${recipient_id}`;
  switch (type) {
    case ActionTypes.TIP_REMOVE_REQUIREMENT: {
      const { index } = actionRemaining;
      let newState = Object.assign({}, state);
      let t = state[key] || {};
      newState[key] = { ...t, requirements: removeByIndexPure(t.requirements || [], index) };
      return newState;
    }
    case ActionTypes.TIP_UPDATE_REQUIREMENT: {
      const { update, index } = actionRemaining;

      let diff = { ...update };
      if (diff.user) diff.user_id = diff.user.id;

      let newState = {};
      for (let k in state) {
        if (k === key) {
          let { requirements, ...xs } = state[k];
          let rs = (requirements || []);
          if (index === -1) rs.push(diff);
          else {
            rs[index] = { ...(rs[index] || {}), ...diff };
          }
          newState[k] = { ...xs, requirements: rs };
        } else newState[k] = state[k];
      }
      return newState;
    }
    case ActionTypes.TIP_UPDATE: {
      const { update } = actionRemaining;
      let obj = {};
      obj[key] = { sender_id, recipient_id, requirements: [], ...(state[key] || {}), ...update };
      return { ...state, ...obj };
    }
    case ActionTypes.TIP_DELETE: {
      let newState = {};
      for (let k in state) {
        if (k !== key) newState[k] = state[k];
      }
      return newState;
    }
    default:
      return state;
  }
};

const requirements = (state = {}, { type, fetched, stopLoading, error, requirements, page, nextPage, previousPage, requirement }) => {
  switch (type) {
    case ActionTypes.REQUIREMENTS_START_LOAD:
      return { ...state, loading: true, stopLoading };
    case ActionTypes.REQUIREMENTS_ABORT_LOAD:
      return { ...state, loading: false, stopLoading: () => undefined };
    case ActionTypes.LOAD_REQUIREMENTS_COMPLETE:
      return { ...state, loading: false, stopLoading: () => undefined, fetched, error, nextPage, previousPage, page, requirements };
    case ActionTypes.SAVE_REQUIREMENT_COMPLETE:
      return { ...state, loading: false, stopLoading: () => undefined, error, requirements: replaceByIdPure(state.requirements, requirement) };
    default:
      return state;
  }
};

const wallets = (state = { fetched: -1, loading: false, error: null, wallets: [], stopLoading: () => undefined }, { type, error, wallets, fetched, stopLoading, wallet }) => {
  switch (type) {
    case ActionTypes.WALLETS_START_LOAD:
      return { ...state, loading: true, stopLoading };
    case ActionTypes.WALLETS_ABORT_LOAD:
      return { ...state, loading: false, stopLoading: () => undefined };
    case ActionTypes.LOAD_WALLETS_COMPLETE:
      return { ...state, loading: false, stopLoading: () => undefined, fetched, error, wallets };
    case ActionTypes.CREATE_WALLET_COMPLETE:
      return { ...state, loading: false, stopLoading: () => undefined, error, wallets: state.wallets.concat([wallet]) };
    case ActionTypes.DELETE_WALLET_COMPLETE:
      return { ...state, loading: false, stopLoading: () => undefined, error, wallets: state.wallets.filter(w => w.id !== wallet.id) };
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

const transactionCache = (state = {}, { type }) => {
  switch (type) {

    default: return state;
  };
};

export const root = combineReducers({
  requirements,
  wallets,
  users,
  transactions,
  transactionCache,
  transaction_in_progress
});
