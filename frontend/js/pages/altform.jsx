import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
import { sizeProp, sizingClasses, makeClassName } from 'app/components/utilities';

// TODO:
// 2. Caveats
// 3. PureCSS Styling

class Form extends Component {
  constructor(props) {
    super(props);
    this.set = this.set.bind(this);
    this.getObject = this.getObject.bind(this);
    this.setRef = this.setRef.bind(this);
  }

  inherits(child, parent) {
    if (!child && parent) return false;
    if (child === parent) return true;
    return this.inherits(child.__proto__, parent);
  }

  /*
    Reduce logic
    These exist to optimize toObject().
    Normally, these functions would be created each time getObject() is
    called.
   */

  walk(sum, k) {
    if (!sum[k]) sum[k] = {};
    return sum[k];
  }

  set(obj, ref) {
    if (ref.base && ref.base.parentNode) { // if (ref is mounted) {
      let group = ref.context.group;
      let kp = ((group && group.name && group.name.length && group.name.length > 0) ? group.name + "." + ref.name : ref.name) || "";
      const split = kp.split('.').filter(e => e.length > 0);
      const key = split[split.length - 1];
      var ptr = split.slice(0, -1).reduce(this.walk, obj);
  
      // setting ptr[key] modifies obj through a reference.
      if (ref.value instanceof Object && ptr[key] instanceof Object) {
        // Merge objects
        ptr = ptr[key];
        for (var k in ref.value) {
          if (ref.value.hasOwnProperty(k)) {
            ptr[k] = ref.value[k];
          }
        }

        // Make sure you can use forms to set the value of any Object data structure.
        if (this.inherits(ref.value.__proto__, ptr.__proto__)) {
          Object.setPrototypeOf(ptr, ref.value.__proto__);
        }
      } else {
        ptr[key] = ref.value; // Set values
      }
    }
    return obj;
  }

  /*
   * getObject()
   * returns an object built by aggregating the values of
   * the components in this.refs.
   */
  getObject() {
    return this.refs.reduce(this.set, {});
  }

  isValidFormElement(cmp) {
    return cmp && cmp.name && ("value" in cmp);
  }

  /*
   * setRef(cmp)
   * A function for use with swizzleRefs. Applies 
   * a {VNode} and all its children.
   *  @param {Component|DOMElement} c  A (JSX) Node whose ref will be modified.
   *  @param {Function} f  See "arbitrary function f".
   */
  setRef(cmp) {
    if (cmp) {
      if (cmp.name && ("value" in cmp) && !this.isValidFormElement(cmp.context.group)) {
        if (!this.refs) this.refs = [cmp];
        else            this.refs.push(cmp);
      }
    } else {
      self.refs = [];
    }
  };

  /*
    Rendering Methods
  */

  /*
   * swizzleRefs(c, f)
   * Prepend a call to an arbitrary function f to the ref of
   * a {VNode} and all its children.
   *  @param {VNode} c  A (JSX) Node whose ref will be modified.
   *  @param {Function} f  See "arbitrary function f".
   */
  swizzleRefs(c, f) {
    if (!c.attributes) c.attributes = {}
    var oldref = c.attributes.ref;
    c.attributes.ref = cmp => {
      f(cmp);
      if (oldref) oldref(cmp);
    };

    if (c.children) c.children.forEach(cp => this.swizzleRefs(cp, f));
  }

  render(props, state) {
    let { aligned, stacked, className, onSubmit, ...filteredProps } = props;
    var cns = ["pure-form"];
    if (aligned) cns.push("pure-form-aligned");
    if (stacked) cns.push("pure-form-stacked");
    if (className) cns.push(className);

    filteredProps.className = makeClassName.apply(this, cns);
    filteredProps.onSubmit = function(e) {
      e.preventDefault(); // prevent form POST (messes up SPA)
      if (onSubmit) onSubmit(this.getObject());
    }.bind(this);

    filteredProps.children.forEach(c => this.swizzleRefs(c, this.setRef));

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
    return h('fieldset', Object.assign({}, props, { className: makeClassName(props.className, "pure-group") })); // need to copy so that children are not lost.
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

  get name() { return this.props.name; }
  get value() { return this.state.value; }
  set value(val) { this.setState({ value: val }); }

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
    if (group) group.setValueForKey(this.props.name, this.props.value);
  }

