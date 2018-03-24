import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
import { makeClassName } from './utilities';
import Animations from './animations';
import { spring } from 'preact-motion';
import { FlexContainer } from './flex';

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

  render({ delay, className, ...props}, { shouldShow }) { // eslint-disable-line no-unused-vars
    if (!shouldShow) return null;
    let newClassName = makeClassName('loading-container', className);
    return (
      <div className="container">
        <FlexContainer justifyContent="center" className={newClassName} {...props}>
          <Animations
            animations={this.animations}
            repeat>
            {({width, x}) => {
               return <div className="loading-bar">
                  <div style={{width: `${width}%`, left: `${x}%` }} className="foreground" />
                  <div style={{}} className="background" />
               </div>;
              }}
          </Animations>
        </FlexContainer>
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
