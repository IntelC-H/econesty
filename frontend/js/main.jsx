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
import SignatureField from 'app/components/signaturefield';
import TextField from 'app/components/textfield';

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
  username: TextField,
  password: TextField
}

const signupForm = {
  first_name: TextField,
  last_name: TextField,
  username: TextField,
  email: TextField
};

function countersignForm(props) {
  var transid = parseInt(this.props.match.params["transid"]);
  return Components.apiForm(API.transaction, {
    user_id: "hidden",
    transaction_id: "hidden",
    signature: SignatureField
  }, joinPromises({
    me: API.user.class_method("GET", "me"),
    transaction: API.transaction.read(transid),
  }).then((res) => ({user_id: res.me.id, transaction_id: res.transaction.id, signature: ""})))(props);
}

function paymentDataForm(props) {
  return Components.apiForm(API.payment_data, {
    data: TextField,
    encryped: "checkbox",
    user_id: "hidden",
  }, API.user.class_method("GET", "me").then((user) => ({
    data: "",
    encrypted: false,
    user_id: user.id
  })))(props);
}

function transactionForm(props) {
  var isBuyer = undefined;
  var otherId = undefined;

  if (props.match) {
    isBuyer = props.match.params["action"] == "buy";
    otherId = props.match.params["user"];
    otherId = otherId == "me" ? undefined : parseInt(otherId);
  }

  return Components.apiForm(API.transaction, {
    "offer": TextField,
    "offer_currency": TextField,
    "required_witnesses": TextField,
    "buyer_id": "hidden",
    "buyer_payment_data_id": "hidden",
    "seller_id": "hidden",
    "seller_payment_data_id": "hidden",
  }, joinPromises({
       me: API.user.class_method("GET", "me"),
       payment: API.user.instance_method("GET", "payment", otherId),
     }).then((res) => {
      return ({
       "offer": "0.00",
       "offer_currency": "USD",
       "required_witnesses": "0",
       "buyer_id": isBuyer ? res.me.id : otherId,
       "buyer_payment_data_id": isBuyer ? res.payment.me.id : res.payment.them.id,
       "seller_id": isBuyer ? otherId : res.me.id,
       "seller_payment_data_id": isBuyer ? res.payment.them.id : res.payment.me.id,
     });})
  )(props);
}

const App = (
  <Router>
    <div>
      <Header title="Home" />
      <div className="content">
        <Route exact path="/" component={home} />

        <Route exact path="/login" component={Components.apiForm(API.token, loginForm)} />
        <Route exact path="/signup" component={Components.apiForm(API.user, signupForm)} />

        <Route       path="/token" component={Components.redirectWith("/user/me")} />
        <Route exact path="/user/me" component={Components.redirectWith("/user/", API.user.class_method("GET", "me"))} />

        <Route exact path='/user/:user' component={profile} />
        <Route exact path='/user/:user/transaction/:action' component={transactionForm} />

        <Route exact path='/transaction/:id' component={Components.showAPI(API.transaction, Transaction)} />
        <Route exact path='/transaction/:transid/countersign' component={countersignForm} />

        <Route exact path='/payment/new' component={paymentDataForm} />
      </div>
   </div>
  </Router>
);

export default App;