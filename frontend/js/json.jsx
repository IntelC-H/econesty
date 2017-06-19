import React from 'react';
import ReactDOM from 'react-dom';
import 'whatwg-fetch';
import Networking from 'app/networking';

class Auth {
  static authenticate(username, password, callback) {
    Networking.root
              .appendPath("api", "token")
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
    this.state = {
      object: this.props.object || null,
      error: this.props.error || null,
      networking: this.props.networking || Networking.root.appendPath(this.props.path).asJSON().withLocalTokenAuth("token") 
    }
  }

  get object() { return this.state.object; }
  set object(v) { this.setState((st) => { return {object: v, error: null, path: st.path }}); }

  get error() { return this.state.error; }
  set error(v) { this.setState((st) => { return {object: null, error: v, path: st.path }}); }

  componentDidMount() {
    this.load()
  }

  load() {
    this.state.networking.go((res) => {
      this.setState((st) => {
        return {object: res.body || null, error: res.error || null, networking: st.networking };
      });
    });
  }

  render() {
    return React.createElement(this.props.component, { element: this }, null);
  }
}

class JSONObject extends JSON {
  get isPersisted() {
    return this.objectID != null; 
  }

  get objectID() {
    return (this.state.object || {id: null}).id;
  }

  save() {
    this.state.networking.withMethod("PUT").withBody(flattenID(this.state.object)).go((res) => {
      this.setState((st) => {
        return {object: res.body || null, error: res.error || null, networking: st.networking };
      });
    });
  }
}

function flattenID(obj) {
  var n = {}
  for (var key in obj) {
    var val = obj[key];
    if ((val || {}).id != undefined) {
      n[(key + "_id")] = val.id;
    } else {
      n[key] = val;
    }
  }
  return n;
}

// paginated JSON collection.
class JSONCollection extends JSON {
  get count() {
    return (this.object || {}).count;
  }

  get hasNext() {
    return (this.object || {next: null}).next != null;
  }

  get hasPrevious() {
    return (this.object || {previous: null}).previous != null;
  }

  next() {
    if (this.hasNext) {
      this.setState((st) => {
        st.networking = this.networking.setURL(this.object.next);
        return st;
      });
    }
  }

  previous() {
    if (this.hasPrevious) {
      this.setState((st) => {
        st.networking = this.networking.setURL(this.object.previous);
        return st;
      });
    }
  }

  render() {
    var obj = this.state.object;
    var error = this.state.error;

    var children = []
    if (obj != null) {
      for (var i = 0; i < obj.results.length; i++) {
        var child = obj.results[i];
        children.push(<JSONObject
                       key={i}
                       object={child}
                       error={null}
                       networking={this.state.networking.appendPath(child.id)}
                       component={this.props.component} />);
      }
      return (
        <div>
          {this.hasPrevious && <button onClick={this.previous}>Previous</button>}
          {this.hasNext && <button onClick={this.next}>Next</button>}
          <div>{children}</div>
        </div>
      ); 
    } else if (error != null) {
      return <h1>{error.message}</h1>;
    } else {
      return <div></div>;
    }
  }
}

export { Auth, JSON, JSONObject, JSONCollection }
