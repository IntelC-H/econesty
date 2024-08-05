import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';

class FormGroup extends Component {
  get keypath() { return this.props.keypath; } // eslint-disable-line brace-style

  getChildContext() {
    return { groups: (this.context.groups || []).concat([this]) };
  }

  render({ keypath, // eslint-disable-line no-unused-vars
           ...props}) {
    return h('fieldset', props);
  }
}

FormGroup.childContextTypes = {
  groups: PropTypes.arrayOf(PropTypes.instanceOf(FormGroup))
};

FormGroup.propTypes = {
  keypath: PropTypes.string
};

export { FormGroup };
export default FormGroup;
