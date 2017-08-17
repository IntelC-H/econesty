import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { Form, ControlGroup, Input, SubmitButton} from 'app/components/forms';
import { Router } from 'app/components/routing';
import { API } from 'app/api';

function saveFormTo(api, f = null) {
  return obj => {
    api.create(obj).catch(e => {
      throw e;
    }).then(f || (() => undefined));
  };
}

const Signup = props =>
  <Form object={props.object} aligned>
    <ControlGroup label="First Name">
      <Input text required name="first_name" />
    </ControlGroup>
    <ControlGroup label="Last Name">
      <Input text required name="last_name" />
    </ControlGroup>
    <ControlGroup label="Email">
      <Input email required name="email" />
    </ControlGroup>
    <ControlGroup label="Username">
      <Input text required name="username" />
    </ControlGroup>
    <ControlGroup label="Password">
      <Input password required name="password" />
    </ControlGroup>
    <SubmitButton onSubmit={saveFormTo(API.user, user => Router.push("/user/" + user.id))}>
      SIGN UP
    </SubmitButton>
  </Form>
;

export default Signup;