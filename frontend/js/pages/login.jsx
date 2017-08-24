import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { Grid, GridUnit, ErrorDisplay } from 'app/components/elements';
import { Form, Input, ControlGroup, SubmitButton } from 'app/components/forms';
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
      this.setState(st => ({...st, error: e}))
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
          <Form object={this.form ? Form.toObject(this.form.base) : {}}
                aligned
                ref={c => this.form = c }>
            {!!this.state.error && <ErrorDisplay message={this.state.error.message} />}
            <ControlGroup label="Username">
              <Input text required name="username" />
            </ControlGroup>
            <ControlGroup label="Password">
              <Input password required name="password" />
            </ControlGroup>
            <SubmitButton onSubmit={this.login}>LOGIN</SubmitButton>
          </Form>
        </GridUnit>
        <GridUnit size="1" sm="4-24" />
      </Grid>
    );
  }
}

export default Login;