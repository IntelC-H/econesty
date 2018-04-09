import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
import FormElement from '../formelement';
import { prependFunc } from '../../utilities';
import BaseStyles from 'base/style';
import { parseSize, renderSize, fmapSize, reduceSizes } from '../../../style/sizing';

const halfHeight = renderSize(fmapSize(v => v / 2, parseSize(BaseStyles.elementHeight)));
const doubleHeight = renderSize(fmapSize(v => v * 2, parseSize(BaseStyles.elementHeight)));
const styles = {
  all: {
    color: BaseStyles.input.color,
    backgroundColor: BaseStyles.backgroundColor,
    border: `${BaseStyles.border.width} solid ${BaseStyles.input.borderColor}`,
    borderRadius: `${BaseStyles.border.radius}`,
    verticalAlign: "middle",
    //margin: 0, // handled by reset.css
    width: "100%",

    height: BaseStyles.elementHeight,
    padding: BaseStyles.padding,
    boxSizing: "border-box"
  },
  disabled: {
    backgroundColor: "#EAEDED",
    color: BaseStyles.input.disabledColor
  },
  invalid: {
    color: BaseStyles.input.invalidBorderColor
  },
  focus: {
    //outline: 0, // handled by reset.css
    borderColor: BaseStyles.input.selectedBorderColor
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

// TODO: invalid states
// TODO: style placeholder color to BaseStyles.input.placeholderColor

// TODO: better use of value prop
class Input extends FormElement {
  constructor(props) {
    super(props);
    this.onInput = this.onInput.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.state = { ...this.state, focused: false };
    if (this.props.checkbox && !this.value) this.state.value = false;
  }

  get focused() {
    return this.state.focused;
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

  onBlur() {
    this.setState(st => ({ ...st, focused: false }));
  }

  onFocus() {
    this.setState(st => ({ ...st, focused: true }));
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextState.focused !== this.state.focused || super.shouldComponentUpdate(nextProps, nextState);
  }

  render({type, search, range, // eslint-disable-line no-unused-vars
          hidden, text, time, // eslint-disable-line no-unused-vars
          password, tel, email, url, // eslint-disable-line no-unused-vars
          number, value, ignore, ref, // eslint-disable-line no-unused-vars
          checkbox, focusStyle, unfocusedStyle, style, ...props}) {
    props.type = this.getType();

    if (checkbox) {
      props.checked = Boolean(this.value);
      prependFunc(props, "onClick", this.onClick);
    } else {
      if (this.value !== undefined) props.value = hidden ? JSON.stringify(this.value) : this.value;
      if (!hidden) {
        prependFunc(props, "onInput", this.onInput);
        prependFunc(props, "onFocus", this.onFocus);
        prependFunc(props, "onBlur", this.onBlur);
      }
    }

    props.style = {
      ...styles.all,
      ...(checkbox ? styles.checkbox : {}),
      ...(this.focused ? { ...styles.focus, ...focusStyle } : unfocusedStyle),
      ...(props.disabled ? styles.disabled : {}),
      ...style
    };

    return h('input', props);
  }
}

Input.propTypes = {
  ...FormElement.propTypes,
  focusStyle: PropTypes.object,
  unfocusedStyle: PropTypes.object,
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
  focusStyle: {},
  unfocusedStyle: {},
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
