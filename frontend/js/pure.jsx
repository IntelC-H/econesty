import { h, render, cloneElement } from 'preact';
import PropTypes from 'prop-types';

function makeClassName() {
  return [].concat.apply([], Array.from(arguments).filter(a => !!a)
                                                  .map(a => a.split(' '))).filter(e => e.length > 0).join(' ');
}

function inheritClass(comp, cname) {
  return props => h(comp, Object.assign({}, props, { className: makeClassName(props.className, cname) }));
}

function sizeProp(props, propName, componentName) {
  if (!props[propName]) return undefined;
  if (!/^(\d+)(?:-(\d+))?$/.test(props[propName])) {
    return new Error('Invalid sizeProp `' + propName + '` supplied to' + ' `' + componentName + '`.');
  }
  return undefined;
}

const Image = inheritClass('img', "pure-image");
const Grid = inheritClass('div', 'pure-g');
const MenuHeading = inheritClass('span', 'pure-menu-heading');
const MenuLink = inheritClass('a', 'pure-menu-link');
const MenuList = inheritClass('ul', 'pure-menu-list');
const ButtonGroup = inheritClass('div', 'pure-button-group');

const _sizes = ["sm", "md", "lg", "xl"];
const GridUnit = props => {
  var classNames = ['pure-u-' + props.size].concat(
    _sizes.filter(k => k in props)
          .map(k => 'pure-u-' + k + '-' + props[k])
  );
  const {sm, md, lg, xl, size, ...filteredProps} = props; // eslint-disable-line
  return h(inheritClass('div', classNames.join(' ')), filteredProps);
};

GridUnit.propTypes = {
  sm: sizeProp,
  md: sizeProp,
  lg: sizeProp,
  xl: sizeProp,
  size: sizeProp
};

GridUnit.defaultProps = {
  size: '1'
};


const Button = props => {
  const {primary, active, ...filteredProps} = props;
  var className = 'pure-button';
  if (primary) className += " pure-button-primary";
  if (active) className += " pure-button-active";
  return h(inheritClass(props.href ? 'a' : 'button', className), filteredProps);
};

Button.propTypes = {
  primary: PropTypes.bool,
  active: PropTypes.bool
};

Button.defaultProps = {
  primary: false,
  active: false
};


const Table = props => {
  const {bordered, horizontal, striped, ...filteredProps} = props;

  var classes = ['table-fill', 'pure-table'];
  if (bordered) classes.push('pure-table-bordered');
  if (horizontal) classes.push('pure-table-horizontal');
  if (striped) classes.push('pure-table-striped');

  return h(inheritClass('table', classes.join(' ')), filteredProps);
};

Table.propTypes = {
  bordered: PropTypes.bool,
  horizontal: PropTypes.bool,
  striped: PropTypes.bool
};

Table.defaultProps = {
  bordered: false,
  horizontal: false,
  striped: false
};


const Menu = props => {
  const {horizontal, scrollable, fixed, ...filteredProps} = props;
  var className = 'pure-menu';
  if (horizontal) className += ' pure-menu-horizontal';
  if (scrollable) className += ' pure-menu-scrollable';
  if (fixed)      className += ' pure-menu-fixed';
  return h(inheritClass('div', className), filteredProps);
};

Menu.propTypes = {
  horizontal: PropTypes.bool,
  scrollable: PropTypes.bool,
  fixed: PropTypes.bool
};

Menu.defaultProps = {
  horizontal: false,
  scrollable: false,
  fixed: false
};


const MenuItem = props => {
  var className = 'pure-menu-item';
  if (props.disabled) className += ' pure-menu-disabled';
  if (props.selected) className += ' pure-menu-selected';
  return h(inheritClass('li', className), props);
};

MenuItem.propTypes = {
  disabled: PropTypes.bool,
  selected: PropTypes.bool
};

MenuItem.defaultProps = {
  disabled: false,
  selected: false
}


