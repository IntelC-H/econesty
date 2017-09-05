import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
import { sizeProp, sizingClasses, makeClassName } from 'app/components/utilities';

// TODO:
// 3. (PureCSS) Styling

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
    this.walk = this.walk.bind(this);
    this.set = this.set.bind(this);
    this.getObject = this.getObject.bind(this);
    this.setRef = this.setRef.bind(this);
    this.recursiveRef = this.recursiveRef.bind(this);
  }

  walk(obj, k) {
    if (!obj[k]) obj[k] = {};
    return obj[k];
  }

  setKeypath(obj, kp, value, sep = '.') {
    var keys = kp.split(sep).filter(e => e.length > 0);
    const key = keys.pop();
    keys.reduce(this.walk, obj)[key] = value;
  }

  set(obj, ref) {
    if (ref.base && ref.base.parentNode && ref.value !== undefined) { // if (ref is mounted && has value) {
      let g = ref.context.group || {};
      let kp = [g.keypath, ref.name].filter(e => !!e).join('.');
      this.setKeypath(obj, kp, ref.value);
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

  setRef(cmp) {
    if (cmp) {
      if (FormElement.isValid(cmp)) {
        if (!this.refs) this.refs = [cmp];
        else            this.refs.push(cmp);
      }
    } else {
      self.refs = [];
    }
  }

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

  render(props) {
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
  get keypath() { return this.props.keypath; } // eslint-disable-line brace-style

  getChildContext() {
    return { group: this };
  }

  render(props) {
    return h('fieldset', Object.assign({}, props, { className: makeClassName(props.className, "pure-group") }));
  }
}

FormGroup.childContextTypes = {
  group: PropTypes.instanceOf(FormGroup)
};

FormGroup.propTypes = {
  keypath: PropTypes.string
};

class FormElement extends Component {
  get name() { return this.props.name; } // eslint-disable-line brace-style
  get ignore() { return this.props.ignore; } // eslint-disable-line brace-style
  get value() { return this.state.value; } // eslint-disable-line brace-style
  set value(v) { this.setState({ value: v }); } // eslint-disable-line brace-style

  constructor(props) {
    super(props);
    this.state = { value: props.value };
    this.onInput = this.onInput.bind(this);
    this.setState = this.setState.bind(this);
  }

  onInput(e) {
    this.value = e.target.value;
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

class Input extends FormElement {
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
           children, value, // eslint-disable-line no-unused-vars
           ...filteredProps} = props;

    filteredProps.type = this.type;
    filteredProps.className = makeClassName.apply(this, [className].concat(sizingClasses('pure-input', props)));

    const isCheck = this.type === "checkbox";

    if (this.value !== undefined && !props.ignore) {
      if (isCheck)         filteredProps.checked = !!this.value;
      else if (this.value) filteredProps.value   = this.type === "hidden" ? JSON.stringify(this.value) : this.value;
    }

    prependFunc(filteredProps, isCheck ? "onClick" : "onInput", this.onInput);

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
    let optVal = props.options.length > 0 ? props.options[0] : null;
    this.state = { value: props.value || optVal };
  }

  render() {
    const { value, options, className, ...filteredProps } = this.props;

    prependFunc(filteredProps, "onChange", this.onInput);
    filteredProps.className = makeClassName.apply(this, [className].concat(sizingClasses('pure-input', filteredProps)));
    filteredProps.children = options.map(s => <option
                                                selected={s === value}
                                                key={filteredProps.name + '-' + s}
                                                value={s}>{s}</option>);
    return h('select', filteredProps);
  }
}

Select.propTypes = {
  ...FormElement.propTypes,
  options: PropTypes.arrayOf(PropTypes.string)
};

Select.defaultProps = {
  ...FormElement.defaultProps
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
          <Select name="foobar" options={["a", "b", "c"]} />
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

