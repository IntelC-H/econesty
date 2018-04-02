import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
import FormElement from '../formelement';
import { prependFunc } from '../../utilities';
import BaseStyles from 'base/style';
import { parseSize, renderSize, fmapSize, reduceSizes } from '../../../style/sizing';

const halfHeight = renderSize(fmapSize(v => v / 2, parseSize(BaseStyles.elementHeight)));
const styles = {
  all: {
    color: BaseStyles.input.color,
    backgroundColor: BaseStyles.backgroundColor
  },
  checkbox: {
    margin: halfHeight + " 0",
    height: halfHeight,
    width: halfHeight
  }
};

const inputTypes = [
  "hidden", "text", "checkbox", "password", "email",
  "url", "number", "search", "range", "time", "tel"
];

// TODO: better use of value prop
class Input extends FormElement {
  constructor(props) {
    super(props);
    this.onInput = this.onInput.bind(this);
    this.onClick = this.onClick.bind(this);
    if (this.getType() === "checkbox" && !this.value) this.state.value = false;
  }

  getType() {
    return inputTypes.find(k => Boolean(this.props[k])) || this.props.type;
  }

  // for checkboxes
  onClick(e) {
    this.value = Boolean(e.target.checked);
  }

  // for all other inputs
  onInput(e) {
    this.value = e.target.value;
  }

  render({type, search, range, // eslint-disable-line no-unused-vars
          hidden, text, time, // eslint-disable-line no-unused-vars
          password, tel, email, url, // eslint-disable-line no-unused-vars
          number, value, ignore, ref, // eslint-disable-line no-unused-vars
          checkbox, style, ...props}) {
    props.type = this.getType();

    if (checkbox) props.checked = Boolean(this.value);
    else if (this.value !== undefined) props.value = hidden ? JSON.stringify(this.value) : this.value;

    if (checkbox) {
      props.style = { ...style, ...styles.checkbox };
      prependFunc(props, "onClick", this.onClick);
    }
    else if (!hidden) prependFunc(props, "onInput", this.onInput);

    return h('input', props);
  }
}

Input.propTypes = {
  ...FormElement.propTypes,
  hidden: PropTypes.bool,
  text: PropTypes.bool,
  checkbox: PropTypes.bool,
  number: PropTypes.bool,
  password: PropTypes.bool,
  email: PropTypes.bool,
  time: PropTypes.bool,
  tel: PropTypes.bool,
  search: PropTypes.bool,
  range: PropTypes.bool,
  url: PropTypes.bool,
  type: PropTypes.oneOf(inputTypes)
};

Input.defaultProps = {
  ...FormElement.defaultProps,
  hidden: false,
  text: false,
  checkbox: false,
  number: false,
  password: false,
  email: false,
  time: false,
  tel: false,
  search: false,
  range: false,
  url: false
};

export { Input };
export default Input;
