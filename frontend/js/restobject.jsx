import React from 'react';
import ReactDOM from 'react-dom';
import 'whatwg-fetch';

export class RESTModel {
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

  load(objectId=this.objectId) {
    this.fetchJSON(this.getURL(objectId), {});
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

  getURL(id = this.objectId) {
    var u = window.location.protocol + "//" + window.location.host + "/api/" + this.resource + "/";
    if (id != null) {
      u += id + "/";
    }
    u += "?format=json";
    return u;
  }

  fetchJSON(url, opts, callback) {
    this.loading = true;
    if (this.callback != null) {
      this.callback(this);
    }

    var optsp = opts;
    if (optsp.json != undefined) {
      optsp.body = JSON.stringify(optsp.json);
      optsp.headers["Content-Type"] = "application/json";
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

export default class RESTComponent extends React.Component {
  constructor(props) {
    super(props);
    var m = new RESTModel(this.props.resource, ((x) => this.updateWithModel(x)));
    m.objectId = this.props.objectId;
    this.state = { model: m }
    this.setState = this.setState.bind(this);
  }

  updateWithModel(m) {
    console.log(this);
    this.setState({model: m});
  }

  componentDidMount() {
    if (this.state.model.isPersisted) {
      this.state.model.load();
    }
  }

  render() {
    return new this.props.component({model: this.state.model}).render();
  }
}

