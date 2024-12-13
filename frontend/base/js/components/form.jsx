import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
import Referencing from './referencing';
import FormElement from './form/formelement';

function setKeypath(obj, kp, value) {
  let [key, ...keys] = kp.split('.').filter(Boolean);
  keys.reduce((o, k) => o[k] = o[k] || {}, obj)[key] = value;
  return obj;
}

class Form extends Referencing {
  constructor(props) {
    super(props);
    this.domOnSubmit = this.domOnSubmit.bind(this);
  }

  // Subclass Override
  shouldReference(cmp) {
    return super.shouldReference(cmp) && FormElement.isValid(cmp);
  }

  // Returns an object built by aggregating the values of
  // the components in this.refs.
  getObject() {
    return (this.refs || [])
      // First, ensure all refs are mounted, shouldn't be ignored, and have a value.
      .filter(r => r.base && r.base.parentNode && !r.ignore && r.name && r.value !== undefined)
      // Then set each ref's keypath on a new object.
      .reduce((o, r) => setKeypath(o, (r.context.groups || []).map(g => g.keypath).concat([r.name]).join('.'), r.value), {});
  }

  domOnSubmit(e) {
    e.preventDefault(); // prevent form POST
    e.stopPropagation(); // enable submitting subforms without affecting parent forms.
    if (this.props.onSubmit) {
      this.props.onSubmit(this.getObject());
    }
    return false; // prevent bubbling of the event
  }

  render(props) {
    return <form { ...props } onSubmit={this.domOnSubmit} />;
  }
}

Form.propTypes = {
  onSubmit: PropTypes.func
};

Form.defaultProps = {
  onSubmit: null
};

export { Form };
export default Form;

