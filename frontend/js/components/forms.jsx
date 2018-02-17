import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
import { Loading } from 'app/components/elements';
import { sizeProp, sizingClasses, makeClassName } from 'app/components/utilities';

function prependFunc(obj, fname, newf) {
  let oldf = obj[fname];
  if (!oldf) obj[fname] = newf;
  else obj[fname] = function() {
    newf.apply(obj, arguments);
    if (oldf) oldf.apply(obj, arguments);
  };
  return obj;
}

function walkObject(obj, k) {
  if (!obj[k]) obj[k] = {};
  return obj[k];
}

function setKeypath(obj, kp, value) {
  let [key, ...keys] = kp.split('.').filter(e => e && e.length > 0);
  keys.reduce(walkObject, obj)[key] = value;
}

// Provides a mechanism for referencing children
// that are valid form elements.
class ReferencingComponent extends Component {
  constructor(props) {
    super(props);
    this.makeReferences = this.makeReferences.bind(this);
    this.recursiveRef = this.recursiveRef.bind(this);
    this.reference = this.reference.bind(this);
    this.shouldReference = this.shouldReference.bind(this);
  }

  shouldReference(cmp) { // eslint-disable-line no-unused-vars
    return true;
  }

  reference(cmp) {
    if (!this.refs) this.refs = [];
    if (cmp) {
      if (this.shouldReference(cmp)) {
        if (!this.refs) this.refs = [cmp];
        else            this.refs.push(cmp);
      }
    }
  }

  /*
   * recursiveRef(c)
   * Prepend a call to setRef on the ref prop of all descendants of a {VNode} c.
   *  @param {VNode} c  A (JSX) Node whose ref will be modified.
   */
  recursiveRef(c) {
    if (c) {
      if (c instanceof Object) {
        if (!c.attributes) c.attributes = {};
        prependFunc(c.attributes, "ref", this.reference);
      }
      if (c.children) c.children.forEach(this.recursiveRef);
    }
    return c;
  }

  makeReferences(children = this.props.children) {
    children.forEach(this.recursiveRef);
  }
}

class Form extends ReferencingComponent {
  constructor(props) {
    super(props);
    this.set = this.set.bind(this);
    this.getObject = this.getObject.bind(this);
    this.domOnSubmit = this.domOnSubmit.bind(this);
  }

  submit() {
    this.base.dispatchEvent(new Event("submit"));
  }

  shouldReference(cmp) {
    return super.shouldReference(cmp) && FormElement.isValid(cmp);
  }

  set(obj, ref) {
    if (ref.base && ref.base.parentNode && ref.value !== undefined) { // if (ref is mounted && has value) {
      let kp = (ref.context.groups || []).map(g => g.keypath);
      kp.push(ref.name);
      setKeypath(obj, kp.join('.'), ref.value);
    }
    return obj;
  }

  /*
   * getObject()
   * returns an object built by aggregating the values of
   * the components in this.refs.
   */
  getObject() {
    return (this.refs || []).reduce(this.set, {});
  }

  domOnSubmit(e) {
    e.preventDefault(); // prevent form POST (messes up SPA)
    this.props.onSubmit(this.getObject());
    return false;
  }

