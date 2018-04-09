import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { SideMargins } from 'app/common';
import { API, Router, Flex, Form, FormGroup, Input, FadeTransition, Loading } from 'base/base';
import { FlexControlBlock } from 'app/common';
import { noSelect } from 'base/style/mixins';
import style from 'app/style';

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
        <Flex container column wrap alignItems="center">
          <p style={{ ...style.text.primary, ...noSelect() }}>New Account</p>
          <p style={{ ...style.text.secondary, ...noSelect() }}>Signing up gives you the benefit of a community dedicated to protecting your bitcoin wallet!<br /><br />Econesty will never ask you to verify your email address, nor send you email. That's annoying!</p>
          <Form onSubmit={this.signupAndLogin}>
            <FormGroup>
              <Flex container row>
                <FlexControlBlock label="First Name">
                  <Input text required autocomplete="given-name" name="first_name" />
                </FlexControlBlock>
                <FlexControlBlock label="Last Name">
                  <Input text required autocomplete="family-name" name="last_name" />
                </FlexControlBlock>
              </Flex>
              <FlexControlBlock label="Email">
                <Input email required autocomplete="email" name="email" />
              </FlexControlBlock>
              <FlexControlBlock label="Username">
                <Input text required name="username" />
              </FlexControlBlock>
              <FlexControlBlock label="Password">
                <Input password required name="password" />
              </FlexControlBlock>
              <Flex container justifyContent="center">
                <button action="submit">SIGN UP</button>
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
