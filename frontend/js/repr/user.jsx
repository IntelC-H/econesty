import { h } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
import { Image } from 'app/pure';
import md5 from 'blueimp-md5';

const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
function formatDate(datestr) {
  return new Date(datestr).toLocaleString(navigator.language, dateOptions);
}

const User = props => {
  var obj = props.object;
  return (
    <div className="user">
      <Image src={"https://www.gravatar.com/avatar/" + md5(obj.email)} />
      <div className="primary">{obj.first_name || "First Name"} {obj.last_name || "Last Name"}</div>
      <div>@{obj.username}</div>
      <div className="secondary">since {formatDate(obj.date_joined)}</div>
    </div>
  );
};

User.defaultProps = {};
User.propTypes = {
  object: PropTypes.shape({
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    username: PropTypes.string,
    date_joined: PropTypes.string
  })
};

export default User;