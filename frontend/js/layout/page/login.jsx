import React from 'react';
import Networking from 'app/networking';

export default class Login extends React.Component {
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
        <TextField onChange={this.handleUsernameChange} />
        <TextField secure onChange={this.handlePasswordChange} />
        <button onClick={this.handleLogin}>Login</button>
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

  handleUsernameChange(tf) {
    this.setState((st) => {
      return { username: tf.value, password: st.password };
    });
  }
  
  handlePasswordChange(tf) {
    this.setState((st) => {
      return { username: st.username, password: tf.value };
    });
  }
}