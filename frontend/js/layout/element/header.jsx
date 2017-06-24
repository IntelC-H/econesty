import React from 'react';
import 'style/header';
import { JSONObject, JSONSearchField } from 'app/json';

export default class Header extends React.Component {
  constructor(props) {
    super(props);
    this.showUser = this.showUser.bind(this);
    this.showCount = this.showCount.bind(this);
  }

  render() {
    return (
      <div className="header">
        <ul>
          <li className="right"><JSONSearchField path="/api/user/" headerComponent={this.showCount} component={this.showUser} label="Search Users" /></li>
          <li className="left"><a href="/"><span>Econesty</span></a></li>
          <li className="right"><a href="/user/me">Profile</a></li> 
        </ul>
      </div>
    );
  }

  showCount(props) {
    var obj = props.element.object;
    return  <div className="secondary">Showing {obj.results.length} of {obj.count}</div>
  }

  showUser(props) {
    var obj = props.element.object;
    return <div><a className="primary" href={"/user/" + obj.id.toString()}>{obj.username}</a></div>;
  }
}

