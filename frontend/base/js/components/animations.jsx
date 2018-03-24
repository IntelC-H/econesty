import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
import { Motion, spring } from 'preact-motion';

class Animations extends Component {
  constructor(props) {
    super(props);
    this.state = { index: 0, animations: props.animations, repeat: props.repeat };
    this.onRest = this.onRest.bind(this);
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.raf);
    this.setState({ index: 0 });
  }

  onRest() {
    this.raf = requestAnimationFrame(() => this.setState(st => ({...st, index: st.repeat ? (st.index >= (st.animations.length - 1) ? 0 : st.index + 1) : st.index })));
  }

  render({ styleFrom, styleTo, ...props }, { animations, index }) {
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
