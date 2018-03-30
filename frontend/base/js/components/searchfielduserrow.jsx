import { h } from 'preact'; // eslint-disable-line no-unused-vars
import { Flex } from 'base/base';

function UserRow({ element }) {
  return (
    <Flex container alignItems="center">
      <Flex component='img' src={element.avatar_url} className="circular"
            marginRight width="1rem" height="1rem" />
      <div>{element.username}</div>
    </Flex>
  );
}

export default UserRow;
