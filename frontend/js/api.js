// API.js: Promise-based API access

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
  static get isAuthenticated() {
    return API.getToken() !== null;
  }

  static getToken() {
    return localStorage.getItem("token");
  }

  static setToken(token) {
    localStorage.setItem("token", token || null);
  }

  static getUserID() {
    return localStorage.getItem("user_id");
  }

  static setUserID(user_id) {
    localStorage.setItem("user_id", user_id || null);
  }

  static networking(method, path, urlparams, body) {
    var opts  = {
      method: method,
      redirect: "follow",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    };

    if (body) {
      opts.body = JSON.stringify(body);
    }

    var token = this.getToken();
    if (token) {
      opts.headers.Authorization = "Token " + token;
    }

    var ups = urlparams;
    ups.format = "json";

    var url = window.location.protocol + "//" + window.location.host + "/api" + path;
    if (!url.endsWith("/")) url = url + "/";

    url += "?" + Object.keys(ups)
                       .filter(k => ups[k])
                       .map(k => encodeURIComponent(k) + "=" + encodeURIComponent(ups[k]))
                       .join("&");

    return fetch(url, opts).then(res => res.json()
                                           .then(j => ({ object: j, res: res })))
                           .then(({object, res}) => {
      if (res.ok) return object;
      throw new Error(object.detail || res.statusText);
    });
  }

  static paginate(promise, collection) {
    return promise.then(res => {
      res.results = Array.from(res.results.map(collection.onInstance));
      return res;
    });
  }
}

// Represents a collection in your REST API.
class APICollection {
  constructor(resource, urlParams = {}) {
    this.resource = resource;
    this.urlParams = urlParams;
    this.onInstance = this.onInstance.bind(this);
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
    return API.networking("GET", this.baseURL + id, this._getURLParams(), null).then(this.onInstance);
  }

  list(page, q = null) {
    var ps = q ? {page: page, search: q} : {page: page};
    return API.paginate(API.networking("GET",
                                       this.baseURL,
                                       { ...this._getURLParams(), ...ps},
                                       null), this);
  }

  update(id, body = null) {
    return API.networking("PATCH", this.baseURL + id, {}, body).then(this.onInstance);
  }

  delete(id, soft = false) {
    return API.networking(soft ? "PATCH" : "DELETE", this.baseURL + id, {}, soft ? {deleted: true} : null).then(() => null);
  }

  save(body) {
    const { id, ...filteredBody } = body;
    if (id !== null && id !== undefined) return this.create(body);
    return this.update(id, filteredBody);
  }

  classMethod(httpmeth, method, body = null, urlparams = {}) {
    return API.networking(httpmeth, this.baseURL + method, urlparams, body);
  }

  instanceMethod(httpmeth, method, id, body = null, urlparams = {}) {
    return API.networking(httpmeth, this.baseURL + id + '/' + method, urlparams, body);
  }

  // called on every instance that 
  onInstance(json) {
    return json;
  }
}

// A collection that applies an action after receiving a JSON representation
// of one of it's instances.
class APIActionCollection extends APICollection {
  constructor(resource, action) {
    super(resource);
    this.action = action;
  }

  onInstance(json) {
    var res = super.onInstance(json);
    this.action(json);
    return res;
  }
}

export {
  API,
  APICollection,
  APIActionCollection
}
export default API;
