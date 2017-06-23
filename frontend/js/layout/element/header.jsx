import React from 'react';
import 'style/header';
import { JSONObject, JSONSearchField } from 'app/json';

export default class Header extends React.Component {
  constructor(props) {
    super(props);
    this.showUser = this.showUser.bind(this);
  }

  render() {
    return (
      <div className="header">
        <ul>
          <li className="right"><JSONSearchField path="/api/user/" component={this.showUser} label="Search Users" /></li>
          <li className="left"><a href="/"><span>Econesty</span></a></li>
          <li className="right"><a href="/user/me">Profile</a></li> 
        </ul>
      </div>
    );
  }

  showUser(props) {
    var obj = props.element.object;
    return <div><a className="primary" href={"/user/" + obj.id.toString()}>{obj.username}</a></div>;
  }
}

