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
  return (dispatch, getState) => {
    let transactions = getState().transactions[userId];
    if (!transactions || page !== transactions.page || (transactions.fetched + refetchInterval < new Date().getTime())) {
      let p = API.user.append("/" + userId + "/transactions").list(page);
      dispatch(_loadTransactionsStart(userId, p.abort));
      p.catch(err => {
         if (err.name === "AbortError") {
           dispatch(_loadTransactionsAbort(userId));
         } else {
           dispatch(_loadTransactionsComplete(userId, new Date().getTime(), err, null, null, null, null, null));
         }
       }).then(res  => {
         dispatch(_loadTransactionsComplete(userId, new Date().getTime(), null, res.results, page, res.next, res.previous, res.count));
       });
    }
  };
}

const _loadRequirementsStart = (stopLoading) => ({ type: ActionTypes.LOAD_REQUIREMENTS_START, stopLoading });
const _loadRequirementsAbort = () => ({ type: ActionTypes.LOAD_REQUIREMENTS_ABORT });
const _loadRequirementsComplete = (fetched, error, requirements, page, nextPage, previousPage, count) => ({ type: ActionTypes.LOAD_REQUIREMENTS_COMPLETE, fetched, error, requirements, page, nextPage, previousPage, count});

export function reloadRequirements(page, refetchInterval = 3600000) {
  return (dispatch, getState) => {
    let rs = getState().requirements;
    if (!rs || rs.page !== page || (rs.fetched + refetchInterval < new Date().getTime())) {
      let p = API.requirement.withParams({ user__id: API.getUserID() }).list(page);
      dispatch(_loadRequirementsStart(p.abort));
      p.catch(err => {
         if (err.name === "AbortError") {
           dispatch(_loadRequirementsAbort());
         } else {
           dispatch(_loadRequirementsComplete(new Date().getTime(), err, null, null, null, null, null));
         }
       }).then(res  => {
         dispatch(_loadRequirementsComplete(new Date().getTime(), null, res.results, page, res.next, res.previous, res.count));
       });
    }
  };
}
