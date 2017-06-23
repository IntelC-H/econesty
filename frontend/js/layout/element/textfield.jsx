import React from 'react';
import PropTypes from 'prop-types';
import 'style/textfield';

export default class TextField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text: this.props.text
    }
    this.onChange = this.onChange.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onFocus = this.onFocus.bind(this);
  }

  get text() { return this.state.text; }
  set text(v) { this.setState({text: v}); }

  get isSecure() { return this.props.secure; }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.text !== this.state.text) return true;
    return false;
  }

  render() {
    return (
      <div className="textfield">
        <input required
               value={this.text}
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
    console.log("HERE");
    console.log(e);
    this.state.text = e.target.value;
    this.props.onChange(this);
    this.forceUpdate();
  }
}

TextField.propTypes = {
  text: PropTypes.string,
  label: PropTypes.string,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  secure: PropTypes.bool,
  maxLength: PropTypes.number
};

TextField.defaultProps = {
  text: "",
  label: "",
  onChange: (_) => {},
  onFocus: (_) => {},
  onBlur: (_) => {},
  secure: false,
  maxLength: 524288,
};
