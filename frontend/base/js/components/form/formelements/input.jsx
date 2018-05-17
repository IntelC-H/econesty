import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
import FormElement from '../formelement';
import { prependFunc } from '../../utilities';
import BaseStyles from 'base/style';
import { parseSize, renderSize, fmapSize } from '../../../style/sizing';

const inputTypes = [
  "hidden", "text", "checkbox", "password", "email",
  "url", "number", "search", "range", "time", "tel"
];

// TODO: invalid states
// TODO: style placeholder color to BaseStyles.input.placeholderColor
// TODO: factor out checkbox
// TODO: Replace types with a "secure" bool and a regex for validation, and an accepted charset.

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

  getStyle() {
    const halfHeight = renderSize(fmapSize(v => v / 2, parseSize(BaseStyles.elementHeight)));
    const halfBorder = renderSize(fmapSize(v => v / 2, parseSize(BaseStyles.border.width)));
  
    let s = {
      color: BaseStyles.input.color,
      backgroundColor: BaseStyles.backgroundColor,
      border: `${halfBorder} solid ${BaseStyles.input.borderColor}`,
      borderRadius: BaseStyles.border.radius,
      height: BaseStyles.elementHeight,
      padding: BaseStyles.padding,
      verticalAlign: "middle",
      boxSizing: "border-box"
    };
  
    if (this.props.checkbox) {
      s = {
        ...s,
        margin: halfHeight + " 0",
        height: halfHeight,
        width: halfHeight
      };
    }
  
    // TODO: implement me!
    let invalid = false;

    if (this.props.disabled) {
      s = {
        ...s,
        backgroundColor: BaseStyles.input.disabledBackgroundColor,
        color: BaseStyles.input.disabledColor
      };
    } else if (this.focused) {
      s = {
        ...s,
        borderColor: BaseStyles.input.selectedBorderColor
      };
    } else if (invalid) {
      s = {
        ...s,
        color: BaseStyles.input.invalidBorderColor
      };
    }
  
    return s;
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

    props.style = { ...this.getStyle(), ...style };

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
  url: PropTypes.bool
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
