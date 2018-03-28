import { h, Component, cloneElement } from 'preact';
//import PropTypes from 'prop-types';

/*
  Router checks each of its children with a path
  attribute; if it matches the current URL, it renders it.
*/

class Router extends Component {
  constructor(props) {
    super(props);
    this.state = { url: document.location.pathname };
    this.update = this.update.bind(this);
    this.setState = this.setState.bind(this);
  }

  static get history() {
    return window.history;
  }

  static updateSubscribers(url) {
    Router.subscribers.forEach(s => s(url));
  }

  static push(url) {
    this.history.pushState(null, null, url);
    Router.updateSubscribers(url);
    return null;
  }

  static replace(url) {
    this.history.replaceState(null, null, url);
    Router.updateSubscribers(url);
    return null;
  }

  static setURL(url) {
    this.history.replaceState(null, null, url);
    return null;
  }

  static getPath() {
    return window.location.pathname;
  }

  update(url) {
    this.setState({url: url});
  }

  componentDidMount() {
    Router.subscribers.push(this.update);
    this.update(document.location.pathname);
  }

  componentWillUnmount() {
    Router.subscribers.splice(Router.subscribers.indexOf(this.update)>>>0, 1);
  }

  render({ children, notFound }) {
    for (let c of children) { // the children should all be routes
      if (c.attributes && "path" in c.attributes) {
        let matches = this.test(c.attributes.path, this.state.url, c.attributes.wildcards);
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
      return h(notFound, { url: this.state.url });
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

Router.subscribers = [];

Router.propTypes = {};
Router.defaultProps = {};

window.addEventListener("popstate", () => Router.updateSubscribers(Router.getPath()));

// TODO: page state

function Link({ href, component, onMouseUp, ...props}) {
  return h(component || 'a', { ...props, onMouseUp: e => {
    if (onMouseUp) onMouseUp(e);
    if (href) Router.push(href);
  }});
}

export { Router, Link };
export default {
  Router: Router,
  Link: Link
};
