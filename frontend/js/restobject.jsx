import React from 'react';
import ReactDOM from 'react-dom';
import 'whatwg-fetch';

export class RESTModel {
  constructor(rsc, comp) {
    this.resource = rsc;
    this.component = comp;
    this.object = null;
    this.error = null; 
    this.objectId = null;
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
      // TODO: pass deleted value to this.component
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
      this.object = json;
      this.error = null;
    }).catch((err) => {
      this.object = null;
      this.error = err;
    });
  }
}

export default class RESTObject extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      object: null,
      error: null
    }
  }

  componentDidMount() {
    if (this.isPersisted) {
      this.load();
    }
  }

  // Public API

  get isPersisted() {
    return (this.object != null && this.object.id != undefined) || this.props.objectId != undefined;
  }

  load() {
    this.fetchJSON(this.getURL(), {});
  }

  save(newvalues) {
    var json = {}
    for (var k in this.state.object) { json[k] = this.state.object[k]; }
    for (var k in newvalues) { json[k] = newvalues[k]; }
    this.fetchJSON(this.getURL(), { method: this.isPersisted ? "PATCH" : "POST", json: json });
  }

  destroy() {
    if (this.isPersisted) {
      this.fetchJSON(this.getURL(), { method: "DELETE" });
    } else {
      this.setState({object: null, error: null, loading: false});
    }
  }

  // PRIVATE

  getURL() {
    var u = window.location.protocol + "//" + window.location.host + "/api/" + this.props.resource + "/";
    if (this.isPersisted) {
      var id = this.props.objectId || this.state.object.id
      u += id + "/";
    }
    u += "?format=json";
    return u;
  }
  
  setLoading(loading) {
    this.setState((st) => {
      st.loading = loading
      return st;
    });
  }

  fetchJSON(url, opts, callback) {
    this.setLoading(true);
    
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
      this.setState({object: json, error: null, loading: false});
    }).catch((err) => {
      this.setState({object: null, error: err, loading: false});
    });
  } 

  render() {
    if (this.state.loading) {
      return <h1>Loading...</h1>;
    }
    return new this.props.component({
      error: this.state.error,
      object: this.state.object,
      save: this.save,
      destroy: this.destroy
    }).render();
  }
}

