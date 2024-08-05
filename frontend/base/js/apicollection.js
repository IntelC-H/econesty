import API from './api';

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

export { APICollection };
export default APICollection;
