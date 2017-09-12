import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { Grid, GridUnit, ErrorDisplay, Labelled } from 'app/components/elements';
import { Form, Input, FormGroup, SubmitButton } from 'app/components/forms';
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
      <Grid>
        <GridUnit size="1" sm="4-24" />
        <GridUnit size="1" sm="16-24">
          <Form aligned onSubmit={this.login}>
            {!!this.state.error && <ErrorDisplay message={this.state.error.message} />}
            <FormGroup>
              <Labelled label="Username">
                <Input text required name="username" />
              </Labelled>
              <Labelled label="Password">
                <Input password required name="password" />
              </Labelled>
              <SubmitButton>LOGIN</SubmitButton>
            </FormGroup>
          </Form>
        </GridUnit>
        <GridUnit size="1" sm="4-24" />
      </Grid>
    );
  }
}

export default Login;
