// API.js: Promise-based REST API access

import { h, Component } from 'preact';

class API {
  static get storage() {
    return window.localStorage;
  }

  static clearAuth() {
    this.storage.clear();
    window.dispatchEvent(new Event('authchange'));
  }

  static get isAuthenticated() {
    let t = API.getToken();
    return t !== null && t !== undefined;
  }

  static getToken() {
    return this.storage.getItem("token");
  }

  static setToken(token) {
    this.storage.setItem("token", token || null);
    window.dispatchEvent(new Event('authchange'));
  }

  static getUserID() {
    return parseInt(this.storage.getItem("user_id"));
  }

  static setUserID(user_id) {
    this.storage.setItem("user_id", user_id || null);
  }

  static wrapComponent(Comp) {
    return class extends Component {
      constructor(props) {
        super(props);
        this.state = { authenticated: API.isAuthenticated }; 
        this.handleAuthChange = this.handleAuthChange.bind(this);
      }
      handleAuthChange(e) {
        if (this.state.authenticated !== API.isAuthenticated) {
          this.setState(st => ({ ...st, authenticated: API.isAuthenticated }));
        }
      }
      componentWillMount() {
        window.addEventListener("authchange", this.handleAuthChange);
        window.addEventListener("storage", this.handleAuthChange);
      }
      componentWillUnmount() {
        window.removeEventListener("authchange", this.handleAuthChange);
        window.removeEventListener("storage", this.handleAuthChange);
      }
      render(props) {
        return h(Comp, props);
      }
    };
  }

  static networking(method, path, urlparams, body) {
    let opts  = {
      credentials: "same-origin", // enable backend to set cookies
      method: method,
      redirect: "follow",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    };

    if (body) opts.body = JSON.stringify(body);

    let token = this.getToken();
    if (token) opts.headers.Authorization = "Token " + token;

    let url = window.location.protocol + "//" + window.location.host + "/api" + path;
    if (!url.endsWith("/")) url = url + "/";

    url += "?" + Object.entries({...urlparams, format: "json"})
                       .map(([k, v]) => encodeURIComponent(k) + "=" + encodeURIComponent(v))
                       .join("&");
    return fetch(url, opts).then(res =>
      res.text().then(text => {
        let obj = text.length === 0 ? null : JSON.parse(text);
        if (res.ok) return obj;
        let err = new Error((obj ? obj.detail : null) || res.statusText);
        err.responseBody = obj;
        err.responseCode = res.status;
        err.frontendPath = window.location.pathname;
        throw err;
      })
    );
  }
}

export { API }
export default API;