  readInputDOMNode(inpt) {
    let val = undefined;
    if (inpt.type === "checkbox")                    val = inpt.checked || false;
    else if (!inpt.value || inpt.value.length === 0) val = null;
    else if (inpt.type === "hidden")                 val = JSON.parse(inpt.value);
    else val = inpt.value;
  }

  render(props, state, { group }) {
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
      let val = this.readInputDOMNode(e.target);
      if (group) group.setValueForKey(e.target.name, val); // TODO: only set if @group@ is a valid form element.
      this.value = val;

      if (onInput) onInput(e);
    }.bind(this);

    if (this.type === "checkbox") {
      var oldoc = filteredProps.onClick;
      filteredProps.onClick = function(e) {
        filteredProps.onInput(e);
        if (oldoc) oldoc(e);
      };
    }

    if (this.type === "checkbox" && !!placeholder && placeholder.length > 0) {
      return <label><input {...filteredProps} /> {placeholder}</label>;
    }

    filteredProps.placeholder = placeholder;
    filteredProps._component = this;
    return h('input', filteredProps);
  }
}

Input.propTypes = {
  required: PropTypes.bool,
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
  name: PropTypes.string.isRequired,
  value: PropTypes.any,
  size: sizeProp,
  sm: sizeProp,
  md: sizeProp,
  lg: sizeProp,
  xl: sizeProp,
  ignore: PropTypes.bool
};

Input.defaultProps = {
  required: false,
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
  url: false,
  type: undefined,
  value: undefined,
  size: null,
  ignore: false
};

// TODO: factor out name & value properties,
// as well as constructor logic.

class Select extends Component {
  get name() { return this.props.name; }
  get value() { return this.state.value; }
  set value(val) { this.setState({ value: val }); }

  constructor(props) {
    super(props);
    this.setState = this.setState.bind(this);
    this.onChangeHandler = this.onChangeHandler.bind(this);
    this.state = { value: props.value };
  }

  onChangeHandler(e) {
    this.value = e.target.value;
  }

  render(props, state, context) {
    const { name, options, className, onChange, ...filteredProps } = props;
    delete filteredProps.value;

    var classes = sizingClasses('pure-input', props);
    classes.unshift(className);
    return (
      <select
        className={makeClassName.apply(this, classes)}
        name={name}
        onChange={e => {
          this.onChangeHandler(e);
          if (onChange) onChange(e);
        }}
        {...filteredProps}
      >
        {options.map(s => <option selected={s === value} key={name + '-' + s} value={s}>{s}</option>)}
      </select>
    );
  }
}

// FIXME: does this really work?
Select.setValue = (select, val) => {
  select.value = val;
};

Select.toValue = select => {
  var val = (select.children[select.selectedIndex] || {}).value;
  if (!val || val.length === 0) return null;
  return val;
};

const SubmitButton = props => {
  const { title, className, ...filteredProps } = props;
  return <input {...filteredProps} className={makeClassName(className, "pure-button")} value={title} type="submit" />
};

SubmitButton.defaultProps = {
  title: ""
};

SubmitButton.propTypes = {
  title: PropTypes.string
};

export default class AltForm extends Component {
  constructor(props) {
    super(props);
    this.state = { people: ["nancy", "bill", "joe", "emily"] }
  }

  deleteButton(props) {
    return <a className="form-delete-button fa fa-times" {...props} />
  }

  deletePressed(idx) {
    this.setState(st => {
      var newPeople = st.people.slice();
      newPeople.splice(idx, 1);
      return { ...st, people: newPeople };
    });
  }

  render(props, { people }) {
    return (
      <Form stacked onSubmit={console.log}>
        <FormGroup key={people}>
          <Input text name="query" placeholder="Query" />
          <Input hidden name="people" value={[]} />
          <Input hidden name="people.length" value={people.length} key={people} />
        </FormGroup>
        
        {

          people.map((p, idx) => {
            return (
              <div className="form-group" key={p}>
                <hr />
                <this.deleteButton onClick={() => this.deletePressed(idx) } />
                <FormGroup>
                  <Input text name={"people." + idx + ".name"} value={p} />
                </FormGroup>
                <FormGroup keypath={"people." + idx + ".address"}>
                  <Input text name="address_line_one" placeholder="Address Line One" />
                  <Input text name="address_line_two" placeholder="Address Line Two" />
                  <Input checkbox name="current" placeholder="Currently lives here?" />
                </FormGroup>
              </div>
            );
          })

        }
    
        <SubmitButton title="Submit!" />
      </Form>
    );
  }
}

