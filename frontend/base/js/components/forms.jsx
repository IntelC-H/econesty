import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
import { Loading } from './loading';
import { prependFunc } from './utilities';

// Provides a mechanism for referencing children
// that are valid form elements.
class ReferencingComponent extends Component {
  constructor(props) {
    super(props);
    this.recursiveRef = this.recursiveRef.bind(this);
    this.reference = this.reference.bind(this);
    this.shouldReference = this.shouldReference.bind(this);
    this.refreshReferences();
  }

  shouldReference(cmp) { // eslint-disable-line no-unused-vars
    return true;
  }

  // TODO: how to handle null refs (that signify the non-existence of an element)?
  reference(cmp) {
    if (cmp && this.shouldReference(cmp)) {
      this.refs.push(cmp);
    }
  }

  /*
   * recursiveRef(c)
   * Prepend a call to setRef on the ref prop of all descendants of a {VNode} c.
   *  @param {VNode} c  A (JSX) Node whose ref will be modified.
1   */
  recursiveRef(c) {
    if (c && c instanceof Object) {
      c.attributes = c.attributes || {};
      prependFunc(c.attributes, "ref", this.reference);
      if (c.children) c.children.forEach(this.recursiveRef);
    }
    return c;
  }

  refreshReferences(children = this.props.children) {
    this.refs = [];
    children.forEach(this.recursiveRef);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.children !== this.props.children) {
      this.refreshReferences(nextProps.children);
    }
  }
}

function setKeypath(obj, kp, value) {
  let [key, ...keys] = kp.split('.').filter(Boolean);
  keys.reduce((o, k) => o[k] = o[k] || {}, obj)[key] = value;
  return obj;
}

class Form extends ReferencingComponent {
  constructor(props) {
    super(props);
    this.domOnSubmit = this.domOnSubmit.bind(this);
  }

  // Subclass Override
  shouldReference(cmp) {
    return super.shouldReference(cmp) && FormElement.isValid(cmp);
  }

  // PUBLIC API
  submit() {
    this.base.dispatchEvent(new Event("submit"));
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
    e.stopPropagation(); // enable submitting subforms without affecting parent forms.
    e.preventDefault(); // prevent form POST
    if (this.props.onSubmit) {
      this.props.onSubmit(this.getObject());
    }
    return false;
  }

  render(props) {
    return <form { ...props } action={"javascript" + ":"} onSubmit={this.domOnSubmit} />;
  }
}

Form.propTypes = {
  onSubmit: PropTypes.func,
  object: PropTypes.object
};

Form.defaultProps = {
  onSubmit: null,
  object: null
};

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

  static isValid(c) {
    return c && c.name && "value" in c;
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.value !== nextProps.value || nextProps.value !== this.state.value) {
      this.setState(st => ({ ...st, value: nextProps.value }));
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.name !== nextProps.name) return true;
    if (this.state.value !== nextState.value) return true;
    return false;
  }
}

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
    this.toggleCheckbox = this.toggleCheckbox.bind(this);
    if (this.getType() === "checkbox" && !this.value) this.state.value = false;
  }

  // TODO: cache this
  getType() {
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
    if (inpt.type === "checkbox")     this.value = Boolean(inpt.checked);
    else if (inpt.type === "hidden")  this.value = JSON.parse(inpt.value);
    else                              this.value = inpt.value;
  }

  toggleCheckbox() {
    if (!this.props.disabled) {
      this.value = !this.value;
    }
  }

  render({type, search, range, // eslint-disable-line no-unused-vars
          hidden, text, time, // eslint-disable-line no-unused-vars
          password, tel, email, url, // eslint-disable-line no-unused-vars
          number, value, ignore, // eslint-disable-line no-unused-vars
          checkbox,
          // TODO: sizing classes
          // size, sm, md, lg, xl, // eslint-disable-line no-unused-vars
          ...props}) {
    props.type = this.getType();

    if (checkbox) props.checked = Boolean(this.value);
    else if (this.value !== undefined) {
      if (hidden) props.value = JSON.stringify(this.value);
      else        props.value = this.value;
    }

    prependFunc(props, checkbox ? "onClick" : "onInput", this.onInput);

    if (checkbox && props.placeholder && props.placeholder.length > 0) {
      return (
        <label className="checkbox">
          <span onClick={this.toggleCheckbox}>{props.placeholder + " "}</span>
          <input {...props} />
        </label>
      );
    }

    return h('input', props);
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
                         "search", "range"])
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

const isFunc = x => typeof x === "function";

class Select extends FormElement {
  constructor(props) {
    super(props);
    this.state = this.applyPropsToState({ ...this.state, loading: false }, props);
    this.reloadData();
  }

  get isAsync() {
    return this.state.loadOptions !== undefined && isFunc(this.state.loadOptions);
  }

  applyPropsToState(state, { value, options, transform }) {
    let optsOrEmpty = options || [];
    let additions = {transform: transform};
    if (!isFunc(options)) {
      additions.options = options;
      additions.loadOptions = null;
      if (!additions.value && optsOrEmpty.length > 0) {
        additions.value = transform(optsOrEmpty[0]);
      }
    } else {
      additions.loadOptions = options;
      additions.value = value;
    }

    return {
      ...state,
      ...additions
    };
  }

  reloadData() {
    if (this.isAsync) {
      this.setState(st => ({ ...st, loading: true }));
      this.state.loadOptions().then(es =>
        this.setState(st => ({
          ...st,
          loading: false,
          value: st.value || (es.length > 0 ? this.props.transform(es[0]) : null),
          options: es
        }))
      );
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (super.shouldComponentUpdate(nextProps, nextState)) return true;
    if (this.state.options !== nextState.options) return true;
    if (this.state.loading !== nextState.loading) return true;
    return false;
  }

  componentWillReceiveProps(nextProps) {
    super.componentWillReceiveProps(nextProps);
    this.setState(st => this.applyPropsToState(st, nextProps));
  }

  onInput(e) {
    this.value = e.target.value;
  }

  render({ value, options, // eslint-disable-line no-unused-vars
           transform, faceTransform, ...filteredProps }, { loading }) {
    if (this.isAsync && loading) return <Loading />;

    prependFunc(filteredProps, "onChange", this.onInput);
  //  filteredProps.className = makeClassName.apply(this, [className].concat(sizingClasses('pure-input', filteredProps)));

    if (!this.state.options || this.state.options.length === 0) {
      filteredProps.disabled = true;
      filteredProps.children = [<option selected={false}>No Options</option>];
    } else {
      filteredProps.children = this.state.options.map(s => {
        let sprime = transform(s);
        let isSame = (sprime ? sprime.toString() : null) === (this.value ? this.value.toString() : null);
        return <option
                 selected={isSame}
                 key={filteredProps.name + '-' + sprime}
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
  faceTransform: x => x,
  options: []
};

export { Form, FormGroup, FormElement, Select, Input };

export default {
  Form: Form,
  FormGroup: FormGroup,
  FormElement: FormElement,
  Select: Select,
  Input: Input
};
