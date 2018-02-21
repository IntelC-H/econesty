import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { Error, Labelled, Button, SideMargins } from 'app/components/elements';
import { Form, Input, FormGroup } from 'app/components/forms';
import { API } from 'app/api';
import { Router } from 'app/components/routing';

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
        Router.push("/user/me");
      }
    });
  }

  render() {
    return (
     <SideMargins>
       <Form onSubmit={this.login} method="POST">
         {!!this.state.error &&
           <Error>
             <p>{this.state.error.message}</p>
           </Error>}
         <FormGroup>
           <Labelled label="Username">
             <Input text required name="username" />
           </Labelled>
           <Labelled label="Password">
             <Input password required name="password" />
           </Labelled>
           <Button type="submit">LOGIN</Button>
         </FormGroup>
       </Form>
      </SideMargins>
    );
  }
}

export default Login;
