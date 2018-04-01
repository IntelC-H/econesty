import { h, Component, cloneElement } from 'preact';

/*
  Router checks each of its children against window.location.pathname (See Router.path);
  if a child matches the current URL, it renders it.
*/

// TODO: page state

class Router extends Component {
  constructor(props) {
    super(props);
    this.state = { url: Router.path };
    this.onPopState = this.onPopState.bind(this);
    this.setState = this.setState.bind(this);
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

  static setPath(url) {
    this.history.replaceState(null, null, url);
    this.refreshState();
    return null;
  }

  onPopState() {
    this.setState({ url: Router.path });
  }

  componentDidMount() {
    this.onPopState(null);
    window.addEventListener("popstate", this.onPopState);
  }

  componentWillUnmount() {
    window.removeEventListener("popstate", this.onPopState);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextState.url !== this.state.url;
  }

  render({ children, notFound }, { url }) {
    for (let c of children) { // the children should all be routes
      if (c.attributes && "path" in c.attributes) {
        let matches = this.test(c.attributes.path, url, c.attributes.wildcards);
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

  test(path, url, wildcards = null) {
    url = url.replace(/\?.+$/, ''); // remove query

    if (path instanceof RegExp) {
      let res = path.exec(url);
      if (!res) return false;
      return res.groups;
    }

    if (path instanceof Function) {
      let res = path(url);
      if (!res) return false;
      if (res instanceof Object) return res;
      return {};
    }

    var urlpath_comps = url.split('/').filter(Boolean);
    var path_comps = path.split('/').filter(Boolean);

    if (path_comps.length !== urlpath_comps.length) return false;

    let matches = {};

    const iterlen = path_comps.length; // path_comps.length should === urlpath_comps.length
    for (let i = 0; i < iterlen; i++) {
      let upc = urlpath_comps[i];
      let pc = path_comps[i];

      if (pc[0] === ':') {
        let wildcard = pc.slice(1);
        if (wildcards && wildcard in wildcards && !wildcards[wildcard].includes(upc)) return false;
        matches[wildcard] = upc;
      } else if (pc !== upc) return false;
    }

    return matches;
  }
}

Router.propTypes = {};
Router.defaultProps = {};

export { Router };
export default Router;
