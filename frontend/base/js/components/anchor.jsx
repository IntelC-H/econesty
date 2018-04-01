import { h, Component } from 'preact';
import { Router } from './routing';

const anchorDefaultStyle = {
  display: "inline",
  cursor: "pointer",
  textDecoration: "none",
  //color: "inherit",
  hover: {
    textDecoration: "underline"
  },
  mouseDown: {}
};

class Anchor extends Component {
  constructor(props) {
    super(props);
    this.state = this.applyPropsToState({
      hover: false,
      mouseDown: false
    }, props);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
  }

  onMouseDown(e) {
    e.preventDefault();
    if (parseInt(e.which) === 1) {
      this.setState(st => ({ ...st, mouseDown: true }));
    }
    return false;
  }

  onMouseUp(e) {
    e.preventDefault();
    if (parseInt(e.which) === 1) {
      if (this.state.onClick) {
        this.state.onClick(this);
      }
      if (this.state.href) {
        if (this.state.useRouter) Router.push(this.state.href);
        else window.location.assign(this.state.href);
      }
      this.setState(st => ({ ...st, mouseDown: false })); // TODO: is this in the right place?
    }
    return false;
  }

  onMouseEnter(e) {
    e.preventDefault();
    this.setState(st => ({ ...st, hover: true }));
    return false;
  }

  onMouseLeave(e) {
    e.preventDefault();
    this.setState(st => ({ ...st, hover: false }));
    return false;
  }

  applyPropsToState(st, { onClick, href, style, component, ...props }) {
    let { hover, mouseDown, ...xsStyle } = { ...anchorDefaultStyle, ...style };
    return {
      ...st,
      onClick: onClick,
      href: href,
      useRouter: Boolean(href.match(/^\/([^\/]|$)/)),
      style: xsStyle,
      hoverStyle: { ...anchorDefaultStyle.hover, ...hover || {} },
      mouseDownStyle: { ...anchorDefaultStyle.mouseDown, ...mouseDown || {} },
      component: component,
      props: props
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.hover !== this.state.hover) return true;
    if (nextState.mouseDown !== this.state.mouseDown) return true;
    if (nextState.href !== this.state.href) return true;
    if (nextState.style !== this.state.style) return true;
    if (nextState.hoverStyle !== this.state.hoverStyle) return true;
    if (nextState.mouseDownStyle !== this.state.mouseDownStyle) return true;
    if (nextState.component !== this.state.component) return true;
    if (nextState.props !== this.state.props) return true; // TODO: fixme, this is horrible!
    return false;
  }

  componentWillReceiveProps(props) {
    this.setState(st => this.applyPropsToState(st, props));
  }

  render(_, { hover, mouseDown, style, hoverStyle, mouseDownStyle, component, href, useRouter, props }) {
    return h(component || 'a', {
      ...props,
      style: {
        ...anchorDefaultStyle,
        ...component ? {} : { color: "inherit" }, // stop worrying about <a> tag :hover, :visited, etc...
        ...style,
        ...!component && hover
             ? mouseDown
               ? {...hoverStyle, ...mouseDownStyle}
               : hoverStyle
             : {}
      },
      href: mouseDown ? undefined : href,
      onClick: component || !useRouter ? props.onClick : e => e.preventDefault(),
      onMouseUp: this.onMouseUp,
      onMouseDown: this.onMouseDown,
      onMouseEnter: this.onMouseEnter,
      onMouseLeave: this.onMouseLeave
    });
  }
}

Anchor.defaultProps = {
  style: {}
};

export { Anchor };
export default Anchor;
