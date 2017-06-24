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
        <div className="header-item left"><a href="/" className="light">Econesty</a></div>
        <div className="header-item right light"><JSONSearchField path="/api/user/" headerComponent={this.showCount} component={this.showUser} label="Search Users" /></div>
        <div className="header-item right"><a href="/user/me" className="light">Profile</a></div> 
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

