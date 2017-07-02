import React from 'react';
import Higher from './higher';

export function collection(api, page, searchQuery, header, component) {
  class APICollInternal extends React.PureComponent {
    constructor(props) {
      super(props);
      this.state = { page: page };
      const setPage = ((p) => this.setState({ page: p })).bind(this);
      this.render = Higher.withPromise(
        api.list(this.state.page, searchQuery),
        Higher.collection(header, component, setPage)
      );
    }
  }
  return (props) => <APICollInternal {...props} />;
}

export function view(api, Component) {
  return (props) => {
    var oid = (props.match ? parseInt(props.match.params["id"]) : null) || props.objectId;
    const ComponentPrime = oid ? Higher.withPromise(api.read(oid), Component) : Component;
    return <ComponentPrime {...props} />;
  };
}

export function form(api, formDict, defaults = null) {
  return (props) => {
    var oid = (props.match ? props.match.params["id"] : null) || props.objectId;

    var Form = null;

    if (oid && !defaults) {
      Form = Higher.withPromise(api.read(oid), (props) => React.createElement(form(api, formDict, props.object), props, null));
    } else {
      Form = Higher.form(formDict, defaults, (obj) => {
        var p = oid ? api.update(oid, obj) : api.create(obj);
        p.catch(console.log).then((res) => props.history.push("/" + api.resource + "/" + res.id));
      });
    }

    return <Form {...props} />;
  }
}

export default {
  collection: collection,
  view: view,
  form: form
};
