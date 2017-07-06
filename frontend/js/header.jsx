import React from 'react';
import API from 'app/api';
import SearchField from 'app/components/searchfield';
import 'style/header';

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
        <div className="header-item right light"><SearchField api={API.user} headerComponent={this.showCount} component={this.showUser} /></div>
        <div className="header-item right"><a href="/user/me" className="light">Profile</a></div>
      </div>
    );
  }

  showCount(props) {
    var obj = props.object;
    return  <div className="secondary">Showing {obj.results.length} of {obj.count}</div>
  }

  showUser(props) {
    var obj = props.object;
    return <div><a className="primary" href={"/user/" + obj.id.toString()}>{obj.username}</a></div>;
  }
}

