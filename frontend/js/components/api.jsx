import React from 'react';
import Higher from './higher';

export function collection(api, page, searchQuery, header, component) {
  class APICollInternal extends React.PureComponent {
    constructor(props) {
      super(props);
      var that = this;
      this.state = { page: page };
      this.render = Higher.withPromise(
        api.list(that.state.page, searchQuery),
        Higher.collection(header, component, (p) => that.setState({ page: p }))
      )
    }
  }
  return (props) => React.createElement(APICollInternal, props, null);
}

export function view(api, component) {
  return (props) => {
    var oid = (props.match ? props.match.params["id"] : null) || props.objectId;
    if (!oid) return React.createElement(component, props, null);
    return Higher.withPromise(api.read(oid), component)(props);
  };
}

export function form(api, formDict, defaults = null) {
  return (props) => {
    var oid = (props.match ? props.match.params["id"] : null) || props.objectId;

    if (oid && !defaults) {
      return Higher.withPromise(api.read(oid), (props) => form(api, formDict, props.object));
    }

    return Higher.form(formDict, defaults, (obj) => {
      var p = oid ? api.update(oid, obj) : api.create(obj);
      p.catch(console.log).then((res) => props.history.push("/" + api.resource + "/" + res.id));
    })(props);
  }
}

export default {
  collection: collection,
  view: view,
  form: form
};