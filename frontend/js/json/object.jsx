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
}

JSONObject.propTypes = JSONBase.propTypes;
JSONObject.defaultProps = JSONBase.defaultProps;