import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
import { makeClassName } from './utilities';
import AnimationLoop from './animationloop';
import { spring } from 'preact-motion';

class Loading extends Component {
  constructor(props) {
    super(props);
    this.state = { shouldShow: props.delay === 0 };
  }

  componentWillMount() {
    if (this.props.delay > 0) {
      setTimeout(() => {
        this.setState(st => ({...st, shouldShow: true }));
      }, this.props.delay * 1000);
    }
  }

  componentDidMouse() {
  }

  render({ delay, className, ...props}, { shouldShow }) { // eslint-disable-line no-unused-vars
    if (!shouldShow) return null;
    return (
      <div className={makeClassName('loading-container', className)} {...props}>
        {<AnimationLoop
          styleFrom={{angle: spring(0)}}
          styleTo={{angle: spring(360)}}>
          {({angle}) => <div style={{transform: `rotate(${angle}deg)` }} className="loading" />}
        </AnimationLoop>}
      </div>
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
