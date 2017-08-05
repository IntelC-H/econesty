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
const updateSubscribers = url => subscribers.forEach(s => s(url))

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
    window.onpopstate = () => updateSubscribers(document.location.pathname);
    subscribers.push(this.update);
  }

  componentWillUnmount() {
    subscribers.splice(subscribers.indexOf(this.update)>>>0, 1);
  }

  render() {
    var routes = this.props.children;
    for (var i = 0; i < routes.length; i++) {
      var c = routes[i];
      if (c.attributes && c.attributes.path) {
        var matches = this.test(c.attributes.path, this.state.url);
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

  test(path, url) {
    var urlpath_comps = url.replace(/\?.+$/, '').split('/').filter(e => e.length > 0);
    var path_comps = path.split('/').filter(e => e.length > 0);

    if (path_comps.length !== urlpath_comps.length) return false;

    var matches = {};

    const iterlen = path_comps.length; // path_comps.length should === urlpath_comps.length
    for (var i = 0; i < iterlen; i++) {
      var upc = urlpath_comps[i];
      var pc = path_comps[i];

      if (pc.startsWith(':')) matches[pc.slice(1)] = upc;
      else if (pc !== upc)    return false;
    }

    return matches;
  }
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

const Link = props => {
  const { href, onClick, ...filteredProps} = props; // eslint-disable-line no-unused-vars

  const myOnClick = () => {
    Router.push(href);
  };
  return <a onClick={myOnClick} {...filteredProps}/>;
}

export { Router, Link };
export default {
  Router: Router,
  Link: Link
}