const Input = props => {
  const {hidden, text, checkbox, password,
         className, type, email, url,
         size, value, onSet, ignore,
         sm, md, lg, xl, // eslint-disable-line no-unused-vars
         children, onInput, // eslint-disable-line no-unused-vars
         ...filteredProps} = props;

  const typeString = checkbox ? "checkbox" : hidden ? "hidden" : text ? "text" : password ? "password" : email ? "email" : url ? "url" : type;

  let classes = [];
  if (className) classes.push(className);
  if (size) classes.push("pure-input-" + size)
  _sizes.forEach(sz => {
    if (sz in props) {
      classes.push('pure-input-' + sz + '-' + props[sz])
    }
  });

  let addlProps = {
    type: typeString
  };

  if (ignore) {
    addlProps["data-ignore"] = ignore;
  }

  if (classes.length > 0) {
    addlProps.className = makeClassName.apply(classes);
  }

  if (value) {
    const isHidden = typeString === "hidden";
    addlProps.value = isHidden ? JSON.stringify(value) : value;
  }

  if (onSet) {
    addlProps.onInput = e => {
      let val = e.target.value;
      const isHidden = e.target.type === "hidden";
      onSet(val ? (isHidden ? JSON.parse(val) : val) : null);
    }
  }

  return h('input', Object.assign({}, filteredProps, addlProps));
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
  const { name, options, value } = props;
  return (
    <select name={name}>
      {options.map(s => <option selected={s === value} key={name + '-' + s} value={s}>{s}</option>)}
    </select>
  );
}

Select.propTypes = {
  name: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.any),
  value: PropTypes.any
};

Select.defaultProps = {
  options: []
};

const ControlGroup = props => {
  const { message, label, className, children } = props;

  return (
    <div className={makeClassName(className, "pure-control-group")}>
      <label>{label || " "}</label>
      {children}
      {message !== null && <span className="pure-form-message-inline">{message}</span>}
    </div>
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
  if (!el) return acc;
  Array.from(el.children).forEach(child => {
    const ignore = child.dataset.ignore === "true";
    const name = child.getAttribute("name") || false;
    const isForm = child.dataset.form === "true";
    const isHidden = child.type === "hidden";
    const isCheckbox = child.type === "checkbox";

    if (name && !ignore) {
      const isGroup = child.dataset.group === "true";
      const tname = child.tagName.toLowerCase();

      if (isForm && name) {
        if (isGroup) acc[name] = Array.from(child.children)
                                      .filter(e => e.className.toLowerCase() === "form-group")
                                      .map(e => Form.toObject(e));
        else acc[name] = Form.toObject(child);
      }
      else if (tname === "input")  acc[name] = isCheckbox ? child.checked || false : (isHidden ? (child.value && child.value.length > 0 ? JSON.parse(child.value) : child.value) : child.value);
      else if (tname === "select") acc[name] = (child.children[child.selectedIndex] || {}).value;
      else                         acc       = Form.toObject(child, acc);
    } else acc = Form.toObject(child, acc);
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

      while (c.firstChild && ary.length > 0) {
        if (c.firstChild instanceof HTMLElement && c.firstChild.className === "form-group") {
          Form.setObject(ary.shift(), c.firstChild);
        } else c.removeChild(c.firstChild);
      }

      ary.forEach(elem => {
        let template = c._groupTemplate.map(cld => cloneElement(cld));
        let fieldset = render(h('fieldset', {}, template));

        let div = document.createElement('div');
        div.className = "form-group";
        div.appendChild(fieldset);
        c.appendChild(div);
        Form.setObject(elem, fieldset);
      });
    } else if (tname === "input") Input.setValue(c, val, obj);
    else if (tname === "select") Select.setValue(c, val);
    else if (c.children && c.children.length > 0) {
      Array.from(c.children).forEach(x => Form.setObject(name ? val : obj, x));
    }
  }
};

Input.setValue = (c, val, obj) => {
  if (!(c.dataset.ignore === "true")) {
    const isHidden = c.type === "hidden";
    if (c.type === "checkbox") {
      c.checked = val === true;
      c.dispatchEvent(new InputEvent("input", { target: c }));
    } else {
      if (val) c.value = isHidden ? JSON.stringify(val) : val;
      else c.value = null;
      c.dispatchEvent(new InputEvent("input", { target: c }));
    }
  }
};

Select.setValue = (c, val) => {
  c.value = val;
};

export { makeClassName, Image, Grid, GridUnit, Button, ButtonGroup, Table, Menu, MenuHeading, MenuLink, MenuList, MenuItem, Select, Input, ControlGroup, SubmitButton, Form };
export default {
  makeClassName: makeClassName,
  Image: Image,
  Grid: Grid,
  GridUnit: GridUnit,
  Button: Button,
  ButtonGroup: ButtonGroup,
  Table: Table,
  Menu: Menu,
  MenuHeading: MenuHeading,
  MenuLink: MenuLink,
  MenuList: MenuList,
  MenuItem: MenuItem,
  Select: Select,
  Input: Input,
  ControlGroup: ControlGroup,
  SubmitButton: SubmitButton,
  Form: Form
};
