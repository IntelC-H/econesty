import React from 'react';
import Higher from './higher';

export function view(api, Component, pname = "id") {
  return (props) => {
    var oid = (props.match ? parseInt(props.match.params[pname]) : null) || props.object.id;
    const ComponentPrime = oid ? Higher.withPromise(api.read(oid), Component) : Component;
    return <ComponentPrime {...props} />;
  };
}

export function form(api, formDict, defaults = null) {
  return props => {
    var oid = (props.match ? parseInt(props.match.params.id) : null) || (props.object || {}).id;

    var defaultsP = defaults;
    if (oid) defaultsP = defaultsP || api.read(oid);
    if (defaultsP && !(defaultsP instanceof Promise)) defaultsP = Promise.resolve(defaultsP);

    console.log("API FORM", oid, defaultsP);

    const Form = Higher.form(formDict, defaultsP, obj => {
      var p = oid ? api.update(oid, obj) : api.create(obj);
      p.catch(e => {
        throw e;
      }).then(res => props.history.push("/" + api.resource + "/" + res.id));
    });
    return <Form {...props} />;
  };
}

export default {
  view: view,
  form: form
};
