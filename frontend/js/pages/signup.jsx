import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { Labelled } from 'app/components/elements';
import { Form, ControlGroup, Input } from 'app/components/forms';
import { Router } from 'app/components/routing';
import { API } from 'app/api';

function saveFormTo(api, f = null) {
  return obj => {
    api.create(obj).catch(e => {
      throw e;
    }).then(f || (() => undefined));
  };
};

const Signup = props =>
  <Form
    aligned
    onSubmit={saveFormTo(API.user, u => Router.push("/user/" + u.id))}>
    <Labelled label="First Name">
      <Input text required name="first_name" />
    </Labelled>
    <Labelled label="Last Name">
      <Input text required name="last_name" />
    </Labelled>
    <Labelled label="Email">
      <Input email required name="email" />
    </Labelled>
    <Labelled label="Username">
      <Input text required name="username" />
    </Labelled>
    <Labelled label="Password">
      <Input password required name="password" />
    </Labelled>
    <Button action="submit">SIGN UP</Button>
  </Form>
;

export default Signup;
