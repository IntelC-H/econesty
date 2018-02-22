import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { Labelled, Button, SideMargins } from 'app/components/elements';
import { Form, Input } from 'app/components/forms';
import { Router } from 'app/components/routing';
import { API } from 'app/api';

function signupAndLogin(obj) {
  API.user.create(obj).then(() =>
    API.token.create({username: obj.username,
                      password: obj.password})
             .then(tok => {
               API.setToken(tok.key);
               Router.push("/user/me");
             })
  );
}

const Signup = props => // eslint-disable-line no-unused-vars
  <SideMargins>
    <Form onSubmit={signupAndLogin}>
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
    </Form>
  </SideMargins>
;

export default Signup;
