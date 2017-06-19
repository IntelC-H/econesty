import 'whatwg-fetch';

/*

new Networking("http://example.com/example").asJSON().withMethod("POST").withAuth("Token 38495782947").withBody({ foo: "bar" }).go((res) => {
  if (res.response != undefined) {
    /*
      res.response = {
        headers: { ... }, // response headers
        statusCode: 200, // http status code
        body: ... // either an Object or a String, depending on whether or not .asJSON() was called.
      };
    /*
    // depending on whether or not .asJSON() was called,
    // res.result could either be  
  } else if (res.error != undefined) {
    // res.error may vary...
  }
});

*/

export default class Networking {
  constructor(url) {
    this.url = url; // request url
    this.urlParams = {}; // parameters to append to the URL.
    this.method = "GET"; // request method, defaults to GET.
    this.headers = {}; // request headers
    this.body = null; // request body, null means no body.
    this.isJSON = false; // whether or not this object will handle JSON requests.
  }

  static get root() {
    return new Networking(window.location.protocol + "//" + window.location.host); 
  }

  // copy()
  // Returns a deep copy of a Networking object.
  copy() {
    var c = new Networking(this.url);
    c.method = this.method;
    c.headers = this.headers;
    c.body = this.body;
    c.isJSON = this.isJSON;
    return c;
  }

  // .withLocalTokenAuth(k)
  // +chainable
  // k: The localStorage key for the token.
  withLocalTokenAuth(k) {
    var that = this.copy();
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
    var that = this.copy();
    var suffix = Array.from(arguments).join("/");

    if (suffix.startsWith("/")) {
      suffix = suffix.slice(1);
    }
    if (!suffix.endsWith("/")) {
      suffix += "/";
    }

    if (!that.url.endsWith("/")) {
      that.url += "/";
    }
    that.url += suffix;
    return that;
  }

  // .asJSON()
  // +chainable
  // makes the request use JSON Objects.
  asJSON() {
    var that = this.copy()
    that.isJSON = true;
    that.headers["Content-Type"] = "application/json";
    that.headers["Accept"] = "application/json";
    that.urlParams["format"] = "json";
    return that;
  }

  // .withMethod(meth)
  // +chainable
  // meth: uppdercase HTTP verb
  // Sets the HTTP method to meth.
  withMethod(meth) {
    var that = this.copy();
    that.method = meth;
    return that;
  }

  // .withHeader(key, value)
  // +chainable
  // key: String, the lhs of the header
  // value: String, the rhs of the header
  // Adds a header.
  withHeader(key, value) {
    var that = this.copy()
    that.headers[key] = value;
    return that;
  }

  // .withBody(body)
  // +chainable
  // body: either an Object or a String
  // Sets the HTTP body.
  withBody(body) {
    var that = this.copy();
    that.body = body;
    return that;
  }

  // .setURL(url)
  // +chainable
  // url: the new url
  // sets the URL
  setURL(url) {
    var parts = url.split("?");
    var that = this.copy();
    that.url = parts[0];

    if (parts.length == 2) {
      that.urlParams = parseQueryString(parts[1]);
    }

    return that;
  }

  parseQueryString(queryString) {
    var params = {};
    var queries = queryString.split("&");
    for (var i = 0; i < queries.length; i++) {
        var temp = queries[i].split('=');
        params[temp[0]] = temp[1];
    }
    return params;
  } 

  // .withURLParam(k, v)
  // k: url param name
  // v: url param value
  // sets a GET url parameter. Does not modify this.url.
  withURLParam(k, v) {
    var that = this.copy();
    that.urlParams[k] = v;
    return that;
  }

  get formattedURL() {
    var url = this.url;
    if (this.urlParams.length > 0) {
      url += "?";
      var pairs = [];
      for (prop in this.urlParams) {
        pairs.push(encodeURI(prop) + "=" + encodeURI(this.urlParams[prop]));
      }
      url += pairs.join("&"); 
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
      callback({ error: err })
    }).then((body) => {
      callback({ body: body });
    });
  }
}
