import React from 'react';
import { Router, Route } from 'react-router';
import createBrowserHistory from 'history/createBrowserHistory'

import { API, APICollection, APIActionCollection } from 'app/api';

// Misc
import Header from 'app/header';

// Representations
import Transaction from 'app/repr/transaction';
import User from 'app/repr/user';

import Components from 'app/components';

// Setup API
API.user = new APICollection("user");
API.user.me = () => API.user.classMethod("GET", "me");
API.user.transactions = (userId, page = 1) => API.user.instanceMethod("GET", "transactions", userId, null, {page: page});
API.transaction = new APICollection("transaction");
API.payment_data = new APICollection("paymentdata");
API.countersignature = new APICollection("countersignature");
API.token =  new APIActionCollection("token", res => API.setToken(res.token));

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

function profile(props) {
  const userId = props.match.params.id;
  const UserView = Components.API.view(API.user, User);
  const TransactionCollection = Components.Higher.asyncCollection(
    _ => <span className="primary light">Transactions</span>,
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

function home(props) {
  return <Components.SignatureField width="320" height="200" />;
}

const loginForm = {
  username: <Components.TextField label="Username" />,
  password: <Components.TextField secure label="Password" />
};

const signupForm = {
  first_name: <Components.TextField label="First Name" />,
  last_name: <Components.TextField label="Last Name" />,
  email: <Components.TextField email label="Email" />,
  username: <Components.TextField label="Username" />,
  password: <Components.TextField secure label="Password" />
};

const countersignForm = {
  user_id: "hidden",
  transaction_id: "hidden",
  signature: <Components.SignatureField editable />
};

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

const paymentDataForm = {
  data: <Components.TextField label="Data" />,
  encryped: "checkbox",
  user_id: "hidden"
};

const paymentDataDefaults = API.user.me().then(user => ({
  data: "",
  encrypted: false,
  user_id: user.id
}));

const transactionForm = {
  "offer": <Components.TextField label="Offer" />,
  "offer_currency": <Components.TextField label="Currency" />,
  "required_witnesses": <Components.TextField label="Number of Witnesses" />,
  "buyer_id": "hidden",
  "buyer_payment_data_id": "hidden",
  "seller_id": "hidden",
  "seller_payment_data_id": "hidden"
};

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

const history = createBrowserHistory({forceRefresh: true});

const App = () => (
  <Router history={history} >
    <div>
      <Header title="Home" />
      <div className="content">
        <Route exact path="/" component={home} />

        <Route exact path="/login" component={Components.API.form(API.token, loginForm)} />
        <Route exact path="/signup" component={Components.API.form(API.user, signupForm)} />

        <Route exact path="/token" component={Components.rewritePath(/.*/, "/user/me")} />
        <Route exact path="/user/me" component={Components.rewritePath(
            /.*/,
            API.user.me().then(res => "/user/" + res.id.toString())
          )} />

        <Route exact path='/user/:id' component={profile} />
        <Route exact path='/user/:id/transaction/:action' component={Components.API.form(API.transaction, transactionForm, transactionDefaults)} />

        <Route exact path='/transaction/:id' component={Components.API.view(API.transaction, Transaction)} />
        <Route exact path='/transaction/:id/countersign' component={Components.API.form(API.countersignature, countersignForm, countersignDefaults)} />

        <Route exact path='/payment/new' component={Components.API.form(API.payment_data, paymentDataForm, paymentDataDefaults)} />
      </div>
    </div>
  </Router>
);

export default App;
