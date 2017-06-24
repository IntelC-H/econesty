import React from 'react';
import Networking from 'app/networking';
import PropTypes from 'prop-types';
import TextField from 'app/layout/element/textfield';
import JSONBase from 'app/json/base';
import JSONObject from 'app/json/object';

// FIXME: clicking in the dropdown closes the dropdown. This is unworkable.
// TODO: Should inherit from JSONCollection
export default class JSONSearchField extends JSONBase {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.showsResults = false;
  }

  handleChange(tf) {
    this.networking = this.networking.withURLParam("search", tf.text);
    this.load();
  }

  renderJSON() {
    return (
      <div className="searchfield">
        <TextField onChange={this.handleChange}
               onFocus={this.onFocus} onBlur={this.onBlur}
               label={this.props.label} />
        {this.showsResults && <div className="searchfield-dropdown">
          {this.props.headerComponent != null && React.createElement(this.props.headerComponent, { element: this }, null)}
          {this.object.results.map((res) => <JSONObject
                                             key={res.id} object={res}
                                             networking={this.networking.appendPath(res.id)}
                                             component={this.props.component} />)}
        </div>}
      </div>
    );
  }

  onFocus(tf) {
    this.showsResults = true;
    this.forceUpdate();
  }

  onBlur(tf) {
    this.showsResults = false;
    this.forceUpdate();
  }
}

JSONSearchField.propTypes = Object.assign(JSONBase.propTypes, {
  label: PropTypes.string,
  headerComponent: PropTypes.func
});

JSONSearchField.defaultProps = Object.assign(JSONBase.defaultProps, {
  label: "search",
  headerComponent: null
});