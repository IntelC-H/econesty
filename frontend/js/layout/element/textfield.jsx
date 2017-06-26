import React from 'react';
import PropTypes from 'prop-types';
import 'style/textfield';

export default class TextField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: this.props.value
    }
    this.onChange = this.onChange.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onFocus = this.onFocus.bind(this);
  }

  get value() { return this.state.value; }
  set value(v) { this.setState({value: v}); }

  get isSecure() { return this.props.secure; }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.value !== this.state.value) return true;
    return false;
  }

  render() {
    return (
      <div className="textfield">
        <input required
               name={this.props.name}
               value={this.value}
               type={this.isSecure ? "password" : "text"}
               maxLength={Number(this.props.maxLength)}
               onFocus={this.onFocus}
               onBlur={this.onBlur}
               onChange={(e) => this.onChange(e)} />
        <div className="textfield-bar" />
        <label className="textfield-label">{this.props.label}</label>
      </div>
    );
  }

  onFocus(e) {
    this.props.onFocus(this);
  }

  onBlur(e) {
    this.props.onBlur(this);
  }

  onChange(e) {
    this.state.value = e.target.value;
    this.props.onChange(this);
    this.forceUpdate();
  }
}

TextField.propTypes = {
  name: PropTypes.string,
  value: PropTypes.string,
  label: PropTypes.string,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  secure: PropTypes.bool,
  maxLength: PropTypes.number
};

TextField.defaultProps = {
  name: "",
  value: "",
  label: "",
  onChange: (_) => {},
  onFocus: (_) => {},
  onBlur: (_) => {},
  secure: false,
  maxLength: 524288,
};
