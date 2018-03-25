import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { Button, SideMargins } from 'base/components/elements';
import { API, Router, Flex, Form, FormGroup, Input, FadeTransition, Loading } from 'base/base';

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
        <Flex container direction="column" wrap="wrap" alignItems="center">
          <h1>New Account</h1>
          <p>Signing up gives you the benefit of a community dedicated to protecting your bitcoin wallet!<br /><br />Econesty will never ask you to verify your email address, nor send you email. That's annoying!</p>
          <Form onSubmit={this.signupAndLogin}>
            <FormGroup>
                <Flex container alignItems="center">
                  <label style={{minWidth: "7.5em"}}>First Name</label>
                  <Input text required autocomplete="given-name" name="first_name" />
                </Flex>
                <Flex container alignItems="center">
                  <label style={{minWidth: "7.5em"}}>Last Name</label>
                  <Input text required autocomplete="family-name" name="last_name" />
                </Flex>
                <Flex container alignItems="center">
                  <label style={{minWidth: "7.5em"}}>Email</label>
                  <Input email required autocomplete="email" name="email" />
                </Flex>
                <Flex container alignItems="center">
                  <label style={{minWidth: "7.5em"}}>Username</label>
                  <Input text required name="username" />
                </Flex>
                <Flex container alignItems="center">
                  <label style={{minWidth: "7.5em"}}>Password</label>
                  <Input password required name="password" />
                </Flex>
                <Flex container justifyContent="center">
                  <Button action="submit">SIGN UP</Button>
                </Flex>
            </FormGroup>
          </Form>
              </Flex>
        </SideMargins>}
      </FadeTransition>
    );
  }
}

export default Signup;
