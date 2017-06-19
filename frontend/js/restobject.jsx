import React from 'react';
import ReactDOM from 'react-dom';
import 'whatwg-fetch';
import Networking from 'app/networking';

class JSON extends React.Component {
  constructor(props) {
    super(props);
    console.log("PATH: " + this.props.path);
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
    console.log("Loading");
    this.state.networking.go((res) => {
      console.log("LOADED: " + this.state.networking.formattedURL);
      console.log(res);
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
    console.log("SAVING");
    this.state.networking.withMethod("PUT").withBody(this.state.object).go((res) => {
      console.log("SAVED");
      console.log(res);
      this.setState((st) => {
        return {object: res.body || null, error: res.error || null, networking: st.networking };
      });
    });
  }
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

    console.log("RENDERING COLLECTION");
    console.log(obj);
    console.log(error != null);

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
      console.log("RENDERING CHILDREN");
      return (
        <div>
          {this.hasPrevious && <button onClick={this.previous}>Previous</button>}
          {this.hasNext && <button onClick={this.next}>Next</button>}
          <div>{children}</div>
        </div>
      ); 
    } else if (error != null) {
      console.log("RENDERING ERROR");
      return <h1>{error.message}</h1>;
    } else {
      console.log("OH FUCK");
      return <h1>HAHAH</h1>;
    }
  }
}

function baseURL() {
  return window.location.protocol + "//" + window.location.host + "/api/"; 
}

class RESTModel {
  constructor(rsc, callb = null) {
    this.resource = rsc;
    this.callback = callb;
    this.object = null;
    this.error = null; 
    this.objectId = null;
    this.isLoading = false;
    this.root = Networking.root.appendPath("api", rsc);
  }

  get isPersisted() {
    return this.objectId != null;
  }

  load(rmeth=this.objectId) {
    this.fetchJSON(this.getURL(rmeth), {});
  }

  save() {
    this.fetchJSON(this.getURL(), { method: this.isPersisted ? "PATCH" : "POST", json: this.object });
  }

  destroy() {
    if (this.isPersisted) {
      this.fetchJSON(this.getURL(), { method: "DELETE" });
    } else {
      if (this.callback != null) {
        this.callback(this);
      }
    }
  }

  getURL(rmeth = this.objectId) {
    var u = baseURL() + this.resource + "/";
    if (rmeth != null) {
      u += rmeth + "/";
    }
    u += "?format=json";
    return u;
  }

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
      console.log(res);
      callback(res.error || null);
    });
  }

  static isAuthenticated() {
    return localStorage.getItem("token") != null;
  }

  fetchJSON(url, opts, callback) {
    this.loading = true;

    var n = new Networking(url).asJSON()
                               .withMethod(opts.method || "GET")
                               .withBody(opts.body)

    if (RESTModel.isAuthenticated()) {
      n = n.withAuth("Token " + localStorage.getItem("token"));
    }

    n.go((res) => {
      this.loading = false;
      this.object = res.body || null;
      this.error = res.error || null;
      if (this.callback != null) {
        this.callback(this);
      }
    });
  }
}

// props:
// resource: the rest resource to download
// object: either a REST object id or collection method

class RESTComponent extends React.Component {
  constructor(props) {
    super(props);
    this.setState = this.setState.bind(this);
    this.updateWithModel = this.updateWithModel.bind(this);

    var m = new RESTModel(this.props.resource, this.updateWithModel);
    if (!isNaN(this.props.object)) {
      m.objectId = this.props.object;
    }

    this.state = { model: m };
  }

  updateWithModel(m) {
    if (m.object != null && m.object != undefined) {
      m.objectId = m.object.id;
    }
    this.setState({model: m});
  }

  componentDidMount() {
    var m = this.state.model;
    if (m.isPersisted) {
      m.load();
    } else if (this.props.object != undefined && this.props.object != null) {
      m.load(this.props.object);
    }
  }

  render() {
    return React.createElement(this.props.component, {model: this.state.model}, null);
  }
}

export { RESTComponent, RESTModel, JSON, JSONObject, JSONCollection }
