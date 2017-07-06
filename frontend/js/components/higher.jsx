import React from 'react';

function guid() {
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return s4() + [s4(), s4(), s4(), s4(), s4()].join('-') + s4() + s4();
}

// Comp: a component whose props should be loaded asynchronously.
// func(setAsyncProps) => { ... code that uses setAsyncProps ... }: A function to async load props
export function asyncWithProps(Comp, onMount = _ => undefined, onUnmount = _ => undefined) {
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

export function asyncWithObject(Comp, onMount = _ => undefined, onUnmount = _ => undefined) {
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
        ws.onopen = _ => funcs.setAsyncProps({ws: ws});
        ws.onmessage = e => funcs.setAsyncProps({ws: ws, object: JSON.parse(e.data) });
        ws.onclose = e => {
          var reason = null;
          // See http://tools.ietf.org/html/rfc6455#section-7.4.1
          // TODO: this is a switch statement.
          if (e.code === 1001)
            reason = "An endpoint is \"going away\", such as a server going down or a browser having navigated away from a page.";
          else if (e.code === 1002)
            reason = "An endpoint is terminating the connection due to a protocol error";
          else if (e.code === 1003)
            reason = "An endpoint is terminating the connection because it has received a type of data it cannot accept (e.g., an endpoint that understands only text data MAY send this if it receives a binary message).";
          else if (e.code === 1004)
            reason = "Reserved. The specific meaning might be defined in the future.";
          else if (e.code === 1005)
            reason = "No status code was actually present.";
          else if (e.code === 1006)
            reason = "The connection was closed abnormally, e.g., without sending or receiving a Close control frame";
          else if (e.code === 1007)
            reason = "An endpoint is terminating the connection because it has received data within a message that was not consistent with the type of the message (e.g., non-UTF-8 [http://tools.ietf.org/html/rfc3629] data within a text message).";
          else if (e.code === 1008)
            reason = "An endpoint is terminating the connection because it has received a message that \"violates its policy\". This reason is given either if there is no other sutible reason, or if there is a need to hide specific details about the policy.";
          else if (e.code === 1009)
            reason = "An endpoint is terminating the connection because it has received a message that is too big for it to process.";
          else if (e.code === 1010)
            reason = "An endpoint (client) is terminating the connection because it has expected the server to negotiate one or more extension, but the server didn't return them in the response message of the WebSocket handshake.\n\n Specifically, the extensions that are needed are: " + event.reason;
          else if (e.code === 1011)
            reason = "A server is terminating the connection because it encountered an unexpected condition that prevented it from fulfilling the request.";
          else if (e.code === 1015)
            reason = "The connection was closed due to a failure to perform a TLS handshake (e.g., the server certificate can't be verified).";
          else
            reason = "Unknown websocket failure.";

          if (!reason) funcs.setAsyncProps({});
          else         funcs.setAsyncProps({error: new Error(reason)});
          makeWebSocket();
        };
      }

      makeWebSocket();
    },
    _ => ws.close()
  );
}

export function withPromise(promise, Comp) {
  return asyncWithObject(Comp, ({setError, setObject}) => promise.catch(setError).then(setObject));
}

function collection(header, body, setPage) {
  const Header = header || (_ => null);
  const Body = body || (_ => null);

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

function _makeForm(formDict, onSubmit) {
  var formId = guid();
  var elems = [];
  for (var name in formDict) {
    var v = formDict[name];
    if (v instanceof String)          elems.push(<input type={v} key={formId + '-' + name} name={name} />);
    else if (React.isValidElement(v)) elems.push(React.cloneElement(v, {key: formId + '-' + name, name: name}, v.props.children));
  }
  elems.push(<button key={formId + "-submit"} type="submit">Save</button>);

  const onSubmitForm = (e) => {
    e.preventDefault();
    const isInput = el => el.nodeName.toLowerCase() === "input";
    const reduceInputs = (acc, i) => {
      acc[i.name] = i.value;
      return acc;
    }
    var descendants = Array.from(e.target.getElementsByTagName("*"));
    onSubmit(descendants.filter(isInput).reduce(reduceInputs, {}));
  }

  function setValueWithObj(obj) {
    return (e) => {
      var v = obj[e.props.name];
      return !v ? e : React.cloneElement(e, {value: v}, e.props.children);
    }
  }

  return (props) => <form onSubmit={onSubmitForm}>{elems.map(setValueWithObj(props.object))}</form>;
}

// form()
// formDict: { string => oneOf(String, Function, React.Component) }
//                       >> String: create an input element with type={string}
//                       >> Function: react component constructor or function
//                       >> React.Component: value and name set, then added to the view hierarchy.
// defaults: oneOf(null, Promise, Object, Function)
//           >> null: only use defaults from existing props.object
//           >> Promise: evaluate a promise down to a function or object and use it as defaults.
//           >> Object: use these defaults.
//           >> Function: apply defaults to props, and then use the result.
function form(formDict, defaults, onSubmit = ((_) => undefined)) {
  console.log("FORM", formDict, defaults);
  if (defaults instanceof Promise) return Higher.withPromise(defaults, props => React.createElement(form(formDict, props.object, onSubmit), props, null));
  else if (defaults instanceof Function) return props => React.createElement(form(formDict, defaults(props), onSubmit), props, null);
  return Higher.withObject(defaults || {}, _makeForm(formDict, onSubmit));
}

const Higher = {
  collection: collection,
  asyncCollection: asyncCollection,
  form: form,
  withProps: (addlProps, Component) => (props) => <Component {...Object.assign({}, props, addlProps)} />,
  withObject: (obj, component) => Higher.withProps({object: obj}, component),
  asyncWithProps: asyncWithProps,
  asyncWithObject: asyncWithObject,
  withPromise: withPromise
}

export default Higher;
