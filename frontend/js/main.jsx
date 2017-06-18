import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { Switch, Route, browserHistory } from 'react-router';
import { RESTComponent, RESTModel } from 'app/restobject';

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
    RESTModel.authenticate(this.state.username, this.state.password, () => {
      this.props.history.push("/user/me");
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
  render() {
    return (<RESTComponent
            resource="user"
            object={this.props.match.params.user}
            component={UserRepresentation}/>);
  }
}

class UserRepresentation extends React.Component {
  render() {
    var model = this.props.model;
    if (model.isPersisted) {
      if (model.error != null) {
        return <h1>Error: {model.error}</h1>;
      } else if (model.object != null) {
        var user = model.object;
        return <h1>Welcome, @{user.username}!</h1>;
      } else {
        return <h3></h3>;
      }
    } else {
      return <h1>Signup Needed</h1>;
    } 
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
