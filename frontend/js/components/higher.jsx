import React from 'react';
import { Redirect, withRouter } from 'react-router';

// Comp: a component whose props should be loaded asynchronously.
// func(setAsyncProps) => { ... code that uses setAsyncProps ... }: A function to async load props
export function asyncWithProps(Comp, onMount = () => undefined, onUnmount = () => undefined) {
  return class extends React.PureComponent {
    constructor(props) {
      super(props);
      this.state = {};
      this.setState = this.setState.bind(this);
    }

    componentDidMount() {
      onMount(this.setState);
    }

    componentWillUnmount() {
      onUnmount(this.setState);
    }

    render() {
      return <Comp {...Object.assign({}, {setAsync: this.setState}, this.props, this.state)} />;
    }
  };
}

export function asyncWithObject(Comp, onMount = () => undefined, onUnmount = () => undefined) {
  return asyncWithProps(
    props => {
      if (props.object) return <Comp {...props} />;
      if (props.error) return <div className="error"><p>{props.error.message}</p></div>;
      return <div className="loading" />;
    },
    setAsyncProps => onMount({ setAsyncProps: setAsyncProps, setError: e => setAsyncProps({error: e}), setObject: o => setAsyncProps({object: o}) }),
    setAsyncProps => onUnmount({ setAsyncProps: setAsyncProps, setError: e => setAsyncProps({error: e}), setObject: o => setAsyncProps({object: o}) })
  );
}

export function withWebSocket(url, component, protocols=[]) {
  return asyncWithObject(
    component,
    funcs => {
      function makeWebSocket() {
        var ws = new WebSocket(url, protocols);
        ws.onopen = () => funcs.setAsyncProps({ws: ws});
        ws.onmessage = e => funcs.setAsyncProps({ws: ws, object: JSON.parse(e.data) });
        ws.onclose = e => {
          // See http://tools.ietf.org/html/rfc6455#section-7.4.1
          funcs.setAsyncProps({error: new Error(function() {
            switch(e.code) {
              case 1001: return "An endpoint is \"going away\", such as a server going down or a browser having navigated away from a page.";
              case 1002: return "An endpoint is terminating the connection due to a protocol error";
              case 1003: return "An endpoint is terminating the connection because it has received a type of data it cannot accept.";
              case 1004: return "Reserved. The specific meaning might be defined in the future.";
              case 1005: return "No status code present.";
              case 1006: return "The connection was closed abnormally.";
              case 1007: return "An endpoint is terminating the connection because it has received data that was inconsistent with the type of the message.";
              case 1008: return "An endpoint is terminating the connection because it has received a message that \"violates its policy\".";
              case 1009: return "An endpoint is terminating the connection because it has received a message that is too big for it to process.";
              case 1010: return "An endpoint is terminating the connection because it has expected the server to negotiate one or more extension, but the server didn't return them in the response message of the WebSocket handshake.\n\n Specifically, the extensions that are needed are: " + e.reason;
              case 1011: return "A server is terminating the connection because it encountered an unexpected condition that prevented it from fulfilling the request.";
              case 1015: return "The connection was closed due to a failure to perform a TLS handshake.";
              default:   return "Unknown websocket failure.";
            }
          }())});
          makeWebSocket();
        };
      }

      makeWebSocket();
    },
    () => ws.close()
  );
}

export function withPromise(promise, Comp) {
  return asyncWithObject(Comp, ({setError, setObject}) => promise.catch(setError).then(setObject));
}

export function withPromiseFactory(pfact, Comp) {
  return props => {
    const C = withPromise(pfact(props), Comp);
    <C {...props} />;
  };
}

export function collection(header, body, setPage) {
  const Header = header || (() => null);
  const Body = body || (() => null);

  return (props) => {
    var obj = props.object;
    return (
      <div className="collection">
        <div className="collection-header">
          <Header object={obj} />
        </div>
        <div className="collection-objects">
          {obj.results.map((child, i) => <Body key={"object-" + i.toString()} object={child} />)}
        </div>
        <div className="collection-controls">
          {obj.previous && setPage && <button className="nav-button" onClick={() => setPage(obj.previous)}>❮ Previous</button>}
          <span>{obj.page} of {Math.ceil(obj.count/10) || 1}</span>
          {obj.next && setPage && <button className="nav-button" onClick={() => setPage(obj.next)}>Next ❯</button>}
        </div>
      </div>
    );
  };
}

export function asyncCollection(header, body, makePromise) {
  return Higher.asyncWithProps(props => {
    const Promised = Higher.withPromise(
      makePromise(props.page || 1),
      Higher.collection(header, body, p => props.setAsync({page: p}))
    );
    return <Promised {...props} />;
  });
}

export function rewritePath(regex, v) {
  var p = v instanceof Promise ? v : Promise.resolve(v);
  return withRouter(withPromise(p, props => <Redirect
                                              push={false}
                                              from={props.location.pathname}
                                              to={props.location.pathname.replace(regex, props.object)}
                                            />));
}

const Higher = {
  collection: collection,
  asyncCollection: asyncCollection,
  withNoProps: (Component) => () => <Component />,
  withProps: (addlProps, Component) => props => <Component {...Object.assign({}, props, addlProps)} />,
  withObject: (obj, component) => Higher.withProps({object: obj}, component),
  mapProps: (f, Component) => props => <Component {...f(props)} />,
  withObjectFunc: (f, component) => props => {
    const P = Higher.withObject(f(props), component);
    return <P {...props} />;
  },
  asyncWithProps: asyncWithProps,
  asyncWithObject: asyncWithObject,
  withPromise: withPromise,
  withPromiseFactory: withPromiseFactory,
  rewritePath: rewritePath
}

export default Higher;
