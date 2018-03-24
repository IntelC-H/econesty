import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { Labelled, Button, SideMargins, Loading } from 'base/components/elements';
import { API, Router, FlexContainer, Form, FormGroup, Input,
         FadeTransition } from 'base/base';

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
    return (
      <FadeTransition>
        {loading && <Loading fadeIn fadeOut key="loading" />}
        {!loading && <SideMargins fadeIn fadeOut key="content">
          <FlexContainer direction="column" wrap="wrap" alignItems="center">
              <h3>Sign up for an Econesty account</h3>
              <p>Signing up gives you the benefit of a community dedicated to protecting your bitcoin wallet!</p>
          </FlexContainer>
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
        </SideMargins>}
      </FadeTransition>
    );
  }
}

export default Signup;
