import React from 'react';
import Networking from 'app/networking';
import PropTypes from 'prop-types';
import JSONBase from 'app/json/base'

export default class JSONObject extends JSONBase {
  get isPersisted() { return this.objectID != null; }
  get objectID() { return (this.object || {id: null}).id; }
  get flattenedObject() {
    var n = {};
    for (var k in this.object) {
      var v = this.object[k];
      (v || {}).hasOwnProperty("id") ? (n[k + "_id"] = v.id) : (n[k] = v);
    }
    return n;
  }

  isValidJSON(o) {
    return o != null && o.hasOwnProperty("id");
  }

  // TODO: custom save action!
  // onSave?
  save() {
    this.networking.withMethod(this.isPersisted ? "PATCH" : "POST").withBody(this.flattenedObject).go((res) => {
      if (res.error != null) {
        this.setState(this.validateState({object: this.object, error: res.error}));
      } else if (res.body) {
        if (!this.isPersisted) {
          this.networking = this.networking.appendPath(res.body.id);
        }
        this.setState(this.validateState({object: res.body, error: res.error}));
      }
    });
  }

  renderJSON() {
    if (this.isPersisted) {
      return super.renderJSON();
    }
    if (this.props.errorComponent) {
      return React.createElement(this.props.errorComponent, { element: this }, null);
    }
    return <div/>;
  }
}

JSONObject.propTypes = JSONBase.propTypes;
JSONObject.defaultProps = JSONBase.defaultProps;