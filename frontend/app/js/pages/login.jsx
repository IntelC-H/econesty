import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { Router, API, Form, Input, FormGroup, Flex } from 'base/base';
import { FlexControlBlock } from 'app/common';
import { noSelect } from 'base/style/mixins';
import style from 'app/style';

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
       <Flex container column alignItems="center">
         <h1 style={{ ...style.text.primary, ...noSelect() }}>Welcome Back!</h1>
         <Form onSubmit={this.login} method="POST">
           {!!this.state.error && <p>{this.state.error.message}</p>}
           <FormGroup>
             <FlexControlBlock label="Username">
               <Input text required name="username" />
             </FlexControlBlock>
             <FlexControlBlock label="Password">
               <Input password required name="password" />
             </FlexControlBlock>
             <Flex container alignItems="center" justifyContent="center">
               <button type="submit">Login</button>
             </Flex>
           </FormGroup>
         </Form>
       </Flex>
    );
  }
}

export default Login;
