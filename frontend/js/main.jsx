import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { Switch, Route, Link, browserHistory } from 'react-router';
import { JSON, JSONObject, JSONCollection } from 'app/json';
import Networking from 'app/networking';

var body = document.getElementsByTagName("body")[0];
var container = document.createElement("div");
body.appendChild(container);
// TODO: caching using browser sessionStorage

// Login

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: ""
    }
    this.handleUsernameChange = this.handleUsernameChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.goToUser = this.goToUser.bind(this);
  }

  render() {
    return (
      <div>
        <input type="text" onChange={(e) => this.handleUsernameChange(e)} />
        <input type="password" onChange={(e) => this.handlePasswordChange(e)} />
        <button onClick={() => this.handleLogin()}>Login</button>
      </div>
    );
  }
 
  handleLogin() {
    Networking.create.appendPath("api", "token")
                     .withMethod("POST")
                     .asJSON()
                     .withBody({
                       username: this.state.username,
                       password: this.state.password
                     })
                    .go((res) => {
      localStorage.setItem("token", (res.body || {token: null}).token);
      if (res.error != null) {
        this.props.history.push("/login");
      } else {
        this.props.history.push("/user/me");
      }
    });
  }

  handleUsernameChange(e) {
    e.persist();
    this.setState((st) => {
      return { username: e.target.value, password: st.password };
    });
  }
  
  handlePasswordChange(e) {
    e.persist();
    this.setState((st) => {
      return { username: st.username, password: e.target.value };
    });
  }
}

// HOME

class HomePage extends React.Component {
  render() {
    return (
      <div>
        <p>HOME</p>
        <button onClick={(_) => this.props.history.push("/user/me")}>Profile</button>
      </div>
    );
  }
}

class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.buyFrom = this.buyFrom.bind(this);
    this.sellTo = this.sellTo.bind(this);
  }

  render() {
    return (
      <div>
        <JSONObject path={"/api/user/" + this.props.match.params.user + "/"} component={UserRepresentation} />
        <button onClick={this.buyFrom}>Buy From</button>
        <button onClick={this.sellTo}>Sell To</button>
        <JSONCollection path="/api/transaction/" component={TransactionRepresentation} />
      </div>
    );
  }

  buyFrom() {
    this.context.history.push("/user/" + this.props.match.params.user + "/transaction/buy");
  }

  sellTo() {
    this.context.history.push("/user/" + this.props.match.params.user + "/transaction/sell");
  }
}

class UserRepresentation extends React.Component {
  render() {
    var element = this.props.element;
    if (element.isPersisted) {
      if (element.error != null) {
        return <h1>Error: {element.error}</h1>;
      } else if (element.object != null) {
        var user = element.object;
        return <h1>Welcome, @{user.username}!</h1>;
      } else {
        return <h3></h3>;
      }
    } else {
      return <h1>Signup Needed</h1>;
    } 
  }
}

class TransactionRepresentation extends React.Component {
  constructor(props) {
    super(props);
    this.handleCurrencyChange = this.handleCurrencyChange.bind(this);
  }

  render() {
    var e = this.props.element;
    return (
      <div>
        <input type="text" defaultValue={e.object.offer} onBlur={(e) => this.handleCurrencyChange(e)} />
        <span>{e.object.offer_currency}</span>
        <a href={"/user/" + e.object.buyer.id}>Buyer: {e.object.buyer.username}</a>
        <a href={"/user/" + e.object.seller.id}>Seller: {e.object.seller.username}</a>
      </div>
    );
  }

  handleCurrencyChange(e) {
    this.props.element.object.offer = parseFloat(e.target.value);
    this.props.element.save();
  }
}

// TODO: create-or-render component

class CreateTransaction extends React.Component {
  constructor(props) {
    super(props);
    this.create = this.create.bind(this);
    this.renderCreateForm = this.renderCreateForm.bind(this);
  }

  render() {
    return <JSONObject path="/api/transaction/" autoload={false} component={TransactionRepresentation} createComponent={this.renderCreateForm} />;
  }

  renderCreateForm(props) {
    var e = props.element;
    e.state.object = e.object || {};
    return (
      <div>
        <input type="text" placeholder="offer" onChange={(ev) => e.object.offer = parseInt(ev.target.value)}/>
        <input type="text" placeholder="currency" onChange={(ev) => e.object.offer_currency = ev.target.value}/>
        <button onClick={(_) => this.create(props.element)}>Create Transaction</button>
      </div>
    );
  }

  create(element) {
    var otherId = parseInt(this.props.match.params.user);
    var isBuyer = this.props.match.params.action == "buy";

    var n = Networking.create.appendPath("api").asJSON().withLocalTokenAuth("token");
    n.appendPath("user", "me").go((user) => {
      var meId = parseInt(user.body.id);
      if (otherId == "me") {
        otherId = meId;
      }
      n.appendPath("user", otherId, "payment").go((payment) => {
        element.object = element.object || {};
        element.object.buyer_id = isBuyer ? meId : otherId;
        element.object.buyer_payment_data_id = isBuyer ? payment.body.me.id : payment.body.them.id;
        element.object.seller_id = isBuyer ? otherId : meId;
        element.object.seller_payment_data_id = isBuyer ? payment.body.them.id : payment.body.me.id;
        element.object.required_witnesses = 0;
        element.save();
      });
    });
  }
}

class Header extends React.Component {
  render() {
    return (
      <div>
        <h1>Econesty</h1>
      </div>
    );
  }
}

ReactDOM.render((
   <BrowserRouter>
     <div>
       <Header/>
       <Route exact path="/" component={HomePage} />
       <Route exact path="/login" component={Login} />
       <Route exact path="/signup" component={Profile} />
       <Route exact path='/user/:user' component={Profile} />
       <Route path='/user/:user/transaction/:action' component={CreateTransaction} />
     </div>
   </BrowserRouter>
), container);
