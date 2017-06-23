import 'whatwg-fetch';

// TODO: Don't load auth tokens until formattedURL

/*

new Networking().appendPath("path", "to", "resource").asJSON().withMethod("POST").withAuth("Token 38495782947").withBody({ foo: "bar" }).go((res) => {
  // now use res.body and res.error
});

*/

function copy(original) {
    var clone = new original.constructor();
    var keys = Object.getOwnPropertyNames( original ) ;
    for (var i = 0; i < keys.length; i++) {
        // copy each property into the clone
        var value = original[keys[i]];
        if (value === Object(value)) {
          value = copy(value);
        }
        clone[keys[i]] = value;
    }
    return clone;
}

export default class Networking {
  constructor() {
    this.host = null; // request host
    this.protocol = null; // request protocol
    this.pathComps = []; // path components
    this.urlParams = null; // parameters to append to the URL.
    this.method = "GET"; // request method, defaults to GET.
    this.headers = {}; // request headers
    this.body = null; // request body, null means no body.
    this.isJSON = false; // whether or not this object will handle JSON requests.
    this.trailingSlash = true; // whether or not to append a slash to the end of the path.
  }

  static get create() {
    return new Networking();
  }

  // .withLocalTokenAuth(k)
  // +chainable
  // k: The localStorage key for the token.
  withLocalTokenAuth(k) {
    var that = copy(this);
    var token = localStorage.getItem(k);
    if (token != null) {
      that = that.withHeader("Authorization", "Token " + token);
    }
    return that;
  }

  // appendPath()
  // +chainable
  // takes a variable list of parameters that are the path components to append.
  // append path components
  appendPath() {
    var that = copy(this);
    var args = Array.from(arguments);
    for (var j = 0; j < args.length; j++) {
      var comps = args[j].toString().split("/").filter((v) => v.length > 0);
      for (var i = 0; i < comps.length; i++) {
        that.pathComps.push(comps[i]);
      }
    }
    return that;
  }

  // .asJSON()
  // +chainable
  // makes the request use JSON Objects.
  asJSON() {
    var that = copy(this);
    that.isJSON = true;
    that.headers["Content-Type"] = "application/json";
    that.headers["Accept"] = "application/json";
    return that.withURLParam("format", "json");
  }

  // .withMethod(meth)
  // +chainable
  // meth: uppdercase HTTP verb
  // Sets the HTTP method to meth.
  withMethod(meth) {
    var that = copy(this);
    that.method = meth;
    return that;
  }

  // .withHeader(key, value)
  // +chainable
  // key: String, the lhs of the header
  // value: String, the rhs of the header
  // Adds a header.
  withHeader(key, value) {
    var that = copy(this);
    that.headers[key] = value;
    return that;
  }

  // .withBody(body)
  // +chainable
  // body: either an Object or a String
  // Sets the HTTP body.
  withBody(body) {
    var that = copy(this);
    that.body = body;
    return that;
  }

  // .withURL(url)
  // +chainable
  // url: 
  // Sets the Networking instance to use the url url.
  withURL(url) {
    var that = copy(this);
    var p = this.parseURL(url);
    that.pathComps = p.pathComponents;
    that.host = p.host;
    that.protocol = p.protocol;
    that.urlParams = p.query;
    return that;
  }

  // .withURLParam(k, v)
  // k: url param name
  // v: url param value
  // sets a GET url parameter. Does not modify this.url.
  withURLParam(k, v) {
    var that = copy(this);
    that.urlParams = that.urlParams || {};
    that.urlParams[k] = v;
    return that;
  }

  // formattedURL
  // The completely formatted URL that this Networking uses.
  get formattedURL() {
    var url = (this.protocol || window.location.protocol) + "//" + (this.host || window.location.host) + "/";
    url += this.pathComps.join("/");

    if (this.trailingSlash) {
      if (!url.endsWith("/")) {
        url += "/";
      }
    } else {
      if (url.endsWith("/")) {
        url = url.slice(0, -1);
      }
    }

    if (this.urlParams != null) {
     url += "?" + Object.keys(this.urlParams).filter((k) => this.urlParams[k] != null).map((k) => encodeURIComponent(k) + "=" + encodeURIComponent(this.urlParams[k])).join("&"); 
    }

    return url;
  }

  // .go(callback)
  // -not chainable
  // callback(obj): obj has one of two attributes: body or error
  // Sends the request, and calls callback when complete. Depending
  // on whether or not .asJSON() has been called, body is either a String
  // or a JSON object.
  go(callback) {
    var opts  = { 
      method: this.method,
      headers: this.headers
    }

    if (this.body != null) {
      opts.body = this.isJSON ? JSON.stringify(this.body) : this.body;
    }

    fetch(this.formattedURL, opts).then((res) => {
      if (res.ok) {
        return res;
      }
      var e = new Error(res.statusText);
      e.response = res;
      throw e;
    }).then((res) => {
      return this.isJSON ? res.json() : res.text();
    }).catch((err) => {
      callback({ error: err, body: null })
    }).then((body) => {
      callback({ error: null, body: body });
    });
  }

  // PRIVATE

  parseQueryString(q) {
    var qp = q.startsWith("?") ? q.slice(1) : q;
    var a = qp.split("&");
    var b = a.map((v) => v.split("="));
    var c = b.reduce((a, v) => {
      var ap = a || {};
      ap[v[0]] = v[1];
      return ap;
    });
    return c;
  }

  parseURL(href) {
    var match = href.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([\/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/);
    return match && {
        href: href,
        protocol: match[1],
        host: match[2],
        hostname: match[3],
        port: match[4],
        pathComponents: match[5].split("/").filter((v) => v.length > 0),
        query: this.parseQueryString(match[6]),
        hash: match[7]
    }
  } 
}
