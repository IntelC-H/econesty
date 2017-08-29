import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
import { sizingClasses, makeClassName } from 'app/components/utilities';

// TODO:
// 1. Selects
// 2. Caveats

var Select = 1; // TODO: this is a dummy value until a new select is written.

class Form extends Component {
  constructor(props) {
    super(props);
    this.set = this.set.bind(this);
    this.propagateSubmit = this.propagateSubmit.bind(this);
  }

  getChildContext() {
    return { form: this };
  }

  walk(sum, k) {
    if (!sum[k]) sum[k] = {};
    return sum[k];
  }

  set(obj, ref) {
    let kp = ref.context.group ? ref.context.group.name + "." + ref.name : ref.name;
    const split = kp.split('.').filter(e => e.length > 0);
    const key = split[split.length - 1];
    var ptr = split.slice(0, -1).reduce(this.walk, obj);
    if (ref.value instanceof Object && ptr[key] instanceof Object) {
      ptr[key] = Object.assign(ptr[key], ref.value);
    } else ptr[key] = ref.value;
    return obj;
  }

  propagateSubmit(onSubmit, e) {
    if (onSubmit) onSubmit(this.refs.reduce(this.set, this.props.object || {}));
  }

  componentWillMount() {
    this.componentWillUpdate()
  }

  componentWillUpdate() {
    this.refs = [];
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

    filteredProps.children.forEach(c => {
      if (c.attributes) {
        var oldref = c.attributes.ref;
        c.attributes.ref = function(cmp) {
          if ("name" in cmp && "value" in cmp && !cmp.context.group) {
            this.refs.push(cmp);
          }
          
          if (oldref) oldref(cmp);
        }.bind(this);
      }
    });

    return h('form', filteredProps);
  }
}

Form.childContextTypes = {
  form: PropTypes.instanceOf(Form)
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

// fieldset/legend wrapper
class FormGroup extends Component {
  get keypath() { return this.props.keypath; }
  get name() { return this.keypath; }
  get value() { return this.state.value; }

  constructor(props) {
    super(props);
    this.setState = this.setState.bind(this);
    this.setValueForKey = this.setValueForKey.bind(this);
    this.state = { value: {} };
  }

  setValueForKey(k, v) {
    this.setState(st => {
      var val = st.value;
      val[k] = v;
      return { ...st, value: val };
    });
  }

  getChildContext() {
    return { group: this };
  }

  render(props, state) {
    return h('fieldset', Object.assign({}, props)); // need to copy so that children are not lost.
  }
}

FormGroup.childContextTypes = {
  group: PropTypes.instanceOf(FormGroup)
};

FormGroup.defaultProps = {
  keypath: null
};

FormGroup.propTypes = {
  keypath: PropTypes.string
};

class Input extends Component {
  constructor(props) {
    super(props);
    this.setState = this.setState.bind(this);
    this.state = { value: props.value };
  }

  get name() { return this.props.name; };

  get value() {
    return this.state.value;
  }

  set value(val) {
    this.setState({ value: val });
  }

  // TODO: cache this
  get type() {
    const { type, hidden, text,
            checkbox, password,
            email, url, number,
            time, tel } = this.props;

    return checkbox ? "checkbox"
         : hidden ? "hidden"
         : text ? "text"
         : password ? "password"
         : email ? "email"
         : url ? "url"
         : number ? "number"
         : time ? "time"
         : tel ? "tel"
         : search ? "search"
         : range ? "range"
         : type;
  }

  componentDidMount() {
    const { group } = this.context;
    if (group) {
      group.setValueForKey(this.props.name, this.props.value);
    }
  }

  render(props, state, { form, group }) {
    const {className, search, range,
           ignore, placeholder, onInput,
           type, hidden, text, time, // eslint-disable-line no-unused-vars
           checkbox, password, tel, // eslint-disable-line no-unused-vars
           email, url, number, // eslint-disable-line no-unused-vars
           size, sm, md, lg, xl, // eslint-disable-line no-unused-vars
           children, value, // eslint-disable-line no-unused-vars
           ...filteredProps} = props;

    let classes = sizingClasses('pure-input', props);
    if (className) classes.push(className);

    filteredProps.type = this.type;
    filteredProps.className = makeClassName.apply(this, classes);

    if (state.value !== undefined && !ignore) {
      if (this.type === "checkbox") filteredProps.checked = !!state.value;
      else if (state.value)         filteredProps.value   = this.type === "hidden" ? JSON.stringify(state.value) : state.value;
    }

    filteredProps.onInput = function(e) {
      let inpt = e.target;
      let val = undefined;
      if (inpt.type === "checkbox")                    val = inpt.checked || false;
      else if (!inpt.value || inpt.value.length === 0) val = null;
      else if (inpt.type === "hidden")                 val = JSON.parse(inpt.value);
      else val = inpt.value;

      if (group) group.setValueForKey(e.target.name, val);

      this.setState(st => ({ ...st, value: val }));

      if (onInput) onInput(e);
    }.bind(this);

    if (this.type === "checkbox" && !!placeholder && placeholder.length > 0) {
      return <label><input {...filteredProps} /> {placeholder}</label>;
    }

    filteredProps.placeholder = placeholder;
    return h('input', filteredProps);
  }
}

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

export default () => (
  <Form object={ {} } onSubmit={console.log}>
    <Input text name="query" placeholder="Query" />
    <Input hidden name="people" value={[]} />
    <FormGroup keypath="people">
      <Input hidden name="length" value={2} />
    </FormGroup>
    <FormGroup keypath="people.0.user">
      <Input text name="username" placeholder="Username" />
    </FormGroup>
    <FormGroup keypath="people.1.user">
      <Input text name="username" placeholder="Username" />
    </FormGroup>
    <SubmitButton title="Submit!" />
  </Form>
);
