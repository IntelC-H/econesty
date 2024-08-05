import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { Error, Labelled, Button, SideMargins } from 'base/components/elements';
import { Form, Input, FormGroup } from 'base/components/forms';
import { API } from 'base/api';
import { Router } from 'base/components/routing';

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
           <div className="centered">
             <Button type="submit">LOGIN</Button>
           </div>
         </FormGroup>
       </Form>
      </SideMargins>
    );
  }
}

export default Login;
