import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { Switch, Route, Link, browserHistory } from 'react-router';
import { JSON, JSONObject, JSONCollection, JSONSearchField } from 'app/json';
import Networking from 'app/networking';
import User from 'app/layout/repr/user';
import Transaction from 'app/layout/repr/transaction';
import TextField from 'app/layout/element/textfield';

var body = document.getElementsByTagName("body")[0];
var container = document.createElement("div");
body.appendChild(container);

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
        <JSONObject path={"/api/user/" + this.props.match.params.user + "/"} component={User} />
        <button onClick={this.buyFrom}>Buy From</button>
        <button onClick={this.sellTo}>Sell To</button>
        <JSONCollection path="/api/transaction/" component={Transaction} />
      </div>
    );
  }

  buyFrom() {
    this.props.history.push("/user/" + this.props.match.params.user + "/transaction/buy");
  }

  sellTo() {
    this.props.history.push("/user/" + this.props.match.params.user + "/transaction/sell");
  }
}

// TODO: redirect
class CreateTransaction extends React.Component {
  constructor(props) {
    super(props);
    this.create = this.create.bind(this);
    this.renderCreateForm = this.renderCreateForm.bind(this);
  }

  get isBuyer() {
    return this.props.match.params["action"] == "buy";
  }

  get otherUserId() {
    var u = this.props.match.params["user"];
    return parseInt(this.props.match.params["user"]);
  }

  render() {
    return <JSONObject path="/api/transaction/" autoload={false} component={Transaction} createComponent={this.renderCreateForm} />;
  }

  renderCreateForm(props) {
    var e = props.element;
    e.state.object = e.object || {};
    return (
      <div>
        <JSONObject path={"/api/user/" + this.otherUserId + "/"} component={(props) => {
          return (
            <h3>{this.isBuyer ? "Buying from" : "Selling to"} @{props.element.object.username}</h3>
          );
        }} />
        <input type="text" placeholder="offer" onChange={(ev) => e.object.offer = parseInt(ev.target.value)}/>
        <input type="text" placeholder="currency" onChange={(ev) => e.object.offer_currency = ev.target.value}/>
        <button onClick={(_) => this.create(props.element)}>Create Transaction</button>
      </div>
    );
  }

  create(element) {
    var n = Networking.create.appendPath("api").asJSON().withLocalTokenAuth("token");
    n.appendPath("user", "me").go((user) => {
      var meId = parseInt(user.body.id);
      n.appendPath("user", this.otherUserId || meId, "payment").go((payment) => {
        element.object = element.object || {};
        element.object.buyer_id = this.isBuyer ? meId : (this.otherUserId || meId);
        element.object.buyer_payment_data_id = this.isBuyer ? payment.body.me.id : payment.body.them.id;
        element.object.seller_id = this.isBuyer ? (this.otherUserId || meId) : meId;
        element.object.seller_payment_data_id = this.isBuyer ? payment.body.them.id : payment.body.me.id;
        element.save();
      });
    });
  }
}

class Header extends React.Component {
  constructor(props) {
    super(props);
    this.showUserInSearch = this.showUserInSearch.bind(this);
  }

  render() {
    return (
      <div className="header">
        <ul>
          <li>Econesty</li>
          <li><JSONSearchField path="/api/user/" component={this.showUserInSearch} placeholder="Search Users" /></li>
        </ul>
      </div>
    );
  }

  showUserInSearch(props) {
    var obj = props.element.object;
    return <div><a className="primary" href={"/user/" + obj.id.toString()}>{obj.username}</a></div>;
  }
}

class Testbed extends React.Component {
  render() {
    return <TextField label="Label" text="" />
  }
}

ReactDOM.render((
   <BrowserRouter>
     <div>
       <Header/>
       <div className="content">
         <Route exact path="/" component={HomePage} />
         <Route exact path="/login" component={Login} />
         <Route exact path="/signup" component={Profile} />
         <Route exact path='/user/:user' component={Profile} />
         <Route exact path='/user/:user/transaction/:action' component={CreateTransaction} />
         <Route exact path='/testbed' component={Testbed} />
       </div>
     </div>
   </BrowserRouter>
), container);
