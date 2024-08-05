// API.js: Promise-based REST API access

class API {
  static clearAuth() {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
  }

  static get isAuthenticated() {
    let t = API.getToken();
    return t !== null && t !== undefined;
  }

  static getToken() {
    return localStorage.getItem("token");
  }

  static setToken(token) {
    localStorage.setItem("token", token || null);
  }

  static getUserID() {
    return parseInt(localStorage.getItem("user_id"));
  }

  static setUserID(user_id) {
    localStorage.setItem("user_id", user_id || null);
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
        throw new Error((obj ? obj.detail : null) || res.statusText);
      })
    );
  }
}

export { API }
export default API;
