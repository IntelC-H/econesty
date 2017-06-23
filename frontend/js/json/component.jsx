import React from 'react';
import PropTypes from 'prop-types';
import JSONObject from 'app/json/object';

export default class JSONComponent extends React.Component {
  get json() { return this.props.element.object; }
  get isPersisted() { return this.props.element.isPersisted; }
  save() { this.props.element.save(); }
}

JSONComponent.propTypes = {
  element: PropTypes.instanceOf(JSONObject).isRequired
};

JSONComponent.defaultProps = {
  element: null
};