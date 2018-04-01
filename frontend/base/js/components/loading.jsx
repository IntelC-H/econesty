import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
import Animations from './animations';
import { spring } from 'preact-motion';
import { Flex } from './flex';

const styles = {
  loadingContainer: {
    width: "100%"
  },
  loadingBar: {
    position: "relative",
    width: "10rem",
    height: "0.5rem"
  },
  progress: {
    height: "100%",
    width: "100%",
    top: 0,
    left: 0,
    position: "absolute"
  }
};

class Loading extends Component {
  constructor(props) {
    super(props);
    this.state = { shouldShow: props.delay === 0 };
    this.animations = [
      {
        from: { width: 0, x: 0 },
        to: { width: spring(100), x: spring(0) }
      },
      {
        from: { width: 100, x: 0 },
        to: { width: spring(0), x: spring(100) }
      },
      {
        from: { width: 0, x: 100 },
        to: { width: spring(100), x: spring(0) }
      },
      {
        from: { width: 100, x: 0 },
        to: { width: spring(0), x: spring(0) }
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
          {({width, x}) => {
             return <Flex margin className="loading-bar" style={styles.loadingBar}>
                <div style={{width: `${width}%`, left: `${x}%`, ...styles.progress }} className="progress" />
             </Flex>;
            }}
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
