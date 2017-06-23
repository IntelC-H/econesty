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
               onFocus={(_) => this.props.onChange(this)}
               onBlur={(_) => this.props.onBlur(this)}
               onChange={this.onChange} />
        <div className="textfield-bar" />
        <label className="textfield-label">{this.props.label}</label>
      </div>
    );
  }

  onChange(e) {
    this.text = e.target.value;
    this.props.onChange(this);
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
