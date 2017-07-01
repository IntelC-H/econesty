import React from 'react';

function withPromise(promise, component) {
  class PromiseRenderer extends React.Component {
    componentDidMount() {
      if (promise) {
        promise.catch(function(err) { this.setState({error: err}); })
               .then(function(res) { this.setState({object: res}); });
      }
    }

    render() {
      if (this.state.error)  return <div className="error"><p>{this.state.error.message}</p></div>;
      if (this.state.object) return Higher.withObject(this.state.object, component)(this.props);
      return <div className="loading" />;
    }
  }

  return (props) => React.createElement(PromiseRenderer, props, null);
}

function collection(Header, Body, setPage) {
  return (props) => {
    var obj = props.object;
    Header = Header || ((_) => null);
    Body = Body || ((_) => null);

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

const _makeForm = (formDict) => (props) => {
  var elems = [];
  for (var name in formDict) {
    var formValue = props.object[name];
    var v = formDict[name];
    if (v instanceof String) {
      elems.push(<input type={v} key={"form-" + name} name={name} value={formValue} />);
    } else if (v instanceof Function) {
      elems.push(React.createElement(v, {key: "form-" + k, label: k.toUpperCase(), name: k, value: formValue}, null));
    } else if (v instanceof React.Component) {
      v.props.name = k;
      v.props.key = "form-" + k;
      v.props.value = formValue;
      v.props.label = k.toUpperCase();
      elems.push(v);
    }
  }
  elems.push(<input key={"submit"} type="submit" value="Save" />);

  return <form onSubmit={(e) => {
                e.preventDefault();
                const isInput = (el) => el.nodeName.toLowerCase() == "input";
                const isNotSubmit = (el) => el.type.toLowerCase() != "submit";
                const reduceInputs = (acc, i) => {
                  acc[i.name] = i.value;
                  return acc;
                }
                var descendants = Array.from(e.target.getElementsByTagName("*"));
                onSubmit(descendants.filter(isInput).filter(isNotSubmit).reduce(reduceInputs, {}));
              }}
         >{elems}</form>;
};

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
  if (!defaults) return _makeForm(formDict);
  else if (defaults instanceof Promise)  return Higher.withPromise(defaults(props), _makeForm(formDict));
  else if (defaults instanceof Function) return (props) => form(formDict, defaults(props), onSubmit)(props);
  else                                   return Higher.withObject(defaults(props), _makeForm(formDict));
}

const API = {
  view: (api, component, objectId = null) => {
    return (props) => {
      var oid = (props.match ? props.match.params["id"] : null) || props.objectId;
      if (!oid) return React.createElement(component, props, null);
      return Higher.withPromise(api.read(oid), component)(props);
    };
  },
  collection: (api, page, searchQuery, header, component) => {
    class APICollInternal extends React.Component {
      constructor(props) {
        super(props);
        this.setPage = this.setPage.bind(this);
        this.state = { page: page };
      }
      render() {
        return Higher.withPromise(
          api.list(this.state.page, searchQuery),
          Higher.collection(header, component, this.setPage)
        )(this.props);
      }
  
      setPage(p) {
        this.setState({page: p});
      }
    }
    return (props) => React.createElement(APICollInternal, props, null);
  },
  form: (api, formDict, defaults, objectId = null) => {
    return (props) => {
      var oid = (props.match ? props.match.params["id"] : null) || objectId;
      return Components.Higher.API.view(api, Components.Higher.form(formDict, defaults, (obj) => {
        var p = oid ? api.update(oid, obj) : api.create(obj);
        p.catch(console.log).then((res) => props.history.push("/" + api.resource + "/" + res.id))
      }));
    }
  }
}

const Higher = {
  API: API,
  withPromise: withPromise,
  collection: collection,
  form: form,
  withProps: (addlProps, component) => (props) => React.createElement(component, Object.assign({}, props, addlProps), null),
  withObjectId: (objectId, component) => (props) => Higher.withProps({objectId: objectId}, component),
  withObject: (obj, component) => (props) => Higher.withProps({object: obj}, component)
}

export default Higher;