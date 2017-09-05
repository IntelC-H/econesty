import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
import { sizeProp, sizingClasses, makeClassName } from 'app/components/utilities';

// TODO:
// 2. Caveats
// 3. PureCSS Styling

function prependFunc(obj, fname, newf) {
  var oldf = obj[fname];
  if (!oldf) obj[fname] = newf;
  else obj[fname] = function() {
    newf.apply(obj, arguments);
    if (oldf) oldf.apply(obj, arguments);
  };
  return obj;
}

class Form extends Component {
  constructor(props) {
    super(props);
    this.set = this.set.bind(this);
    this.getObject = this.getObject.bind(this);
    this.setRef = this.setRef.bind(this);
    this.recursiveRef = this.recursiveRef.bind(this);
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
 
  walk(obj, k) {
    if (!obj[k]) obj[k] = {};
    return obj[k];
  }

  set(obj, ref) {
    if (ref.base && ref.base.parentNode) { // if (ref is mounted) {
      let g = ref.context.group;
      var keys = [];
      if (g && g.keypath) keys = keys.concat(g.keypath.split("."));
      if (ref.name) keys = keys.concat(ref.name.split("."));
      keys = keys.filter(e => e.length > 0);
      const key = keys[keys.length - 1];
      var ptr = keys.slice(0, -1).reduce(this.walk, obj);
  
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
      if (cmp.name && ("value" in cmp) /*&& !this.isValidFormElement(cmp.context.group)*/) {
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
   * recursiveRef(c)
   * prependFunc setRef recursively.
   * a {VNode} and all its children.
   *  @param {VNode} c  A (JSX) Node whose ref will be modified.
   */
  recursiveRef(c) {
    if (!c.attributes) c.attributes = {};
    prependFunc(c.attributes, "ref", this.setRef);
    if (c.children) c.children.forEach(this.recursiveRef);
  }

  render(props, state) {
    let { aligned, stacked, className, onSubmit, ...filteredProps } = props;
    var cns = ["pure-form"];
    if (aligned) cns.push("pure-form-aligned");
    if (stacked) cns.push("pure-form-stacked");
    if (className) cns.push(className);

    filteredProps.className = makeClassName.apply(this, cns);

    if (onSubmit) {
      filteredProps.onSubmit = function(e) {
        e.preventDefault(); // prevent form POST (messes up SPA)
        onSubmit(this.getObject());
      }.bind(this);
    }

    filteredProps.children.forEach(this.recursiveRef);

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

  getChildContext() {
    return { group: this };
  }

  render(props, state) {
    return h('fieldset', Object.assign({}, props, { className: makeClassName(props.className, "pure-group") }));
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
    this.syncValueWithDOMInput = this.syncValueWithDOMInput.bind(this);
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

  syncValueWithDOMInput(inpt) {
    if (inpt.type === "checkbox")     this.value = inpt.checked || false;
    else if (!inpt.value)             this.value = undefined;
    else if (inpt.value.length === 0) this.value = null;
    else if (inpt.type === "hidden")  this.value = JSON.parse(inpt.value);
    else                              this.value = inpt.value;
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

    const isCheck = this.type === "checkbox";

    if (state.value !== undefined && !ignore) {
      if (isCheck)          filteredProps.checked = !!state.value;
      else if (state.value) filteredProps.value   = this.type === "hidden" ? JSON.stringify(state.value) : state.value;
    }

    prependFunc(filteredProps,
                isCheck ? "onClick" : "onInput",
                this.syncValueWithDOMInput);

    if (isCheck && !!placeholder && placeholder.length > 0) {
      filteredProps.id = filteredProps.id || Math.random().toString();
      return (
        <div className="checkbox">
          <input {...filteredProps} />
          <label for={filteredProps.id}>{" " + placeholder}</label>
        </div>
      );
    }

    filteredProps.placeholder = placeholder;
    return h('input', filteredProps);
  }
}

Input.propTypes = {
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

  required: PropTypes.bool,
  ignore: PropTypes.bool,
  name: PropTypes.string.isRequired,
  value: PropTypes.any,

  size: sizeProp,
  sm: sizeProp,
  md: sizeProp,
  lg: sizeProp,
  xl: sizeProp
};

Input.defaultProps = {
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

  required: false,
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
        { ...filteredProps }
      >
        {options.map(s => <option selected={s === value} key={name + '-' + s} value={s}>{s}</option>)}
      </select>
    );
  }
}

Select.setValue = (select, val) => {
  select.value = val;
};

Select.toValue = select => {
  var val = (select.children[select.selectedIndex] || {}).value;
  if (!val || val.length === 0) return null;
  return val;
};

class SubmitButton extends Component {
  constructor(props) {
    super(props);
    this.state = { caveatChecked: false };
    this.onCheckToggle = this.onCheckToggle.bind(this);
  }

  onCheckToggle(e) {
    this.setState({ caveatChecked: e.target.checked });
  }

  render(props, { caveatChecked }) {
    const { caveat, title, className, ...filteredProps } = props;
    filteredProps.value = title;
    filteredProps.disabled = caveat && caveat.length > 0 && !caveatChecked;
    filteredProps.type = "submit";
    filteredProps.className = makeClassName(className, "pure-button");
    return (
      <div>
        {caveat && caveat.length > 0 &&
        <Input checkbox placeholder={caveat} onClick={this.onCheckToggle} />}
        <Input {...filteredProps} />
      </div>
    );
  }
}

SubmitButton.defaultProps = {
  title: "",
  caveat: ""
};

SubmitButton.propTypes = {
  title: PropTypes.string,
  caveat: PropTypes.string
};

export default class AltForm extends Component {
  constructor(props) {
    super(props);
    this.state = { people: ["nancy", "bill", "joe", "emily"] };
  }

  deleteButton(props) {
    return <a className="form-delete-button fa fa-times" {...props} />;
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
    
        <SubmitButton title="Submit!" caveat="Are you sure?" />
      </Form>
    );
  }
}

