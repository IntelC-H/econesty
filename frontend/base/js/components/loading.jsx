import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
import Animations from './animations';
import { spring } from 'preact-motion';
import { Flex } from './flex';
import { parseColor, renderColor, mixColors } from '../style/colors.js';
import BaseStyles from '../style.js';

const styles = {
  loadingContainer: {
    width: "100%"
  },
  loadingBar: {
    position: "relative",
    width: "10rem",
    height: BaseStyles.loading.thickness,
    margin: BaseStyles.padding,
    backgroundColor: renderColor(mixColors(parseColor(BaseStyles.loading.color), parseColor("#FFFFFF"), 0.5))
  },
  progress: {
    height: "100%",
    position: "absolute",
    backgroundColor: BaseStyles.loading.color
  }
};

class Loading extends Component {
  constructor(props) {
    super(props);
    this.state = { shouldShow: props.delay === 0 };
    this.animations = [
      {
        from: { width: 0,           left: 0 },
        to:   { width: spring(100), left: 0 }
      },
      {
        from: { width: 100,       left: 0 },
        to:   { width: spring(0), left: spring(100) }
      },
      {
        from: { width: 0,           left: 100 },
        to:   { width: spring(100), left: spring(0) }
      },
      {
        from: { width: 100,       left: 0 },
        to:   { width: spring(0), left: 0 }
      }
    ];
  }

  componentWillMount() {
    if (this.props.delay > 0) {
      this.timeout = setTimeout(() => {
        this.setState(st => ({...st, shouldShow: true }));
      }, this.props.delay * 1000);
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  render({ delay, style, ...props}, { shouldShow }) { // eslint-disable-line no-unused-vars
    if (!shouldShow) return null;
    let containerStyle = { ...styles.loadingContainer, ...style };
    return (
      <Flex {...props} container justifyContent="center" style={containerStyle}>
        <Animations
          animations={this.animations}
          repeat>
          {({width, left}) =>
            <div style={styles.loadingBar}>
               <div style={{ ...styles.progress, width: `${width}%`, left: `${left}%` }} />
            </div>
          }
        </Animations>
      </Flex>
    );
  }
}

Loading.defaultProps = {
  delay: 1
};
Loading.propTypes = {
  delay: PropTypes.number
};

export { Loading };
export default Loading;
