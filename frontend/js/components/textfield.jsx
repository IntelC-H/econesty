import React from 'react';
import PropTypes from 'prop-types';
import 'style/textfield';

const propTypes = {
  name: PropTypes.string,
  value: PropTypes.string,
  label: PropTypes.string,
  onChange: PropTypes.func,
  secure: PropTypes.bool,
  email: PropTypes.bool,
  url: PropTypes.bool,
  search: PropTypes.bool
};

const defaultProps = {
  name: "",
  value: "",
  label: "",
  onChange: _ => {},
  onFocus: _ => {},
  onBlur: _ => {},
  secure: false,
  email: false,
  maxLength: 524288 // max text length for <input>.
};

// Abstract me!
// class TextField extends Input

class TextField extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = { value: this.props.value };
    this.onChange = this.onChange.bind(this);
    this.onSearch = this.onSearch.bind(this);
  }

  get name() {
    return this.props.name;
  }

  get value() {
    return this.state.value;
  }

  get type() {
    if (this.props.secure) return "password";
    if (this.props.email) return "email";
    if (this.props.url) return "url";
    if (this.props.search) return "search";
    return "text";
  }

  componentWillReceiveProps(nextProps) {
    this.setState({value: nextProps.value});
  }

  render() {
    var {secure, email, url, search, label, onChange, value, ...filteredProps} = this.props;
    return (
      <div className="textfield">
        <input required
               type={this.type}
               value={this.state.value}
               onChange={this.onChange}
               {...filteredProps} />
        <label>{this.props.label}</label>
      </div>
    );
  }

  onChange(e) {
    this.state.value = e.target.value; // done hacky because onChange needs
    this.props.onChange(this);         // this.state.value to be set before it's called.
    this.forceUpdate();
  }

  onSearch(_) {
    this.props.onSearch(this);
  }
}

TextField.defaultProps = defaultProps;
TextField.propTypes = propTypes;

export default TextField;