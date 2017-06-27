// API.user.create({first_name: "asdf", ...})
// API.user.read(1);

// API.user.instance_method("GET", "payment")

// To use:
/*
  API.user.read(2).catch((err) => {}).then((user) => {});
*/

/*
  // Idea for use with JSX
  // Children are wrapped in a form that creates/updates
  // the API resource.
  <APIView api={API.user} errorComponent={} component={}>
    <input type="text" name="first_name"/>
    <input type="submit" value="Submit"/>
  <APIView />
*/

export default class API {
  static makeFetch(method, path, urlparams, body) {
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
    urls["format"] = "json";

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
    return this.makeFetch("POST", "/" + resource, {}, body);
  }

  static read(resource, id) {
    return this.makeFetch("GET", "/" + resource + "/" + id, {}, null);
  }

  static list(resource, page) {
    return this.makeFetch("GET", "/" + resource, {page: page}, null);
  }

  static update(resource, id, body = null) {
    return this.makeFetch("PATCH", "/" + resource + "/" + id, {}, body);
  }

  static delete(resource, id) {
    return this.update(resource, id, {deleted: true});
  }

  static class_method(resource, httpmeth, method, body = null) {
    return this.makeFetch(httpmeth, "/" + resource + "/" + method, {} body);
  }

  static instance_method(resource, httpmeth, method, id, body = null) {
    return this.makeFetch(httpmeth, "/" + resource + "/" + id + "/" + method, {} body);
  }

  static makeRESTObject(resource) {
    return {
      create: (body) => this.create(resource, body),
      read: (id) => this.read(resource, id),
      list: (page) => this.list(resource, page),
      update: (id, body) => this.update(resource, id, body),
      delete: (id) => this.delete(resource, id),
      class_method: (httpmeth, method, body = null) => this.class_method(resource, httpmeth, method, body),
      instance_method: (httpmeth, method, id, body = null) => this.instance_method(resource, httpmeth, method, id, body)
    };
  }
}

API.user = API.makeRESTObject("user");
API.transaction = API.makeRESTObject("transaction");
API.payment_data = API.makeRESTObject("paymentdata");
API.countersignature = API.makeRESTObject("countersignature");