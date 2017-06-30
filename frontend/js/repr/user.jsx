import React from 'react';

export default class User extends React.Component {
  render() {
    var obj = this.props.object;
    return (
      <div className="user">
        <p className="primary">{obj.first_name} {obj.last_name}</p>
        <p className="secondary">{obj.username}, member since {new Date(obj.date_joined).toLocaleString(navigator.language)}</p>
      </div>
    );
  }
}
