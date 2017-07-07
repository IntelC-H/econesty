import React from 'react';
import { Router, Route } from 'react-router';
import createBrowserHistory from 'history/createBrowserHistory'

import { API, APICollection, APIActionCollection } from 'app/api';

// Representations
import Transaction from 'app/repr/transaction';
import User from 'app/repr/user';

// Components
import Components, { Form } from 'app/components';

// Setup API
API.user = new APICollection("user");
API.user.me = () => API.user.classMethod("GET", "me");
API.user.transactions = (userId, page = 1) => API.user.instanceMethod("GET", "transactions", userId, null, {page: page});
API.transaction = new APICollection("transaction");
API.payment_data = new APICollection("paymentdata");
API.countersignature = new APICollection("countersignature");
API.token =  new APIActionCollection("token", res => API.setToken(res.token));

// setup browser history
const browserHistory = createBrowserHistory({forceRefresh: true});

function joinPromises(psDict) {
  var ps = [];
  for (var key in psDict) {
    if (psDict.hasOwnProperty(key)) {
      var value = psDict[key];
      ps.push(Promise.all([value, Promise.resolve(key)]).then(([res, k]) => {
        var ret = {};
        ret[k] = res;
        return ret;
      }));
    }
  }
  return Promise.all(ps).then(xs => xs.reduce((acc, x) => Object.assign(acc, x), {}));
}

function saveFormTo(api, f = null) {
  return obj => {
    var p = oid ? api.update(oid, obj) : api.create(obj);
    p.catch(e => {
      throw e;
    }).then(f || (() => undefined));
  };
}

function upsertFormTo(api, oid, f = null) {
  return obj => {
    var p = oid ? api.update(oid, obj) : api.create(obj);
    p.catch(e => {
      throw e;
    }).then(f || (() => undefined));
  };
}

function withAPI(api, form) {
  const flattenObject = obj => {
    return obj;
  };
  return props => {
    const WrappedForm = Component.Higher.withPromise(api.read(props.match.params.id).then(flattenObject), form);
    return <WrappedForm {...props} />;
  };
}

////////// APP JSX

function profile(props) {
  const userId = props.match.params.id;
  const UserView = withAPI(API.user, User);
  const TransactionCollection = Components.Higher.asyncCollection(
    () => <span className="primary light">Transactions</span>,
    Transaction,
    page => API.paginate(API.user.transactions(userId, page), API.transaction)
  );
  return (
    <div>
      <UserView {...props} />
      <button onClick={() => props.history.push("/user/" + userId + "/transaction/buy")}>Buy From</button>
      <button onClick={() => props.history.push("/user/" + userId + "/transaction/sell")}>Sell To</button>
      <TransactionCollection {...props} />
    </div>
  );
}

const home = props =>
  <div>
  </div>
;

///// FORMS

// Create-Only

const loginForm = props =>
  <Form.Form onSubmit={saveFormTo(API.token, obj => {
    API.setToken(obj.token);
    browserHistory.push("/user/me");
  })}>
    <Form.Element required text name="username" label="Username" wrapperClass="textfield" />
    <Form.Element required password name="password" label="Password" wrapperClass="textfield" />
  </Form.Form>
;

const signupForm = props =>
  <Form.Form onSubmit={saveFormTo(API.user, user => browserHistory.push("/user/" + user.id))}>
    <Form.Element required text     name="first_name" label="First Name" wrapperClass="textfield" />
    <Form.Element required text     name="last_name"  label="Last Name" wrapperClass="textfield" />
    <Form.Element required email    name="email"      label="Email" wrapperClass="textfield" />
    <Form.Element required text     name="username"   label="New Username" wrapperClass="textfield" />
    <Form.Element required password name="password"   label="New Password" wrapperClass="textfield" />
  </Form.Form>
;

const countersignForm = props =>
  <Form.Form onSubmit={saveFormTo(API.countersignature, cs => browserHistory.push("/transaction/" + cs.transaction.id))}>
    <Form.Element hidden name="user_id" />
    <Form.Element hidden name="transaction_id" />
    <Components.SignatureField editable />
  </Form.Form>
;

