// API.user.create({first_name: "asdf", ...})
// API.user.read(1);

// API.user.instance_method("GET", "payment")

// To use:
/*
  API.user.read(2).catch((err) => {}).then((user) => {});
*/

// Promise-based API access

class API {
  static fetch(method, path, urlparams, body) {
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

    var token = localStorage.getItem("token");
    if (token) {
      opts.headers["Authorization"] = "Token " + token;
    }

    var ups = urlparams;
    ups["format"] = "json";

    var url = window.location.protocol + "//" + window.location.host + "/api" + path + "/";
    url += "?" + Object.keys(ups)
                       .filter((k) => ups[k] != null)
                       .map((k) => encodeURIComponent(k) + "=" + encodeURIComponent(ups[k]))
                       .join("&"); 

    return fetch(url, opts).then((res) => {
      if (res.ok) return res.json();
      else        throw new Error(res.statusText);
    });
  }

  static create(resource, body = null) {
    return this.fetch("POST", "/" + resource, {}, body);
  }

  static read(resource, id) {
    return this.fetch("GET", "/" + resource + "/" + id, {}, null);
  }

  static list(resource, page, q = null) {
    var ps = q ? {page: page, search: q} : {page: page};
    return this.fetch("GET", "/" + resource, ps, null).then((res) => {
      res.page = page;
      if (res.next) res.next = page + 1;
      if (res.previous) res.previous = page - 1;
      return res;
    });
  }

  static update(resource, id, body = null) {
    return this.fetch("PATCH", "/" + resource + "/" + id, {}, body);
  }

  static delete(resource, id) {
    return this.update(resource, id, {deleted: true});
  }

  static class_method(resource, httpmeth, method, body = null) {
    return this.fetch(httpmeth, "/" + resource + "/" + method, {}, body);
  }

  static instance_method(resource, httpmeth, method, id, body = null) {
    return this.fetch(httpmeth, ("/" + resource + "/" + id + "/" + method), {}, body);
  }

  static makeRESTObject(resource) {
    var v = {resource: resource};
    v.create = function(body) { this.create(v.resource, body); };
    v.read = function(id) { this.read(v.resource, id); };
    v.update = function(id, body) { this.update(v.resource, id, body); };
    v.delete = function(id) { this.delete(v.resource, id); };
    v.list = function(page, q = null) { this.list(v.resource, page, q); };
    v.class_method = function(httpmeth, method, body = null) { this.class_method(v.resource, httpmeth, method, body); };
    v.instance_method = function(httpmeth, method, id, body = null) { this.instance_method(v.resource, httpmeth, method, id, body); };
    return v;
  }
}

API.user = API.makeRESTObject("user");
API.transaction = API.makeRESTObject("transaction");
API.payment_data = API.makeRESTObject("paymentdata");
API.countersignature = API.makeRESTObject("countersignature");
API.token = API.makeRESTObject("token");

export default API;