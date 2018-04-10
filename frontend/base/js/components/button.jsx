import { h, Component } from 'preact';
import { Router } from './router';
import { noSelect } from '../style/mixins';
import BaseStyles from '../style';
import { parseSize, renderSize, fmapSize } from '../style/sizing';
import { parseColor, renderColor, darken } from '../style/colors';

const localPathRegex = /^\/([^\/]|$)/;

// GIANT HACK
window.addEventListener("mouseup", function(e) {
  let b = getClickTarget();
  if (b && b.state.mouseDown && !b.state.hover) {
    b.setState(st => ({ ...st, mouseDown: false }));
  }
});

function setClickTarget(t) {
  window.__button_click_target = t;
}

function getClickTarget() {
  return window.__button_click_target;
}

class Button extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hover: false,
      mouseDown: false
    };
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
  }

  clickAction() {
    const { onClick, href } = this.props;
    if (this.props.onClick) {
      this.props.onClick();
    }
    if (href) {
      let useRouter = href ? Boolean(href.match(localPathRegex)) : false;
      if (useRouter) Router.push(href);
      else window.location.assign(href);
    }
  }

  onMouseDown(e) {
    setClickTarget(this);
    e.preventDefault();
    if (parseInt(e.which) === 1) {
      this.setState(st => ({ ...st, mouseDown: true }));
    }
    return false;
  }

  onMouseUp(e) {
    setClickTarget(null);
    e.preventDefault();
    if (parseInt(e.which) === 1) {
      this.clickAction();
      this.setState(st => ({ ...st, mouseDown: false }));
    }
    return false;
  }

  onMouseEnter(e) {
    e.preventDefault();
    let clickedButton = window.__button_click_target;
    if (clickedButton === this) this.setState(st => ({ ...st, mouseDown: true, hover: true }));
    else this.setState(st => ({ ...st, hover: true }));
    return false;
  }

  onMouseLeave(e) {
    e.preventDefault();
    this.setState(st => ({ ...st, mouseDown: false, hover: false }));
    return false;
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.hover !== this.state.hover) return true;
    if (nextState.mouseDown !== this.state.mouseDown) return true;
    return false;
  }

  getStyle() {
    const { style, hoverStyle, activeStyle, primaryStyle, disabledStyle, disableStateStyles, disableBaseStyles } = this.props;

    let isClickTarget = getClickTarget() === this;

    let baseStyle = {
      ...isClickTarget ? { cursor: "pointer" } : {},
      ...disableBaseStyles ? {} : {
        ...noSelect(),
        color: BaseStyles.button.color,
        backgroundColor: BaseStyles.button.backgroundColor,
        display: "inline-block",
        whiteSpace: "nowrap",
        textAlign: "center",
        boxSizing: "border-box",
        height: BaseStyles.elementHeight,
        padding: `${BaseStyles.padding} ${renderSize(fmapSize(s => 2 * s, parseSize(BaseStyles.padding)))}`,
        borderRadius: BaseStyles.border.radius,
        margin: BaseStyles.padding
      },
      ...style,
      ...primaryStyle
    };

    let baseHoverStyle = {
      ...disableBaseStyles ? {} : { backgroundColor: renderColor(darken(parseColor(baseStyle.backgroundColor), 10)) },
      ...hoverStyle
    };

    let baseDisabledStyle = {
      border: "none",
      backgroundImage: "none",
      opacity: "0.4",
      cursor: "not-allowed",
      pointerEvents: "none",
      ...disabledStyle
    };

    let baseActiveStyle = {
      boxShadow: "0 0 0 1px rgba(0,0,0,0.15) inset, 0 0 0.5rem rgba(0,0,0,0.2) inset",
      ...activeStyle
    };

    return {
      ...baseStyle,
      ...!disableStateStyles && this.props.disabled ? baseDisabledStyle : {},
      ...!disableStateStyles && this.state.hover && isClickTarget ? baseHoverStyle : {},
      ...!disableStateStyles && this.state.hover && isClickTarget && this.state.mouseDown ? baseActiveStyle : {}
    };
  }

  render({ style, hoverStyle, activeStyle, disabledStyle, primaryStyle, component, onClick, href, type, ...props }) {
    return h(component || 'button', {
      ...props,
      type: component ? type : type || 'button', // Prevent buttons from silently automatically submitting forms
      style: this.getStyle(),
      onMouseUp: this.onMouseUp,
      onMouseDown: this.onMouseDown,
      onMouseEnter: this.onMouseEnter,
      onMouseLeave: this.onMouseLeave
    });
  }
}

Button.defaultProps = {
  disableStateStyles: false,
  disableBaseStyles: false,
  style: {},
  hoverStyle: {},
  activeStyle: {},
  disabledStyle: {},
  primaryStyle: {}
};

export { Button };
export default Button;