const countersignDefaults = props => {
  var transid = parseInt(props.match.params.id);
  return joinPromises({
    me: API.user.me(),
    transaction: API.transaction.read(transid)
  }).then(res => ({
    user_id: res.me.id,
    transaction_id: res.transaction.id,
    signature: ""
  }));
};

// Create/update forms.

const paymentDataForm = props =>
  <Form.Form onSubmit={upsertFormTo(API.payment_data, props.match.params.id, pd => browserHistory.push("/payment/" + pd.id))}>
    <Form.Element required text name="data" label="Data" wrapperClass="textfield" />
    <Form.Element checkbox name="encrypted" label="Encrypted" />
    <Form.Element hidden name="user_id" />
  </Form.Form>
;

const paymentDataDefaults = API.user.me().then(user => ({
  data: "",
  encrypted: false,
  user_id: user.id
}));

const transactionForm = props =>
  <Form.Form onSubmit={saveFormTo(API.transaction, props.match.params.id, t => browserHistory.push("/transaction/" + t.id))}>
    <Form.Element required text name="offer" label="Offer" wrapperClass="textfield" />
    <Form.Element required text name="offer_currency" label="Currency" wrapperClass="textfield" />
    <Form.Element required text name="required_witnesses" label="Number of Witnesses" wrapperClass="textfield" />
    <Form.Element hidden name="buyer_id" />
    <Form.Element hidden name="buyer_payment_data_id" />
    <Form.Element hidden name="seller_id" />
    <Form.Element hidden name="seller_payment_data_id" />
  </Form.Form>
;

const transactionDefaults = props => {
  var isBuyer = undefined;
  var otherId = undefined;

  if (props.match) {
    isBuyer = props.match.params.action === "buy";
    otherId = props.match.params.id;
    otherId = otherId === "me" ? undefined : parseInt(otherId);
  }

  return joinPromises({
    me: API.user.classMethod("GET", "me"),
    payment: API.user.instanceMethod("GET", "payment", otherId)
  }).then(res => ({
     "offer": "0.00",
     "offer_currency": "USD",
     "required_witnesses": "0",
     "buyer_id": isBuyer ? res.me.id : otherId,
     "buyer_payment_data_id": isBuyer ? res.payment.me.id : res.payment.them.id,
     "seller_id": isBuyer ? otherId : res.me.id,
     "seller_payment_data_id": isBuyer ? res.payment.them.id : res.payment.me.id
  }));
};

const showCount = props => {
  var obj = props.object;
  return  <div className="secondary">Showing {obj.results.length} of {obj.count}</div>
};

const showUser = props => {
  var obj = props.object;
  return <div><a className="primary" href={"/user/" + obj.id.toString()}>{obj.username}</a></div>;
};

const App =
  <Router history={browserHistory} >
    <div>
      <div className="header">
        <div className="header-item left">
          <a href="/" className="light">Econesty</a>
        </div>
        <div className="header-item right light">
          <Components.SearchField api={API.user} headerComponent={showCount} component={showUser} />
        </div>
        <div className="header-item right">
          <a href="/user/me" className="light">Profile</a>
        </div>
      </div>
      <div className="content">
        <Route exact path="/" component={home} />

        <Route exact path="/login" component={loginForm} />
        <Route exact path="/signup" component={signupForm} />

        <Route exact path="/user/me" component={Components.Higher.rewritePath(
            /.*/,
            API.user.me().then(res => "/user/" + res.id.toString())
          )} />

        <Route exact path='/user/:id' component={profile} />
        <Route exact path='/user/:id/transaction/:action' component={Components.Higher.withPromiseFactory(transactionDefaults, transactionForm)} />

        <Route exact path='/transaction/:id' component={withAPI(API.transaction, Transaction)} />
        <Route exact path='/transaction/:id/countersign' component={Components.Higher.withPromiseFactory(countersignDefaults, countersignForm)} />

        <Route exact path='/payment/new' component={Components.Higher.withPromise(paymentDataDefaults, paymentDataForm)} />
        <Route exact path='/payment/:id' component={withAPI(API.payment_data, paymentDataForm)} />
      </div>
    </div>
  </Router>
;

export default App;
