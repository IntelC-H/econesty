import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { Motion, spring, presets } from 'preact-motion';
import { makeClassName } from './utilities';
import Drawer from './drawer';

class Collapsible extends Component {
  constructor(props) {
    super(props);
    this.state = {
	contentVisible: false
    };
    this.toggle = this.toggle.bind(this);
    this.drawer = undefined;
  }

  toggle() {
    this.setState(st => {
      this.drawer.toggle();
      return {...st, contentVisible: this.drawer.isOpen()  };
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextState.contentVisible !== this.state.contentVisible || nextProps.children !== this.props.children;
  }

  render({ children, label, className, preset, animateClose, animateOpen, ...props }, { contentVisible }) {
    let containerProps = {
      ...props,
      className: makeClassName("collapsible", className)
    };

    return (
      <div {...containerProps}>
        <label onClick={this.toggle}>
          <Motion style={{angle: spring(contentVisible ? 90 : 0, presets.wobbly)}}>
            {({ angle }) => <span className="fa fa-caret-right disclosure" style={{transform: "rotate(" + angle + 'deg)'}}/> }
          </Motion>
          {label}
        </label>
        <Drawer ref={d => this.drawer = d }
                preset={preset}
                animateClose={animateClose}
                animateOpen={animateOpen}>
          {children}
        </Drawer>
      </div>
    );
  }
}

Collapsible.defaultProps = {
  preset: presets.wobbly,
  animateClose: true,
  animateOpen: true
};

export { Collapsible };
export default Collapsible;
