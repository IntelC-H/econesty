import { h } from 'preact';
import PropTypes from 'prop-types';

function guid() {
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return s4() + [s4(), s4(), s4(), s4(), s4()].join('-') + s4() + s4();
}

function makeClassName() {
  var parts = [];
  for (var i = 0; i < arguments.length; i++) {
    parts = parts.concat((arguments[i] || '').split(' '));
  }
  return parts.filter(e => e.length > 0).join(' ');
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

// TODO: implement sizing via: .pure-input-*

const Element = props => {
  const {hidden, text, checkbox, password, wrapperClass, label, type, email, url, select, message, ...filteredProps} = props;
  return (
    <div className={makeClassName(wrapperClass, "pure-control-group")}>
      {label !== null && <label>{label}</label>}
      {select !== null && <select name={props.name}>
        {select.map(s => <option key={props.name + '-' + s} value={s}>{s}</option>)}
      }
      </select>}
      {checkbox && <label className="pure-checkbox" {...filteredProps}>
        <input type="checkbox" value={null} /> {label}
      </label>}
      {!checkbox && !select && <input type={hidden ? "hidden" : text ? "text" : password ? "password" : email ? "email" : url ? "url" : type} {...filteredProps} />}
      {(message !== null || props.required) && <span className="pure-form-message-inline">{message || "This field is required."}</span>}
    </div>
  );
};

Element.propTypes = {
  message: PropTypes.string,
  required: PropTypes.bool,
  hidden: PropTypes.bool,
  text: PropTypes.bool,
  checkbox: PropTypes.bool,
  password: PropTypes.bool,
  email: PropTypes.bool,
  url: PropTypes.bool,
  select: PropTypes.arrayOf(PropTypes.any),
  type: PropTypes.oneOf(["hidden", "text", "checkbox", "password", "hidden"]),
  name: PropTypes.string.isRequired,
  value: PropTypes.any,
  defaultValue: PropTypes.any,
  label: PropTypes.string,
  wrapperClass: PropTypes.string
};

Element.defaultProps = {
  message: null,
  required: false,
  hidden: false,
  text: false,
  checkbox: false,
  password: false,
  email: false,
  url: false,
  select: null,
  type: "hidden",
  value: undefined,
  label: null,
  wrapperClass: ""
};

function findForm(btn) {
  var btnp = btn;
  while (btnp) {
    if (btnp.dataset.isForm) break;
    btnp = btnp.parentElement;
  }
  return btnp;
}

function isCaveatChecked(btn) {
  if (btn && btn.parentElement) {
    const checkbox = btn.parentElement.querySelector('input[type="checkbox"].form-caveat');
    if (checkbox && checkbox.checked) return true;
  }
  return false
}

const SubmitButton = props => {
  const clickHandler = e => {
    e.preventDefault()
    if (props.caveat && !isCaveatChecked(e.target)) return;
    props.onSubmit(Form.toObject(findForm(e.target)));
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

SubmitButton.propTypes = {
  onSubmit: PropTypes.func,
  caveat: PropTypes.string
};

SubmitButton.defaultProps = {
  onSubmit: () => undefined,
  caveat: null
};

const Form = props => {
  const {aligned, stacked, className, subForm, object, children, ...filteredProps} = props;
  var cns = ["pure-form"];
  if (aligned) cns.push("pure-form-aligned");
  if (stacked) cns.push("pure-form-stacked");
  if (className) cns.push(className);
  return Form.setObject(object,
    <div
      {...filteredProps}
      data-is-form
      data-is-subform={subForm}
      className={cns.join(' ')}
    >
      <fieldset>
        {children}
      </fieldset>
    </div>
  );
};

Form.propTypes = {
  name: PropTypes.string,
  object: PropTypes.object,
  subForm: PropTypes.bool,
  aligned: PropTypes.bool,
  stacked: PropTypes.bool
};

Form.defaultProps = {
  name: null,
  object: null,
  subForm: false,
  aligned: false,
  stacked: false
};

// operates on DOM elements
Form.toObject = function(el, acc = {}) {
  if (!el) return acc;
  Array.from(el.children).forEach(child => {
    const tname = child.tagName.toLowerCase();
    if (child.dataset.isSubform) acc[child.name] = Form.toObject(child);
    else if (tname === "input")  acc[child.name] = child.type === "checkbox" ? child.checked || false : child.value;
    else if (tname === "select") acc[child.name] = child.children[child.selectedIndex].value;
    else                         acc             = Form.toObject(child, acc);
  });
  return acc;
};

// operates on Preact VDOM elements
Form.setObject = function(form_object, form) {
  function f(c, obj) {
    if (obj) {
      const isForm = (c.attributes || {})["data-is-form"] || false;
      const isSubform = (c.attributes || {})["data-is-subform"] || false;
      const name = (c.attributes || {}).name;

      // FIXME: this can't set select objects
      if (!isForm && !isSubform && name)    c.attributes.value = obj[name];
      else if (isForm && isSubform && name) f(c, obj[name]);
      else if (c.children)                  c.children.map(x => f(x, obj));
    }
  }

  f(form, form_object);
  return form;
}

export { guid, Image, Grid, GridUnit, Button, ButtonGroup, Table, Menu, MenuHeading, MenuLink, MenuList, MenuItem, Element, SubmitButton, Form };
export default {
  guid: guid,
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
  Element: Element,
  SubmitButton: SubmitButton,
  Form: Form
};
