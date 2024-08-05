import { h, Component, cloneElement } from 'preact';

/*
  Router checks each of its children against window.location.pathname (See Router.path);
  if a child matches the current URL, it renders it.

  TODO:
  - Page state
*/

// Backwards-compatible named-capture group regex
function compilePathPattern(pat) {
  let comps = pat.split('/').filter(Boolean);

  let names = [];
  let regexStr = "^";
  for (let c of comps) {
    if (c[0] === ':') {
      names.push(c.slice(1));
      regexStr += "\/([^\/]+)";
    } else regexStr += "\/" + c;
  }
  regexStr += "\/?$";
  return {
    names: names, // all names
    regex: new RegExp(regexStr) // the regex
  };
}

function executePathPattern({ names, regex }, path) {
  if (!names || !regex) return false;
  if (names.length === 0) return regex.test(path);
  let match = path.match(regex);
  if (!match) return false;
  return names.reduce((acc, name, idx) => (acc[name] = match[idx + 1]) && acc, {});
}

class Router extends Component {
  constructor(props) {
    super(props);
    this.state = { url: Router.path };
    this.onPopState = this.onPopState.bind(this);
    this.setState = this.setState.bind(this);
    this.compilePaths();
    window.addEventListener("popstate", this.onPopState);
  }

  static get history() {
    return window.history;
  }

  static get path() {
    return window.location.pathname;
  }

  static refreshState() {
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  static push(url) {
    this.history.pushState(null, null, url);
    this.refreshState();
    return null;
  }

  static replace(url) {
    this.history.replaceState(null, null, url);
    this.refreshState();
    return null;
  }

  onPopState() {
    if (Router.path !== this.state.url) {
      this.setState({ url: Router.path });
    }
  }

  compilePaths(children = this.props.children) {
    for (let c of children) {
      if (typeof c.attributes.path === "string") {
        c.attributes.compiledPath = compilePathPattern(c.attributes.path);
      }
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextState.url !== this.state.url;
  }

  componentWillUpdate(nextProps, nextState) {
    this.compilePaths(nextProps.children);
  }

  render({ children, notFound }, { url }) {
    for (let c of children) { // the children should all be routes
      if (c.attributes && "path" in c.attributes) {
        let matches = this.test(c.attributes.path, c.attributes.compiledPath, url, c.attributes.wildcards);
        if (matches) {
          return cloneElement(c, {
            matches: matches,
            url: this.state.url,
            ...matches
          });
        }
      }
    }

    if (notFound) {
      return h(notFound, { url: url });
    }

    return null;
  }

  test(path, compiledPath, url, wildcards = null) {
    let matches = null;
    if (compiledPath) {
      matches = executePathPattern(compiledPath, url);
    } else if (path instanceof RegExp) {
      let rs = path.exec(url);
      matches = rs ? rs.groups || {} : null;
    } else if (path instanceof Function) {
      let res = path(url);
      if (res) matches = res instanceof Object ? res || {} : {}; // null is an object, technically
    }

    if (matches) {
      if (wildcards && wildcards instanceof Object) {
        for (let [name, values] of Object.entries(wildcards)) {
          if (!values.includes(matches[name])) return false;
        }
      }
      return matches;
    }
    return false;
  }
}

Router.propTypes = {};
Router.defaultProps = {};

export { Router };
export default Router;
