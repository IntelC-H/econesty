import { h, render, cloneElement } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
import { makeClassName, sizeProp, sizingClasses, inheritClass } from './utilities';
import { Button, Grid, GridUnit } from './elements';

//
// TODO: Rewrite!
//
// 1. Stateful forms that don't lose value on each rewrite
// 2. No more manual DOM manipulation
//

// TODO: labels directly on checkboxes.
// TODO: separate Checkbox form Input?
// TODO: separate email, url, text, password, etc from Input?
// TODO: textareas

const InputGroup = inheritClass('fieldset', 'pure-group');

const Input = props => {
  const {hidden, text, checkbox, password,
         className, type, email, url,
         value, onSet, ignore, placeholder,
         size, sm, md, lg, xl, // eslint-disable-line no-unused-vars
         children, onInput, // eslint-disable-line no-unused-vars
         ...filteredProps} = props;

  const typeString = checkbox ? "checkbox" : hidden ? "hidden" : text ? "text" : password ? "password" : email ? "email" : url ? "url" : type;

  let classes = sizingClasses('pure-input', props);
  if (className) classes.push(className);

  filteredProps.type = typeString;
  filteredProps.className = makeClassName.apply(this, classes);

  if (ignore) filteredProps["data-ignore"] = ignore;
  if (value) filteredProps.value = typeString === "hidden" ? JSON.stringify(value) : value;

  if (onSet) {
    filteredProps.onInput = e => {
      var val = e.target.value || null;
      const isJSON = val && e.target.type === "hidden" && val.length > 0;

      var jsonVal = null;
      if (isJSON) jsonVal = JSON.parse(val);
      onSet(jsonVal || val);
      if (isJSON) e.target.value = JSON.stringify(jsonVal);
    }
  }

  if (typeString === "checkbox" && !!placeholder && placeholder.length > 0) {
    return <label><input {...filteredProps}/> {placeholder} </label>;
  }

  return h('input', Object.assign(filteredProps, { placeholder: placeholder }));
};

Input.setValue = (c, val) => {
  if (!(c.dataset.ignore === "true")) {
    if (c.type === "checkbox") c.checked = !!val;
    else if (val)              c.value = c.type === "hidden" ? JSON.stringify(val) : val;
    else                       c.value = null;
    c.dispatchEvent(new InputEvent("input", { target: c }));
  }
};

Input.toValue = inpt => {
  if (inpt.type === "checkbox")                    return inpt.checked || false;
  else if (!inpt.value || inpt.value.length === 0) return null;
  else if (inpt.type === "hidden")                 return JSON.parse(inpt.value);
  return inpt.value;
};

Input.propTypes = {
  required: PropTypes.bool,
  hidden: PropTypes.bool,
  text: PropTypes.bool,
  checkbox: PropTypes.bool,
  password: PropTypes.bool,
  email: PropTypes.bool,
  url: PropTypes.bool,
  type: PropTypes.oneOf(["hidden", "text", "checkbox", "password", "hidden"]),
  name: PropTypes.string.isRequired,
  value: PropTypes.any,
  size: sizeProp,
  sm: sizeProp,
  md: sizeProp,
  lg: sizeProp,
  xl: sizeProp,
  ignore: PropTypes.bool,
  onSet: PropTypes.func
};

Input.defaultProps = {
  required: false,
  hidden: false,
  text: false,
  checkbox: false,
  password: false,
  email: false,
  url: false,
  type: undefined,
  value: undefined,
  size: null,
  ignore: false,
  onSet: null
};

const Select = props => {
  const { name, options, value, className, ...filteredProps } = props;
  var classes = sizingClasses('pure-input', props);
  classes.unshift(className);
  return (
    <select className={makeClassName.apply(this, classes)} name={name} {...filteredProps}>
      {options.map(s => <option selected={s === value} key={name + '-' + s} value={s}>{s}</option>)}
    </select>
  );
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

Select.propTypes = {
  name: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.any),
  value: PropTypes.any,
  size: sizeProp,
  sm: sizeProp,
  md: sizeProp,
  lg: sizeProp,
  xl: sizeProp
};

Select.defaultProps = {
  options: []
};

const ControlGroup = props => {
  const { message, label, children } = props;
  const hasMessage = !!message;
  // TODO: finish pure-control-group replacement
  return (
    <Grid className="control-group v-margined">
      <GridUnit size="1" sm="1-4">
        <label>{label || " "}</label>
      </GridUnit>
      <GridUnit size="1" sm={hasMessage ? "1-2" : "3-4"}>
        {children}
      </GridUnit>
      {message !== null && <GridUnit size="1" sm={hasMessage ? "1-4" : "1-2"}>
        <span className="pure-form-message-inline">{message}</span>
      </GridUnit>}
    </Grid>
  );
}

ControlGroup.propTypes = {
  message: PropTypes.string,
  label: PropTypes.string
};

ControlGroup.defaultProps = {
  message: null,
  label: null
};

