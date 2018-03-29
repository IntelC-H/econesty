import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { Router, API, Form, Input, FormGroup, Flex } from 'base/base';

class Login extends Component {
  constructor(props) {
    super(props);
    this.setState = this.setState.bind(this);
    this.login = this.login.bind(this);
    this.state = { error: null };
  }

  login(formData) {
    API.token.create(formData).catch(e => {
      this.setState(st => ({...st, error: e}));
    }).then(tok => {
      if (tok) {
        API.setToken(tok.key);
        API.setUserID(tok.user.id);
        Router.replace("/user/me");
      }
    });
  }

  render() {
    return (
       <Flex container direction="column" alignItems="center">
         <h1>Welcome Back!</h1>
         <Form onSubmit={this.login} method="POST">
           {!!this.state.error && <p>{this.state.error.message}</p>}
           <FormGroup>
             <Flex container alignItems="center">
               <label style={{minWidth: "6em"}}>Username</label>
               <Input text required name="username" />
             </Flex>
             <Flex container alignItems="center">
               <label style={{minWidth: "6em"}}>Password</label>
               <Input password required name="password" />
             </Flex>
             <Flex container alignItems="center" justifyContent="center">
               <button type="submit">LOGIN</button>
             </Flex>
           </FormGroup>
         </Form>
       </Flex>
    );
  }
}

export default Login;
