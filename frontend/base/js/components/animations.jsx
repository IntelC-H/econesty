import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
import { Motion } from 'preact-motion';

class Animations extends Component {
  constructor(props) {
    super(props);
    this.state = { index: 0 };
    this.onRest = this.onRest.bind(this);
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.raf);
    this.setState({ index: 0 });
  }

  onRest() {
    this.raf = requestAnimationFrame(() =>
       this.setState({index: this.props.repeat
                              ? this.state.index >= this.props.animations.length - 1
                                  ? 0
                                  : this.state.index + 1
                              : this.state.index }));
  }

  render({ repeat, // eslint-disable-line no-unused-vars
           animations, ...props }, { index }) {
    return (
      <Motion
        {...props}
        defaultStyle={animations[index].from}
        onRest={this.onRest}
        style={animations[index].to} />
    );
  }
}

Animations.propTypes = {
  animations: PropTypes.arrayOf(PropTypes.object).isRequired
};
Animations.defaultProps = {
  repeat: false
};

export { Animations };
export default Animations;