const SubmitButton = props => {
  const clickHandler = e => {
    e.preventDefault();
    if (props.caveat && !SubmitButton.isCaveatChecked(e.target)) return;
    props.onSubmit(Form.toObject(SubmitButton.findForm(e.target)));
  };

  return (
    <div className="pure-controls">
      {props.caveat !== null && <label className="pure-checkbox">
        <input type="checkbox" className="form-caveat" /> {props.caveat}
      </label>}
      <Button primary onClick={clickHandler}>{props.children}</Button>
    </div>
  );
};

const testEl = el => el.dataset.form === "true" && el.dataset.group !== "true" && !el.hasAttribute("name");
SubmitButton.findForm = btn => {
  var btnp = btn;
  while (btnp) {
    if (testEl(btnp)) return btnp;
    btnp = btnp.parentElement;
  }
  return null;
}

SubmitButton.isCaveatChecked = btn => {
  if (btn && btn.parentElement) {
    const checkbox = btn.parentElement.querySelector('input[type="checkbox"].form-caveat');
    if (checkbox && checkbox.checked) return true;
  }
  return false;
}

SubmitButton.propTypes = {
  onSubmit: PropTypes.func,
  caveat: PropTypes.string
};

SubmitButton.defaultProps = {
  onSubmit: () => undefined,
  caveat: null
};


// TODO: delete elements of array
const Form = props => {
  const { aligned, stacked, className, subForm, group, object, children, ...filteredProps } = props;
  var cns = ["pure-form"];
  if (aligned) cns.push("pure-form-aligned");
  if (stacked) cns.push("pure-form-stacked");
  if (subForm) cns.push("subform");
  if (group) cns.push("groupform");
  if (className) cns.push(className);

  return (
    <div
      ref={e => {
        if (e) {
          if (group) e._groupTemplate = children;
          else {//if (!SubmitButton.findForm(e)) { // no parent forms
            Form.setObject(object, e);
          }
        }
      }}
      data-form
      data-subform={subForm}
      data-group={group}
      className={cns.join(' ')}
      {...filteredProps}
    >
      {!group && <fieldset>{children}</fieldset>}
    </div>
  );
};

Form.propTypes = {
  name: PropTypes.string,
  object: PropTypes.object,
  subForm: PropTypes.bool,
  group: PropTypes.bool,
  aligned: PropTypes.bool,
  stacked: PropTypes.bool
};

Form.defaultProps = {
  name: null,
  object: null,
  subForm: false,
  group: false,
  aligned: false,
  stacked: false
};

// operates on DOM elements
Form.toObject = (el, acc = {}) => {
  if (!el || !el.children) return acc;
  Array.from(el.children).forEach(child => {
    const ignore = child.dataset.ignore === "true";
    const name = child.getAttribute("name") || false;
    const isForm = child.dataset.form === "true";
    const isGroup = child.dataset.group === "true";
    const tname = child.tagName.toLowerCase();

    if (name && !ignore && isForm && isGroup) acc[name] = Array.from(child.children)
                                                          .filter(e => e.className.toLowerCase() === "form-group")
                                                          .map(e => Form.toObject(e));
    else if (name && !ignore && isForm)       acc[name] = Form.toObject(child);
    else if (name && !ignore && tname === "input")  acc[name] = Input.toValue(child);
    else if (name && !ignore && tname === "select") acc[name] = Select.toValue(child);
    else acc = Form.toObject(child, acc);
  });
  return acc;
};

// operates on DOM elements
// (mostly... see Form(). PLEASE DON'T CALL THIS IN YOUR CODE)
Form.setObject = (obj, c) => {
  if (obj && c) {
    const isForm = c.dataset.form === "true";
    const isGroup = c.dataset.group === "true";
    const tname = c.tagName.toLowerCase();
    const name = c.getAttribute("name");

    const val = obj[name] || undefined;

    if (isForm && isGroup && val && val.length > 0) {
      let ary = val.slice();

      var i = 0;
      while (ary.length > 0 && c.children.length > i) {
        var cld = c.children[i];
        if (cld instanceof HTMLElement && cld.className === "form-group") {
          Form.setObject(ary.shift(), cld);
          i++;
        } else c.removeChild(cld);
      }

      ary.forEach(elem => {
        let div = document.createElement('div');

        let template = c._groupTemplate.map(cld => cloneElement(cld));
        let fieldset = render(h('fieldset', {}, template));
        let deleteButton = render(<a
          onClick={() => div.parentElement.removeChild(div)}
          className="form-delete-button fa fa-times"
        />);

        div.className = "form-group";
        div.appendChild(deleteButton);
        div.appendChild(fieldset);
        c.appendChild(div);
        Form.setObject(elem, fieldset);
      });
    } else if (tname === "input") Input.setValue(c, val);
    else if (tname === "select") Select.setValue(c, val);
    else if (c.children && c.children.length > 0) {
      Array.from(c.children).forEach(x => Form.setObject(name ? val : obj, x));
    }
  }
};

export { InputGroup, Input, Select, ControlGroup, SubmitButton, Form };

export default {
  InputGroup: InputGroup,
  Input: Input,
  Select: Select,
  ControlGroup: ControlGroup,
  SubmitButton: SubmitButton,
  Form: Form
};
