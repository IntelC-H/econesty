import React from 'react';

import Promised from './components/promised';
import APIComponent from './components/apicomponent';
import ObjectForm from './components/objectform';
import TextField from './components/textfield';

function sideBySide(xs) {
  return (props) => <div>{xs.map((x) => React.createElement(x, props, null))}</div>
}

function form(form, fallback) {
  fallback = fallback || {};
  return (props) => {
    var elems = [];
    for (var k in form) {
      var v = form[k];
      if (v == "hidden") {
        elems.push(<input type="hidden" key={"form-" + k} name={k} value={props.object[k] || fallback[k]} />);
      } else if (v instanceof Function) {
        elems.push(React.createElement(v, {key: "form-" + k, label: k.toUpperCase(), name: k, value: props.object[k] || fallback[k]}, null));
      }
    }
    elems.push(<input key={"submit"} type="submit" value="Save" />);
    return <div>{elems}</div>;
  };
}

function redirectWith(path, promise=null) {
  return (props) => {
    if (!promise) {
      props.history.replace(path);
    } else {
      promise.catch(console.log).then((res) => {
        props.history.replace(path + res.id);
      });
    }
    return null;
  };
}

function showAPI(api, repr) {
  return (props) => {
    return <APIComponent objectId={parseInt(props.match.params["id"])} api={api} component={repr} />;
  };
}

function apiForm(api, formDict, fallback=null) {
  class InternalForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = { fallback: fallback };
  }

  componentDidMount() {
    if (this.state.fallback instanceof Promise) {
      this.state.fallback.catch(console.log).then((res) => this.setState({fallback: res}))
    }
  }

  render() {
    return <APIComponent
             api={api}
             objectId={parseInt(this.props.match.params["id"])}
             form={Components.form(formDict, ((this.state.fallback instanceof Promise) ? {} : this.state.fallback))}
             onCreation={(res) => this.props.history.push("/" + api.resource + "/" + res.id)} />;
  }
}
  return (props) => React.createElement(InternalForm, props, null);
}

const Components = {
  Promised: Promised,
  APIComponent: APIComponent,
  ObjectForm: ObjectForm,
  TextField: TextField,
  form: form,
  showAPI: showAPI,
  apiForm: apiForm,
  redirectWith: redirectWith,
  sideBySide: sideBySide
}

export default Components;