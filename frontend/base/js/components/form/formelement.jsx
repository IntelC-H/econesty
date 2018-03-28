import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';

// Designed to be subclassed!
// Generic class for form elements
class FormElement extends Component {
  get name() { return this.props.name; } // eslint-disable-line brace-style
  get ignore() { return this.props.ignore; } // eslint-disable-line brace-style
  get value() { return this.state.value; } // eslint-disable-line brace-style
  set value(v) { this.setState(st => ({ ...st, value: v })); } // eslint-disable-line brace-style

  constructor(props) {
    super(props);
    this.state = { value: props.value };
    this.setState = this.setState.bind(this);
  }

  static isValid(c) {
    return c && c.name && "value" in c;
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.value !== nextProps.value || nextProps.value !== this.state.value) {
      this.setState(st => ({ ...st, value: nextProps.value }));
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.name !== nextProps.name) return true;
    if (this.state.value !== nextState.value) return true;
    return false;
  }
}

FormElement.propTypes = {
  name: PropTypes.string.isRequired,
  ignore: PropTypes.bool,
  required: PropTypes.bool
};

FormElement.defaultProps = {
  ignore: false,
  required: false
};

export { FormElement };
export default FormElement;
