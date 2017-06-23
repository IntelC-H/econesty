import React from 'react';
import Networking from 'app/networking';
import PropTypes from 'prop-types';

// TODO: caching using browser sessionStorage

export default class JSONBase extends React.Component {
  constructor(props) {
    super(props);
    this.networking = this.props.networking || (Networking.create.appendPath(this.props.path).asJSON().withLocalTokenAuth("token"));
    this.state = {
      object: this.props.object,
      error: this.props.error
    }
  }

  get object() { return this.state.object; }
  set object(v) { this.setState((st) => { return {object: v, error: null }}); }
  get error() { return this.state.error; }
  set error(v) { this.setState((st) => { return {object: null, error: v }}); }

  validateState(st) {
    if (st.object != null && !this.isValidJSON(st.object)) {
      return { object: st.object, error: new Error("invalid JSON") };
    }
    return st;
  }

  componentDidMount() {
    if (!this.props.deferLoad) this.load();
  }

  shouldComponentUpdate(newProps, newState) {
    if (this.state.object !== newState.object) return true;
    if (this.state.error !== newState.error) return true;
    return false; 
  }

  load() {
    this.networking.go((res) => this.setState(this.validateState({object: res.body, error: res.error})));
  }

  render() {
    if (this.error != null) {
      if (this.props.errorComponent) {
        return React.createElement(this.props.errorComponent, { element: this }, null);
      }
      return null;
    }

    if (this.object != null) return this.renderJSON();

    if (this.loadingComponent != null) {
      return React.createElement(this.props.loadingComponent, { element: this }, null);
    }
    return null;
  }

  renderJSON() {
    return React.createElement(this.props.component, { element: this }, null);
  }

  isValidJSON(o) {
    return true;
  }
}

JSONBase.propTypes = {
  object: PropTypes.shape({ id: PropTypes.number }), // JSON that's been loaded.
  error: PropTypes.object, // The most recent error encountered.
  path: PropTypes.string, // Path of resource 
  networking: PropTypes.instanceOf(Networking),
  component: PropTypes.func.isRequired, // Function used to render the JSON using React
  errorComponent: PropTypes.func, // Function used to render an error
  loadingComponent: PropTypes.func, // Function used to render a loading page
  deferLoad: PropTypes.bool // Whether or not to load the resource upon mounting
};

JSONBase.defaultProps = {
  error: null,
  object: null,
  deferLoad: false,
  errorComponent: null,
  loadingComponent: null
};
