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
    this.setState({ index: 0 });
  }

  onRest() {
    this.setState((st, { repeat, animations }) => ({...st,
                          index: repeat
                           ? st.index >= animations.length - 1
                               ? 0
                               : st.index + 1
                           : st.index }));
  }

  componentShouldUpdate(nextProps, nextState) {
    return nextState.index !== this.state.index;
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