  render(props) {
    this.makeReferences();

    let { aligned, stacked, className, onSubmit, ...filteredProps } = props;
    let cns = ["pure-form"];
    if (aligned) cns.push("pure-form-aligned");
    if (stacked) cns.push("pure-form-stacked");
    if (className) cns.push(className);

    filteredProps.className = makeClassName.apply(this, cns);

    if (onSubmit) {
      filteredProps.action = "javascript" + ":"; // appease JSLint
      filteredProps.onSubmit = this.domOnSubmit;
    }

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

// fieldset/legend wrapper
class FormGroup extends Component {
  get keypath() { return this.props.keypath; } // eslint-disable-line brace-style

  getChildContext() {
    return { groups: (this.context.groups || []).concat([this]) };
  }

  render() {
    const { className, ...filteredProps } = this.props;
    filteredProps.className = makeClassName(className, "form-group");
    delete filteredProps.keypath;
    return h('fieldset', filteredProps);
  }
}

FormGroup.childContextTypes = {
  groups: PropTypes.arrayOf(PropTypes.instanceOf(FormGroup))
};

FormGroup.propTypes = {
  keypath: PropTypes.string
};

class FormElement extends Component {
  get name() { return this.props.name; } // eslint-disable-line brace-style
  get ignore() { return this.props.ignore; } // eslint-disable-line brace-style
  get value() { return this.state.value; } // eslint-disable-line brace-style
  set value(v) { this.setState(st => ({ ...st, value: v })); } // eslint-disable-line brace-style

  constructor(props) {
    super(props);
    this.state = { value: props.value };
    this.setState = this.setState.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.value !== nextProps.value) {
      this.setState(st => ({ ...st, value: nextProps.value }));
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { name, ignore, value } = this.props;
    if (name !== nextProps.name) return true;
    if (ignore !== nextProps.ignore) return true;
    if (value !== nextProps.value) return true;
    if (this.state.value !== nextState.value) return true;
    return false;
  }
}

FormElement.isValid = c => c && c.name && "value" in c;

FormElement.propTypes = {
  name: PropTypes.string.isRequired,
  ignore: PropTypes.bool,
  required: PropTypes.bool
};

FormElement.defaultProps = {
  ignore: false,
  required: false
};

// TODO: better use of value prop
class Input extends FormElement {
  constructor(props) {
    super(props);
    this.onInput = this.onInput.bind(this);
    if (this.type === "checkbox" && !this.value) this.state.value = false;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.state.value) {
      this.setState(st => ({ ...st, value: nextProps.value}));
    }
  }

  // TODO: cache this
  get type() {
    const { type, hidden, text,
            checkbox, password,
            email, url, number,
            search, range, time, tel } = this.props;

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

  onInput(e) {
    const inpt = e.target;
    if (inpt.type === "checkbox")     this.value = inpt.checked || false;
    else if (!inpt.value)             this.value = undefined;
    else if (inpt.value.length === 0) this.value = null;
    else if (inpt.type === "hidden")  this.value = JSON.parse(inpt.value);
    else                              this.value = inpt.value;
  }

  render(props) {
    const {className, placeholder,
           type, search, range, // eslint-disable-line no-unused-vars
           hidden, text, time, // eslint-disable-line no-unused-vars
           checkbox, password, tel, // eslint-disable-line no-unused-vars
           email, url, number, // eslint-disable-line no-unused-vars
           size, sm, md, lg, xl, // eslint-disable-line no-unused-vars
           children, // eslint-disable-line no-unused-vars
           ...filteredProps} = props;

    filteredProps.type = this.type;
    filteredProps.className = makeClassName.apply(this, [className].concat(sizingClasses('pure-input', props)));

    const isCheck = this.type === "checkbox";

    if (this.value !== undefined && !props.ignore) {
      if (isCheck)         filteredProps.checked = !!this.value;
      else if (this.value) filteredProps.value   = this.type === "hidden" ? JSON.stringify(this.value) : this.value;
    }

    prependFunc(filteredProps, isCheck ? "onClick" : "onInput", this.onInput);

    if (isCheck && placeholder && placeholder.length > 0) {
      return (
        <label className="checkbox">{placeholder + " "}<input {...filteredProps} /></label>
      );
    }

    filteredProps.placeholder = placeholder;
    return h('input', filteredProps);
  }
}

Input.propTypes = {
  ...FormElement.propTypes,
  hidden: PropTypes.bool,
  text: PropTypes.bool,
  checkbox: PropTypes.bool,
  number: PropTypes.bool,
  password: PropTypes.bool,
  email: PropTypes.bool,
  time: PropTypes.bool,
  tel: PropTypes.bool,
  search: PropTypes.bool,
  range: PropTypes.bool,
  url: PropTypes.bool,
  type: PropTypes.oneOf(["hidden", "text", "checkbox", "password",
                         "email", "url", "number", "time", "tel",
                         "search", "range"]),

  size: sizeProp,
  sm: sizeProp,
  md: sizeProp,
  lg: sizeProp,
  xl: sizeProp
};

Input.defaultProps = {
  ...FormElement.defaultProps,
  hidden: false,
  text: false,
  checkbox: false,
  number: false,
  password: false,
  email: false,
  time: false,
  tel: false,
  search: false,
  range: false,
  url: false
};

class Select extends FormElement {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value || (!this.isAsync && props.options.length > 0 ? props.transform(props.options[0]) : null),
      loading: false,
      options: this.isAsync ? [] : props.options
    };
  }

  get isAsync() {
    return typeof this.props.options === "function";
  }

  componentWillMount() {
    if (this.isAsync) {
      if (!this.state.loading) this.setState(st => ({ ...st, loading: true }));
      this.props.options().then(es => {
        this.setState(st => {
          let hasValue = st.value !== null && st.value !== undefined;
          return {
            ...st,
            loading: false,
            value: es.length === 0 || hasValue ? st.value : this.props.transform(es[0]),
            options: es
          };
        });
      });
    }
  }

  render(props, { loading }) {
    if (this.isAsync && loading) return <Loading />;

    const { value, options, // eslint-disable-line no-unused-vars
            transform, faceTransform, className, ...filteredProps } = props;

    prependFunc(filteredProps, "onChange", this.onInput);
    filteredProps.className = makeClassName.apply(this, [className].concat(sizingClasses('pure-input', filteredProps)));

    if (!this.state.options || this.state.options.length === 0) {
      filteredProps.disabled = true;
      filteredProps.children = [<option selected={false}>No Options</option>];
    } else {
      filteredProps.children = this.state.options.map(s => {
        let sprime = transform(s);
        let isSame = (sprime ? sprime.toString() : null) === (this.value ? this.value.toString() : null);
        return <option
                 selected={isSame}
                 key={filteredProps.name + '-' + s}
                 value={sprime}>{faceTransform(s)}</option>;
      });
    }
    return h('select', filteredProps);
  }
}

Select.propTypes = {
  ...FormElement.propTypes,
  options: PropTypes.arrayOf(PropTypes.string),
  transform: PropTypes.func, // transform the value for the form
  faceTransform: PropTypes.func // transform the value for display
};

Select.defaultProps = {
  ...FormElement.defaultProps,
  transform: x => x,
  faceTransform: x => x
};

export { Form, FormGroup, FormElement, Select, Input };

export default {
  Form: Form,
  FormGroup: FormGroup,
  FormElement: FormElement,
  Select: Select,
  Input: Input
};
