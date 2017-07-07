import React from 'react';
import PropTypes from 'prop-types';

const defaultProps = {};
const propTypes = {
  object: PropTypes.shape({
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    username: PropTypes.string,
    date_joined: PropTypes.string
  })
};

const User = props => {
  var obj = props.object;
  return (
    <div className="user">
      <p className="primary">{obj.first_name} {obj.last_name}</p>
      <p className="secondary">{obj.username}, member since {new Date(obj.date_joined).toLocaleString(navigator.language)}</p>
    </div>
  );
};

User.defaultProps = defaultProps;
User.propTypes = propTypes;

export default User;