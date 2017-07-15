import React from 'react';
import PropTypes from 'prop-types';
import { Grid, GridUnit, Image } from 'app/pure';
import md5 from 'blueimp-md5';

const User = props => {
  var obj = props.object;
  console.log("USER: ", obj);
  return (
    <div className="user">
      <Image src={"https://www.gravatar.com/avatar/" + md5(obj.email)} />
      <h2 className="primary">{obj.first_name || "First Name"} {obj.last_name || "Last Name"}</h2>
      <h4>@{obj.username}</h4>
      <p className="secondary">since {new Date(obj.date_joined).toLocaleString(navigator.language)}</p>
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