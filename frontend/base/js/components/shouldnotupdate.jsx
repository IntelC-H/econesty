import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';

class ShouldNotUpdate extends Component {
  shouldComponentUpdate() {
    return false;
  }

  render() {
    const {component, ...props} = this.props;
    return h(component, props);
  }
}

ShouldNotUpdate.defaultProps = {
  component: 'div'
};

ShouldNotUpdate.propTypes = {
  component: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.node
  ])
};

export { ShouldNotUpdate };
export default ShouldNotUpdate;
