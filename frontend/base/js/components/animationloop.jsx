import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
import { Motion } from 'preact-motion';

class AnimationLoop extends Component {
  constructor(props) {
    super(props);
    this.state = { flag: true };
    this.onRest = this.onRest.bind(this);
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.raf);
  }

  onRest() {
    this.raf = requestAnimationFrame(() => this.setState({flag: !this.state.flag}));
  }

  render({ styleFrom, styleTo, ...props }, { flag }) {
    const defaultStyle = Object.keys(styleFrom).reduce((result, key) => ({
      ...result,
      [key]: typeof styleFrom[key] === 'object' ? styleFrom[key].val : styleFrom[key]
    }), {});
    return (
      <Motion
        {...props}
        defaultStyle={defaultStyle}
        onRest={this.onRest}
        style={flag ? styleTo : styleFrom} />
    );
  }
}

AnimationLoop.propTypes = {
  styleFrom: PropTypes.object.isRequired,
  styleTo: PropTypes.object.isRequired
};

export { AnimationLoop };
export default AnimationLoop;
