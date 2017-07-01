import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Route } from 'react-router';

import API from 'app/api';
import APIComponent from 'app/components/apicomponent';

// Misc
import Header from 'app/header';

// Representations
import Transaction from 'app/repr/transaction';
import User from 'app/repr/user';

import Components from 'app/components';

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
  return Promise.all(ps).then((xs) => xs.reduce((acc, x) => Object.assign(acc, x), {}));
}

function profile(props) {
  return (
    <div>
      <APIComponent api={API.user} objectId={props.match.params.user} component={User} />
      <button onClick={() => props.history.push("/user/" + props.match.params.user + "/transaction/buy")}>Buy From</button>
      <button onClick={() => props.history.push("/user/" + props.match.params.user + "/transaction/sell")}>Sell To</button>
      <APIComponent api={API.transaction} list component={Transaction} headerComponent={(props) => <span className="primary light">Transactions</span> } />
    </div>
  );
}

function home(props) {
  return null;
}

const loginForm = {
  username: Components.TextField,
  password: Components.TextField
}

const signupForm = {
  first_name: Components.TextField,
  last_name: Components.TextField,
  username: Components.TextField,
  email: Components.TextField
};

const countersignForm = {
  user_id: "hidden",
  transaction_id: "hidden",
  signature: Components.SignatureField
}

const countersignDefaults = (props) => {
  var transid = parseInt(props.match.params["transid"]);
  return joinPromises({
    me: API.user.class_method("GET", "me"),
    transaction: API.transaction.read(transid),
  }).then((res) => ({
    user_id: res.me.id,
    transaction_id: res.transaction.id,
    signature: ""
  }));
}

const paymentDataForm = {
  data: TextField,
  encryped: "checkbox",
  user_id: "hidden",
};

const paymentDataDefaults = API.user.class_method("GET", "me").then((user) => ({
  data: "",
  encrypted: false,
  user_id: user.id
}));

const transactionForm = {
  "offer": Components.TextField,
  "offer_currency": Components.TextField,
  "required_witnesses": Components.TextField,
  "buyer_id": "hidden",
  "buyer_payment_data_id": "hidden",
  "seller_id": "hidden",
  "seller_payment_data_id": "hidden",
};

const transactionDefaults = (props) => {
  var isBuyer = undefined;
  var otherId = undefined;

  if (props.match) {
    isBuyer = props.match.params["action"] == "buy";
    otherId = props.match.params["user"];
    otherId = otherId == "me" ? undefined : parseInt(otherId);
  }

  return joinPromises({
    me: API.user.class_method("GET", "me"),
    payment: API.user.instance_method("GET", "payment", otherId)
  }).then((res) => ({
     "offer": "0.00",
     "offer_currency": "USD",
     "required_witnesses": "0",
     "buyer_id": isBuyer ? res.me.id : otherId,
     "buyer_payment_data_id": isBuyer ? res.payment.me.id : res.payment.them.id,
     "seller_id": isBuyer ? otherId : res.me.id,
     "seller_payment_data_id": isBuyer ? res.payment.them.id : res.payment.me.id,
  }));
};

const App = (
  <Router>
    <div>
      <Header title="Home" />
      <div className="content">
        <Route exact path="/" component={home} />

        <Route exact path="/login" component={Components.Higher.API.form(API.token, loginForm)} />
        <Route exact path="/signup" component={Components.Higher.API.form(API.user, signupForm)} />

        <Route       path="/token" component={Components.redirectWith("/user/me")} />
        <Route exact path="/user/me" component={Components.redirectWith("me", API.user.class_method("GET", "me").then((res) => res.id))} />

        <Route exact path='/user/:user' component={profile} />
        <Route exact path='/user/:user/transaction/:action' component={Components.Higher.API.form(API.transaction, transactionForm, transactionDefaults)} />

        <Route exact path='/transaction/:id' component={Components.Higher.API.view(API.transaction, Transaction)} />
        <Route exact path='/transaction/:transid/countersign' component={Components.Higher.API.form(API.countersignature, countersignForm, countersignDefaults)} />

        <Route exact path='/payment/new' component={Components.Higher.API.form(API.payment_data, paymentDataForm, paymentDataDefaults)} />
      </div>
   </div>
  </Router>
);

export default App;