import { h, Component } from 'preact';
import { Router } from './router';
import { noSelect } from '../style/mixins';
import BaseStyles from '../style';
import { parseSize, renderSize, fmapSize } from '../style/sizing';
import { parseColor, renderColor, darken } from '../style/colors';
import { appearance } from '../style/mixins';

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
    this.onTouchesBegan = this.onTouchesBegan.bind(this);
    this.onTouchesMoved = this.onTouchesMoved.bind(this);
    this.onTouchesEnded = this.onTouchesEnded.bind(this);
    this.onTouchesCancelled = this.onTouchesCancelled.bind(this);
  }

  clickAction() {
    const { onClick, href } = this.props;
    if (onClick) onClick();
    if (href) {
      let useRouter = href ? Boolean(href.match(/^\/([^\/]|$)/)) : false;
      if (useRouter) Router.push(href);
      else window.location.assign(href);
    }
  }

  onTouchesBegan(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState(st => ({ ...st, mouseDown: true, hover: true }));
    return false;
  }

  touchInButton(t) {
    let rect = t.target.getBoundingClientRect();
    return t.clientX < rect.right && t.clientX > rect.left && t.clientY < rect.bottom && t.clientY > rect.top;
  }

  onTouchesMoved(e) {
    e.preventDefault();
    e.stopPropagation();
    if (this.touchInButton(e.targetTouches[0])) {
      if (!this.state.mouseDown) {
        this.setState(st => ({ ...st, mouseDown: true, hover: true }));
      }
    } else if (this.state.mouseDown) {
      this.setState(st => ({ ...st, mouseDown: false, hover: false }));
    }
    return false;
  }

  onTouchesEnded(e) {
    e.preventDefault();
    e.stopPropagation();
    if (this.state.mouseDown) {
      this.clickAction();
      this.setState(st => ({ ...st, mouseDown: false, hover: false })); //
    }
    return false;
  }

  onTouchesCancelled(e) {
    e.preventDefault();
    e.stopPropagation();
    if (this.state.mouseDown) {
      this.setState(st => ({ ...st, mouseDown: false, hover: false })); //
    }
    return false;
  }

  onMouseDown(e) {
    e.preventDefault();
    e.stopPropagation();
    if (parseInt(e.which) === 1) {
      this.setState(st => ({ ...st, mouseDown: true }));
    }
    return false;
  }

  onMouseUp(e) {
    e.preventDefault();
    e.stopPropagation();
    if (this.state.mouseDown) { // Centralize logic in onMouseDown for what constitutes a click
      this.clickAction();
      this.setState(st => ({ ...st, mouseDown: false })); //
    }
    return false;
  }

  onMouseEnter(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState(st => ({ ...st, hover: true }));
    return false;
  }

  onMouseLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState(st => ({ ...st, hover: false }));
    return false;
  }

  getStyle() {
    const { style, hoverStyle, activeStyle, primaryStyle, disabledStyle, disableStateStyles, disableBaseStyles } = this.props;

    let isClickTarget = !Button.clicked || Button.clicked === this;

    let baseStyle = {
      ...appearance("none"),
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
      opacity: "0.4",
      cursor: "not-allowed",
      pointerEvents: "none",
      ...disabledStyle
    };

    let baseActiveStyle = {
      ...disableBaseStyles ? {} : { boxShadow: "0 0 0 1px rgba(0,0,0,0.15) inset, 0 0 0.5rem rgba(0,0,0,0.2) inset" },
      ...activeStyle
    };

    return {
      ...baseStyle,
      ...!disableStateStyles && this.props.disabled ? baseDisabledStyle : {},
      ...!disableStateStyles && this.state.hover && isClickTarget ? baseHoverStyle : {},
      ...!disableStateStyles && this.state.hover && isClickTarget && this.state.mouseDown ? baseActiveStyle : {}
    };
  }

  render({ style, hoverStyle, activeStyle, disabledStyle, primaryStyle, onClick, href, type, disableBaseStyles, disableStyleStyles, // eslint-disable-line no-unused-vars
           component, ...props }) {
    return h(component || 'button', {
      ...props,
      type: component ? type : type || 'button', // Prevent buttons from silently automatically submitting forms
      style: this.getStyle(),
      onMouseUp: this.onMouseUp,
      onMouseDown: this.onMouseDown,
      onMouseEnter: this.onMouseEnter,
      onMouseLeave: this.onMouseLeave,
      onTouchStart: this.onTouchesBegan,
      onTouchEnd: this.onTouchesEnded,
      onTouchMove: this.onTouchesMoved,
      onTouchCancel: this.onTouchesCancelled
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
