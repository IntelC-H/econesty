import React from 'react';
import PropTypes from 'prop-types';

// TODO: radio inputs

function guid() {
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return s4() + [s4(), s4(), s4(), s4(), s4()].join('-') + s4() + s4();
}

/*
<Form>
  <Element hidden name="value" value="999" />
  <Form name="user">
    <Element hidden name="id" value="2" />
  </Form>
</Form>
*/

// Forms can take props.object as form value defaults.

const Element = props => {
  var typ = props.hidden ? "hidden" : props.text ? "text" : props.checkbox ? "checkbox" : props.password ? "password" : props.type;
  let {hidden, text, checkbox, password, wrapperClass, label, type, email, url, ...filteredProps} = props;
  return (
    <div className={props.wrapperClass}>
      <input type={typ} {...filteredProps} />
      {props.label !== null && <label>{props.label}</label>}
    </div>
  );
};

Element.propTypes = {
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
  label: PropTypes.string,
  wrapperClass: PropTypes.string
};

Element.defaultProps = {
  required: false,
  hidden: false,
  text: false,
  checkbox: false,
  password: false,
  email: false,
  url: false,
  type: "hidden",
  value: undefined,
  label: null,
  wrapperClass: ""
};

const Form = props => {
  var children = !props.children ? [] : props.children.length === 1 ? [props.children] : Array.from(props.children);
  console.log("<Form />", children, props);
  if (props.onSubmit && !props.subForm) {
    children.push(<button key={guid()} onClick={e => props.onSubmit(Form.reduceForms(e.target.parentElement))}>{props.submitText || "Submit"}</button>);
  }
  return Form.setObject(props.object, <div data-is-form data-is-subform={props.subForm} name={props.name}>{children}</div>);
};

Form.propTypes = {
  onSubmit: PropTypes.func,
  name: PropTypes.string,
  object: PropTypes.object,
  subForm: PropTypes.bool
};

Form.defaultProps = {
  onSubmit: null,
  name: null,
  object: null,
  subForm: false
};

// operates on DOM elements
Form.reduceForms = function(el, acc = {}) {
  Array.from(el.children).forEach(child => {
    if (child.data-is-form)     child.data-is-subform ? acc[child.name] = Form.reduceForms(child) : Form.reduceForms(child, acc);
    if (child.type === "input") acc[child.name] = child.value;
    else                        Form.reduceForms(child, acc);
  });
  return acc;
};

// operates on ReactDOM elements
Form.setObject = function(obj, form) {
  console.log("OBJECT", obj);
  if (obj) {
    return React.cloneElement(form, form.props, form.props.children.map(c => {
      console.log(c);
      if (c.props.dataIsForm && c.props.dataIsSubform) {
        console.log("SubForm");
        return Form.setObject(obj[c.props.name], c);
      }
  
      console.log("BETWEEN");
  
      if (!c.props.dataIsForm && c.props.name) {
        console.log("Element");
        return React.cloneElement(c, {value: obj[c.props.name]}, c.props.children);
      }
      return c;
    }));
  }
  return form;
}

export { Form, Element };
export default {
  Form: Form,
  Element: Element
}
