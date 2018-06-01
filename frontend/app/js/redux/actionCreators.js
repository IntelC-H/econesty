import API from 'base/api';
import * as ActionTypes from './actionTypes';

export function reloadWallets(refetchInterval = 3600000) {
   return (dispatch, getState) => {
     let fetched = getState().wallets.fetched;
     if (fetched + refetchInterval < new Date.getTime()) {
       let p = API.wallet.withParams({ user__id: API.getUserID() }).listAll();
       dispatch({ type: ActionTypes.LOAD_WALLETS_START, stopLoading: p.abort });
       p.catch(err => {
         if (err.name === "AbortError") {
           dispatch({ type: ActionTypes.LOAD_WALLETS_ABORT });
         } else {
           dispatch({ type: ActionTypes.LOAD_WALLETS_COMPLETE, fetched: new Date().getTime(), error: err, wallets: [] });
         }
       }).then( res  => {
         dispatch({ type: ActionTypes.LOAD_WALLETS_COMPLETE, fetched: new Date().getTime(), error: null, wallets: res });
       });
     }
   };
}

const _loadUserStart = (userId, stopLoading) => ({ type: ActionTypes.LOAD_USER_START, userId, stopLoading });
const _loadUserAbort = (userId) => ({ type: ActionTypes.LOAD_USER_ABORT, userId });
const _loadUserComplete = (userId, fetched, error, user) => ({ type: ActionTypes.LOAD_USER_COMPLETE, userId, fetched, error, user });

export function reloadUser(userId, refetchInterval = 3600000) {
  return (dispatch, getState) => {
    let user = getState().users[userId];
     if (!user || (user.fetched + refetchInterval < new Date().getTime())) {
       let p = API.user.read(userId);
       dispatch(_loadUserStart(userId, p.abort));
       p.catch(err => {
         if (err.name === "AbortError") {
           dispatch(_loadUserAbort(userId));
         } else {
           dispatch(_loadUserComplete(userId, new Date().getTime(), err, null));
         }
       }).then(res  => {
         dispatch(_loadUserComplete(userId, new Date().getTime(), null, res));
       });
     }
  };
}

const _loadTransactionsStart = (userId, stopLoading) => ({ type: ActionTypes.LOAD_TRANSACTIONS_START, userId, stopLoading });
const _loadTransactionsAbort = (userId) => ({ type: ActionTypes.LOAD_TRANSACTIONS_ABORT, userId });
const _loadTransactionsComplete = (userId, fetched, error, transactions, page, nextPage, previousPage, count) => ({ type: ActionTypes.LOAD_TRANSACTIONS_COMPLETE, userId, fetched, error, transactions, page, nextPage, previousPage, count });

export function reloadTransactions(userId, page, refetchInterval = 3600000) {
  console.log("CREATING RELOAD TRANSACTIONS ACTION");
  return (dispatch, getState) => {
    let transactions = getState().transactions[userId];
    console.log("INSIDE THUNK", !transactions || (transactions.fetched + refetchInterval < new Date().getTime()));
    if (!transactions || page !== transactions.page || (transactions.fetched + refetchInterval < new Date().getTime())) {
      console.log("Placing promise");
      let p = API.user.append("/" + userId + "/transactions").list(page);
      dispatch(_loadTransactionsStart(userId, p.abort));
      p.catch(err => {
         if (err.name === "AbortError") {
           dispatch(_loadTransactionsAbort(userId));
         } else {
           dispatch(_loadTransactionsComplete(userId, new Date().getTime(), err, null, null));
         }
       }).then(res  => {
         dispatch(_loadTransactionsComplete(userId, new Date().getTime(), null, res.results, page, res.next, res.previous, res.count));
       });
    } else {
      console.log("Skipping", transactions);
    }
  };
}
