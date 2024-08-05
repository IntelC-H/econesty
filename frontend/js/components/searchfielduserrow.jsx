import { h } from 'preact'; // eslint-disable-line no-unused-vars

function UserRow({ element }) {
  return (
    <div className="user-row">
      <img src={element.avatar_url} />
      <div>{element.username}</div>
    </div>
  );
}

export default UserRow;
