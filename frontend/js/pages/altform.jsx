import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';

class Form extends Component {
  constructor(props) {
    super(props);
    this.propagateSubmit = this.propagateSubmit.bind(this);
  }

  propagateSubmit(onSubmit, e) {
    if (onSubmit && (this.formGroupRefs || this.rootFormGroupRef)) {
      var ret = null;
      if (this.rootFormGroupRef) {
        ret = this.rootFormGroupRef.value;
      }

      for (const kp in this.formGroupRefs) {
        const split = kp.split('.');
        console.log("split", split);
        var ptr = split.slice(0, -1).reduce((sum, k) => {
          if (!sum[k]) sum[k] = {};
          return sum[k];
        }, ret);
        ptr[split[split.length - 1]] = this.formGroupRefs[kp].value;
      }
      onSubmit(ret);
    }
  }

  componentWillUpdate() {
    this.rootFormGroupRef = null;
    this.formGroupRefs = {};
  }

  render(props, state) {
    let { aligned, stacked, className, onSubmit, ...filteredProps } = props;
    var cns = ["pure-form"];
    if (aligned) cns.push("pure-form-aligned");
    if (stacked) cns.push("pure-form-stacked");
    if (className) cns.push(className);

    filteredProps.className = cns.join(' '); // FIXME: use makeClassName
    filteredProps.onSubmit = function(e) {
      e.preventDefault();
      this.propagateSubmit(onSubmit, e);
    }.bind(this);

    // TODO: propagate filteredProps to props.children
    filteredProps.children.forEach(c => {
      if (c.nodeName === FormGroup) {
        const kp = c.attributes.keypath;
        c.attributes.ref = function(cmp) {
          if (kp) this.formGroupRefs[kp] = cmp;
          else    this.rootFormGroupRef = cmp;
        }.bind(this);
      }
    });

    return h('form', filteredProps);
  }
}

Form.propTypes = {
  onSubmit: PropTypes.func,
  object: PropTypes.object,
  aligned: PropTypes.bool,
  stacked: PropTypes.bool
};

Form.defaultProps = {
  onSubmit: null,
  object: null,
  aligned: false,
  stacked: false
};

// TODO: get value out of FormGroup
// fieldset/legend wrapper
class FormGroup extends Component {
  get keypath() { return this.props.keypath; }
  get type() { return this.props.type; }
  get value() { return this.state.value; }

  constructor(props) {
    super(props);
    if (this.type === "object") {
      this.state = { value: {} };
    } else if (this.type === "array") {
      this.state = { value: [] }
    }
  }

  render(props, state) {
    return h('fieldset', props);
  }
}

FormGroup.defaultProps = {
  keypath: null,
  type: "object"
};

FormGroup.propTypes = {
  keypath: PropTypes.string,
  type: PropTypes.oneOf(["object", "array"]) // TODO: more coming in the future.
};

const SubmitButton = props => {
  const { title, ...filteredProps } = props;
  return <input {...filteredProps} value={title} type="submit" />
};

SubmitButton.defaultProps = {
  title: ""
};

SubmitButton.propTypes = {
  title: PropTypes.string
};

class FormPage extends Component {
  constructor(props) {
    super(props);
  }

  render(props, state) {
    return (
      <Form object={ {} } onSubmit={console.log}>
        <FormGroup type="object">

        </FormGroup>
        <FormGroup keypath="people" type="array">

        </FormGroup>
        <FormGroup keypath="people.0.user" type="object">

        </FormGroup>
        <SubmitButton title="Submit!" />
      </Form>
    );
  }
}

export default FormPage;