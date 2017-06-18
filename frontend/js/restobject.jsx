import React from 'react';
import ReactDOM from 'react-dom';
import 'whatwg-fetch';

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
    var body = { username: username, password: password };
    fetch(baseURL() + "token/", {method: "POST", body: JSON.stringify(body), headers: {"Content-Type": "application/json"}}).then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        var error = new Error(res.statusText);
        error.response = res;
        throw error;
      }
    }).then((json) => {
      localStorage.setItem("token", json.token);
      callback(null);
    }).catch((err) => {
      callback(err);
    });
  }

  static isAuthenticated() {
    var t = localStorage.getItem("token");
    return t != null && t != undefined;
  }

  fetchJSON(url, opts, callback) {
    this.loading = true;
    if (this.callback != null) {
      this.callback(this);
    }

    var optsp = opts;
    optsp.headers = {}
    if (optsp.json != undefined) {
      optsp.body = JSON.stringify(optsp.json);
      optsp.headers["Content-Type"] = "application/json";
    }

    var tok = localStorage.getItem("token");
    if (tok != null && tok != undefined) {
      optsp.headers.Authorization = "Token " + tok;
    }

    optsp.method = optsp.method || "GET"; 

    fetch(url, optsp).then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        var error = new Error(res.statusText);
        error.response = res;
        throw error;
      }
    }).then((json) => {
      this.loading = true;
      this.object = json;
      this.error = null;
      if (this.callback != null) {
        this.callback(this);
      }
    }).catch((err) => {
      this.loading = false;
      this.object = null;
      this.error = err;
      if (this.callback != null) {
        this.callback(this);
      }
    });
  }
}

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

export { RESTComponent, RESTModel }
