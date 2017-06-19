import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { Switch, Route, browserHistory } from 'react-router';
import { Auth, JSON, JSONObject, JSONCollection } from 'app/json';

var container = document.getElementById("main");

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
    Auth.authenticate(this.state.username, this.state.password, this.goToUser);
  }

  goToUser(error) {
    if (error != null) {
      this.props.history.push("/login");
    } else {
      this.props.history.push("/user/me");
    }
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
  render() {
    return (
      <div>
        <JSONObject path={"/api/user/" + this.props.match.params.user + "/"} component={UserRepresentation} />
        <JSONCollection path="/api/transaction/" component={TransactionRepresentation} />
      </div>
    );
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
      </div>
    );
  }

  handleCurrencyChange(e) {
    e.persist();
    this.props.element.object.offer = parseFloat(e.target.value);
    this.props.element.save();
  }
}

ReactDOM.render((
   <BrowserRouter>
     <div>
       <Route exact path="/" component={HomePage} />
       <Route exact path="/login" component={Login} />
       <Route exact path="/signup" component={Profile} />
       <Route path='/user/:user' component={Profile} />
     </div>
   </BrowserRouter>
), container);
