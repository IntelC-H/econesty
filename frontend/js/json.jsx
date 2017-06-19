import React from 'react';
import ReactDOM from 'react-dom';
import 'whatwg-fetch';
import Networking from 'app/networking';

class Auth {
  static authenticate(username, password, callback) {
    new Networking().appendPath("api", "token")
                    .withMethod("POST")
                    .asJSON()
                    .withBody({
                      username: username,
                      password: password
                    })
                   .go((res) => {
      localStorage.setItem("token", (res.body || {token: null}).token);
      callback(res.error || null);
    });
  }

  static isAuthenticated() {
    return localStorage.getItem("token") != null;
  }
}

class JSON extends React.Component {
  constructor(props) {
    super(props);
    this.networking = this.props.networking || (new Networking().appendPath(this.props.path).asJSON().withLocalTokenAuth("token"));
    this.state = {
      object: this.props.object || null,
      error: this.props.error || null
    }
  }

  get object() { return this.state.object; }
  set object(v) { this.setState((st) => { return {object: v, error: null }}); }

  get error() { return this.state.error; }
  set error(v) { this.setState((st) => { return {object: null, error: v }}); }

  componentDidMount() { this.load(); }

  load() {
    this.networking.go((res) => this.setState({object: res.body || null, error: res.error || null}));
  }

  render() {
    return React.createElement(this.props.component, { element: this }, null);
  }
}

class JSONObject extends JSON {
  get isPersisted() { return this.objectID != null; }
  get objectID() { return (this.state.object || {id: null}).id; }

  save() {
    this.networking.withMethod("PATCH").withBody(this.flattenedObject).go((res) => {
      this.setState({object: res.body || null, error: res.error || null});
    });
  }

  // Returns a copy of this.state.object where nested fields with an .id attribute
  // are flattened:
  // { "user": { "id": 1 }, "bar": "baz" }
  // becomes
  // { "user_id": 1, "bar": "baz" }
  get flattenedObject() {
    var n = {};
    var obj = this.state.object;
    for (var k in obj) {
      var v = obj[k];
      var hasID = (v || {}).id != undefined;
      n[hasID ? (k + "_id") : k] = hasID ? v.id : v;
    }
    return n;
  }
}

// paginated JSON collection.
class JSONCollection extends JSON {
  get count() { return (this.object || {}).count; }
  get hasNext() { return (this.object || {next: null}).next != null; }
  get hasPrevious() { return (this.object || {previous: null}).previous != null; }

  next() {
    if (this.hasNext) {
      this.networking = this.networking.withURL(this.object.next);
      this.load();
    }
  }

  create(json) {
    this.networking.withMethod("POST").withBody(json).go((res) => {
      if ((res.body || null) != null) {
        this.object = res.body;
      } else if ((res.error || null) != null) {
        this.error = res.error;
      }
    });
  }

  previous() {
    if (this.hasPrevious) {
      this.networking = this.networking.withURL(this.object.previous);
      this.load();
    }
  }

  render() {
    if (this.object != null) {
      return (
        <div className="collection">
          {this.props.headerComponent != undefined && React.createElement(this.props.headerComponent, { collection: this }, null)};
          {this.hasPrevious && <button className="collection-nav-button" onClick={this.previous}>❮ Previous</button>}
          {this.hasNext && <button className="collection-nav-button" onClick={this.next}>Next ❯</button>}
          <div>
            {this.object.results.map((child, i) => <JSONObject
                                                    key={i}
                                                    collection={this}
                                                    object={child}
                                                    error={null}
                                                    networking={this.networking.appendPath(child.id)}
                                                    component={this.props.component} />)}
          </div>
        </div>
      ); 
    } else if (this.error != null) {
      return <h1>{this.error.message}</h1>;
    } else {
      return <div></div>;
    }
  }
}

export { Auth, JSON, JSONObject, JSONCollection }
