import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { ElementView, Form, FormGroup, Input } from 'base/base';

function EditProfile(props) {
  return null;
}

/*function EditableUser({ elementView }) {
  let user = elementView.getElement();
  return (
    <Flex container column alignItems="center">
      <img src={user.avatar_url} style={style.shape.circular} />
      <Flex container column alignItems="center" component={Form} onSubmit={elementView.updateElement}>
        <FormGroup>
          <Input text name="first_name" autocomplete="given-name" placeholder="First name" value={user.first_name} />
          <Input text name="last_name" autocomplete="family-name" placeholder="Last name" value={user.last_name} />
        </FormGroup>
        <FormGroup>
          <Input text name="username" autocomplete="username" placeholder="Username" value={user.username} />
          <Input text name="email" autocomplete="email" placeholder="email" value={user.email} />
        </FormGroup>
        <Button action="submit">Save</Button>
      </Flex>
    </Flex>
  );
}*/


export default EditProfile;
