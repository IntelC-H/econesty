// API.js: Promise-based REST API access

/*
  Usage:

  First, create your APICollections:
  
      API.person = new APICollection("person");
      API.address = new APICollection("address");
  
  Now, you can use them like this:
      
      var createPersonPromise = API.person.create({first_name: "Foo", last_name: "Bar"});
      var readAddressPromise = API.person.read(1);
      var updateAddressPromise = API.address.update(54, {user_id: 1});
  
  Each promise defined above is fulfilled with an object representing the REST resource
  being operated upon. The one below is fulfilled with null:
  
      var nullPromise = API.person.delete(1);
  
  You can also "soft delete" objects (set a deleted field to true)
  
      var nullPromise = API.person.delete(1, true);
  
  You can also call class an instance methods on the API (/resource/<id>/instanceMethod or /resource/classMethod)
  
      API.user.instanceMethod("GET", "instanceMethod", 1);
      API.user.classMethod("GET", "classMethod");
  
  These can be attached to the API like so: 
  
      API.classMethod = (body) => API.user.classMethod("GET", "classMethod", body);
      API.instanceMethod = (id, body) => API.user.instanceMethod("GET", "instanceMethod", id, body)
  
  Furthermore, you can chain API actions almost as if your networking code is synchronous.
  
      var promise = API.person.create({first_name: "Foo", last_name: "Bar"})
                              .then(person => API.address.create({zip_code: '76883', user_id: person.id}))
                              .then(address => API.address.update(address.id, {street: 'Software Road'}))
                              .then(address => API.address.delete(address.id))
      });
  
*/

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

// Represents a collection in your REST API.
class APICollection {
  constructor(resource, urlParams = {}) {
    this.resource = resource;
    this.urlParams = urlParams;
  }

  get baseURL() {
    return '/' + this.resource + '/';
  }

  _getURLParams() {
    if (typeof this.urlParams === "function") {
      return this.urlParams();
    }
    return this.urlParams;
  }

  withParams(urlParams = {}) {
    return new APICollection(this.resource, urlParams);
  }

  append(pth) {
    return new APICollection(this.resource + pth, this.urlParams);
  }

  create(body) {
    return API.networking("POST", this.baseURL, {}, body).then(this.onInstance);
  }

  read(id) {
    return API.networking("GET", this.baseURL + id, this._getURLParams(), null);
  }

  listAll(q = null) {
    let ps = { ...this._getURLParams(), paginate: false };
    if (q) ps.search = q;
    return API.networking("GET", this.baseURL, ps, null);
  }

  list(page, q = null) {
    let ps = { ...this._getURLParams(), page: page };
    if (q) ps.search = q;
    return API.networking("GET", this.baseURL, ps, null);
  }

  update(id, body = null) {
    return API.networking("PATCH", this.baseURL + id, {}, body);
  }

  delete(id, soft = false) {
    return API.networking(soft ? "PATCH" : "DELETE", this.baseURL + id, {}, soft ? {deleted: true} : null).then(() => null);
  }

  save(body) {
    const { id, ...filteredBody } = body;
    if (id === null || id === undefined) return this.create(body);
    return this.update(id, filteredBody);
  }

  classMethod(httpmeth, method, body = null, urlparams = {}) {
    return API.networking(httpmeth,
                          this.baseURL + method,
                          {...this._getURLParams(), urlparams},
                          body);
  }

  instanceMethod(httpmeth, method, id, body = null, urlparams = {}) {
    return API.networking(httpmeth,
                          this.baseURL + id + '/' + method,
                          {...this._getURLParams(), urlparams},
                          body);
  }
}

class DummyAPICollection {
  constructor() {
    this.elements = {};
    this.currentID = 1;
  }

  getElements() {
    return Object.values(this.elements);
  }

  create(body) {
    let withID = { ...body, id: this.currentID };
    this.elements[this.currentID++] = withID;
    return new Promise((resolve, reject) => resolve(withID)); // eslint-disable-line no-unused-vars
  }

  read(id) {
    return new Promise((resolve, reject) => resolve(this.elements[id])); // eslint-disable-line no-unused-vars
  }

  list(page) {
    let zeroPage = page - 1;
    let allElements = this.getElements();
    return new Promise((resolve, reject) => resolve({ // eslint-disable-line no-unused-vars
      previous: page <= 1 ? null : page - 1,
      next: page >= Math.floor(allElements.length / 10) ? null : page + 1,
      count: allElements.length,
      results: allElements.slice(zeroPage, zeroPage + 10)
    }));
  }

  update(id, body = null) {
    if (body) this.elements[id] = { ...this.elements[id], ...body };
    return new Promise((resolve, reject) => resolve(this.elements[id])); // eslint-disable-line no-unused-vars
  }

  delete(id) {
    let v = this.elements[id];
    delete this.elements[id];
    return new Promise((resolve, reject) => resolve(v)); // eslint-disable-line no-unused-vars
  }

  save({id, ...body}) {
    if (id !== null && id !== undefined) return this.create(body);
    return this.update(id, body);
  }
}

export {
  API,
  APICollection,
  DummyAPICollection
}
export default API;
