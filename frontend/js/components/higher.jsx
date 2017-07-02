import React from 'react';

function guid() {
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return s4() + [s4(), s4(), s4(), s4(), s4()].join('-') + s4() + s4();
}

class PromiseRenderer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    if (this.props.promise) {
      var that = this;
      this.props.promise.catch(function(err) { that.setState({error: err}); })
                        .then(function(res) { that.setState({object: res}); });
    }
  }

  render() {
    if (this.state.error)  return <div className="error"><p>{this.state.error.message}</p></div>;
    if (this.state.object) return React.createElement(Higher.withObject(this.state.object, this.props.component), this.props, null);
    return <div className="loading" />;
  }
}

function collection(header, body, setPage) {
  const Header = header || ((_) => null);
  const Body = body || ((_) => null);

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

function _makeForm(formDict, onSubmit) {
  var formId = guid();
  var elems = [];
  for (var name in formDict) {
    var v = formDict[name];
    if (v instanceof String) {
      elems.push(<input type={v} key={formId + '-' + name} name={name} />);
    } else if (React.isValidElement(v)) {
      elems.push(React.cloneElement(v, {key: formId + '-' + name, name: name}, v.props.children));
    }
  }
  elems.push(<button key={formId + "-submit"} type="submit">Save</button>);

  const onSubmitForm = (e) => {
    e.preventDefault();
    const isInput = (el) => el.nodeName.toLowerCase() == "input";
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
      if (v) return React.cloneElement(e, {value: v}, e.props.children);
      else   return e;
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
//           >> Promise: evaluate a promise down to an object and use it as defaults.
//           >> Object: use these defaults.
//           >> Function: apply defaults to props, and then use the result.
function form(formDict, defaults, onSubmit = ((_) => undefined)) {
  if (defaults instanceof Promise)       return Higher.withPromise(defaults, _makeForm(formDict, onSubmit));
  else if (defaults instanceof Function) return (props) => React.createElement(form(formDict, defaults(props), onSubmit), props, null);
  return Higher.withObject(defaults || {}, _makeForm(formDict, onSubmit));
}

const Higher = {
  collection: collection,
  form: form,
  withPromise: (promise, comp) => Higher.withProps({promise: promise, component: comp}, PromiseRenderer), // FIXME: this clobbers components!
  withProps: (addlProps, Component) => (props) => <Component {...Object.assign({}, props, addlProps)} />,
  withObjectId: (objectId, component) => Higher.withProps({objectId: objectId}, component),
  withObject: (obj, component) => Higher.withProps({object: obj}, component)
}

export default Higher;
