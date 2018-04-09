import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { Motion, spring, presets } from 'preact-motion';
import Drawer from './drawer';
import SVGIcon from './svgicon';
import { noSelect } from '../style/mixins';
import { parseSize, renderSize, fmapSize } from '../style/sizing';
import BaseStyles from '../style';

const styles = {
  label: {
    cursor: "pointer",
    ...noSelect()
  },
  disclosure: {
    padding: "0 " + BaseStyles.padding
  },
  content: {
    paddingLeft: renderSize(fmapSize(s => s * 4, parseSize(BaseStyles.padding)))
  }
};

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

  render({ children, label, preset, animateClose, animateOpen, labelStyle, ...props }, { contentVisible }) {
    return (
      <div {...props}>
        <label onClick={this.toggle} style={{ ...styles.label, ...labelStyle }}>
          <Motion style={{angle: spring(contentVisible ? 90 : 0, presets.wobbly)}}>
            {({ angle }) =>
              <SVGIcon viewBox="0 0 192 512" path="M0 384.662V127.338c0-17.818 21.543-26.741 34.142-14.142l128.662 128.662c7.81 7.81 7.81 20.474 0 28.284L34.142 398.804C21.543 411.404 0 402.48 0 384.662z"
                    style={{...styles.disclosure, transform: "rotate(" + angle + 'deg)'}}/>}
          </Motion>
          {label}
        </label>
        <Drawer ref={d => this.drawer = d }
                contentStyle={styles.content /* TODO factor this prop out!!!! */}
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
  animateClose: false,
  animateOpen: false,
  labelStyle: {}
};

export { Collapsible };
export default Collapsible;
