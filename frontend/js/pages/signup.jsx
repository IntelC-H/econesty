import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { Labelled, Button, SideMargins, Loading, Grid, GridUnit } from 'app/components/elements';
import { Form, FormGroup, Input } from 'app/components/forms';
import { Router } from 'app/components/routing';
import { API } from 'app/api';

class Signup extends Component {
  constructor(props) {
    super(props);
    this.signupAndLogin = this.signupAndLogin.bind(this);
    this.state = { loading: false };
  }

  signupAndLogin(obj) {
    this.setState({ loading: true });
    API.user.create(obj).then(() =>
      API.token.create({username: obj.username,
                        password: obj.password})
               .then(tok => {
                 API.setToken(tok.key);
                 API.setUserID(tok.user.id);
                 Router.push("/user/" + tok.user.id);
               })
    );
  }

  render({}, { loading }) {
    if (loading) return <SideMargins><Loading /></SideMargins>;

    return (
      <SideMargins>
        <Grid style="text-align: center">
          <GridUnit size="1" md="1-6" />
          <GridUnit size="1" md="2-3">
            <h3>Sign up for an Econesty account</h3>
            <h4>Begin using Bitcoin with peace of mind!</h4>
            <p>Signing up gives you the benefit of a safe place to store your wallets & transaction history. Cryptocurrency doesn't have to be difficult to use!</p>
          </GridUnit>
          <GridUnit size="1" md="1-6" />
        </Grid>
        <Form onSubmit={this.signupAndLogin}>
          <FormGroup>
            <Labelled label="First Name">
              <Input text required autocomplete="given-name" name="first_name" />
            </Labelled>
            <Labelled label="Last Name">
              <Input text required autocomplete="family-name" name="last_name" />
            </Labelled>
            <Labelled label="Email">
              <Input email required autocomplete="email" name="email" />
            </Labelled>
            <Labelled label="Username">
              <Input text required name="username" />
            </Labelled>
            <Labelled label="Password">
              <Input password required name="password" />
            </Labelled>
            <div className="centered">
              <Button action="submit">SIGN UP</Button>
            </div>
          </FormGroup>
        </Form>
      </SideMargins>
    );
  }
}

export default Signup;
