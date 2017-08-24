import { h, Component, cloneElement } from 'preact';

/*
  Supports the same API as preact-router.
  Router checks each of its children with a path
  attribute: if it matches the current URL, it renders it.
*/

// TODO: specific values for given wildcards. EG: /user/:id/transaction/:action,
// :action should only be "buy" or "sell"

// TODO: move these out of the global namespace. It's a code smell.
const subscribers = [];
const updateSubscribers = url => subscribers.forEach(s => s(url));

class Router extends Component {
  constructor(props) {
    super(props);
    this.state = { url: document.location.pathname };
    this.update = this.update.bind(this);
    this.setState = this.setState.bind(this);
  }

  update(url) {
    this.setState({url: url});
  }

  componentDidMount() {
    subscribers.push(this.update);
    this.update(document.location.pathname);
  }

  componentWillUnmount() {
    subscribers.splice(subscribers.indexOf(this.update)>>>0, 1);
  }

  render() {
    var routes = this.props.children;
    for (var i = 0; i < routes.length; i++) {
      var c = routes[i];
      if (c.attributes && c.attributes.path) {
        var matches = this.test(c.attributes.path, this.state.url, c.attributes.wildcards);
        if (matches) {
          return cloneElement(c, {
            matches: matches,
            url: this.state.url,
            path: c.attributes.path,
            ...matches
          });
        }
      }
    }

    if (this.props.notFound) {
      return h(this.props.notFound, { url: this.state.url })
    }

    return null;
  }

  test(path, url, wildcards = null) {
    url = url.replace(/\?.+$/, '');

    if (path instanceof RegExp) {
      let res = path.exec(url);
      if (!res) return false;
      return res.groups;
    }

    if (path instanceof Function) {
      let res = path(url);
      if (!(res instanceof Object)) return false;
      return res;
    }

    var urlpath_comps = url.split('/').filter(e => e.length > 0);
    var path_comps = path.split('/').filter(e => e.length > 0);

    if (path_comps.length !== urlpath_comps.length) return false;

    var matches = {};

    const iterlen = path_comps.length; // path_comps.length should === urlpath_comps.length
    for (var i = 0; i < iterlen; i++) {
      var upc = urlpath_comps[i];
      var pc = path_comps[i];

      if (pc.startsWith(':')) {
        var wildcard = pc.slice(1);
        if (wildcards && wildcard in wildcards && !wildcards[wildcard].includes(upc)) return false;
        matches[wildcard] = upc;
      } else if (pc !== upc) return false;
    }

    return matches;
  }
}

window.addEventListener("popstate", () => updateSubscribers(document.location.pathname));

// TODO: page state

Router.getPath = () => {
  return document.location.pathname;
}

Router.push = url => {
  history.pushState(null, null, url);
  updateSubscribers(url);
  return null;
}

Router.replace = url => {
  history.replaceState(null, null, url);
  updateSubscribers(url);
  return null;
}

Router.setURL = url => {
  history.replaceState(null, null, url);
  return null;
}

const Link = props => {
  const { href, component, onClick, ...filteredProps} = props;
  return h(component || 'a', { ...filteredProps, onClick: e => {
    (onClick || (() => undefined))(e);
    Router.push(href);
  }});
}

export { Router, Link };
export default {
  Router: Router,
  Link: Link
}
