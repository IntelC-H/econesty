import React from 'react';
import PropTypes from 'prop-types';

// TODO: move Form over to here.

function guid() {
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return s4() + [s4(), s4(), s4(), s4(), s4()].join('-') + s4() + s4();
}

function inheritClass(comp, cname) {
  return props => {
    var className = props.className ? props.className + ' ' + cname : cname;
    var propsp = Object.assign({}, props, { className: className });
    return React.createElement(comp, propsp, props.children);
  }
}

function sizeProp(props, propName, componentName) {
  if (!/\A\d(?:-\d)?\Z/.test(props[propName])) {
    return new Error(
      'Invalid size prop `' + propName + '` supplied to' + ' `' + componentName + '`.'
    );
  }
  return undefined;
}

const Image = inheritClass('img', "pure-image");
const Grid = inheritClass('div', 'pure-g');

const GridUnit = props => {
  const sizes = ["sm", "md", "lg", "xl"];
  var classNames = ['pure-u-' + props.size].concat(
    sizes.filter(k => k in props)
         .map(k => 'pure-u-' + k + '-' + props[k])
  );
  const {sm, md, lg, xl, size, children, ...filteredProps} = props;
  return React.createElement(inheritClass('div', classNames.join(' ')), filteredProps, children);
};

GridUnit.PropTypes = {
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
  let {primary, children, ...filteredProps} = props;
  var className = 'pure-button';
  if (primary) className += " pure-button-primary";
  return React.createElement(inheritClass(props.href ? 'a' : 'button', className), filteredProps, children);
};

function applyStriping(children) {
  var io = true;
  return React.Children.map(children, function(child) {
    var {...newProps} = child.props;
    if (child.type === "tbody") {
      newProps.children = applyStriping(newProps.children);
    } else if (child.type === "tr") {
      newProps.className = newProps.className ? (newProps.className + (io ? ' pure-table-odd' : '')) : (io ? 'pure-table-odd' : undefined);
      io = !io;
    }
    return React.cloneElement(child, newProps, newProps.children);
  });
}

const Table = props => {
  const {bordered, horizontal, striped, children, ...filteredProps} = props;

  var classes = ['pure-table'];
  if (bordered) classes.push('pure-table-bordered');
  if (horizontal) classes.push('pure-table-horizontal');
  if (striped) classes.push('pure-table-striped');

  return React.createElement(inheritClass('table', classes.join(' ')), filteredProps, striped ? applyStriping(children) : children);
};

const Menu = props => {
  const {horizontal, scrollable, fixed, children, ...filteredProps} = props;
  var className = 'pure-menu';
  if (horizontal) className += ' pure-menu-horizontal';
  if (scrollable) className += ' pure-menu-scrollable';
  if (fixed)      className += ' pure-menu-fixed';
  return React.createElement(inheritClass('div', className), filteredProps, children);
};

const MenuHeading = inheritClass('span', 'pure-menu-heading');
const MenuLink = inheritClass('a', 'pure-menu-link');
const MenuList = inheritClass('ul', 'pure-menu-list');

const MenuItem = props => {
  var className = 'pure-menu-item';
  if (props.disabled) className += ' pure-menu-disabled';
  if (props.selected) className += ' pure-menu-selected';
  return React.createElement(inheritClass('li', className), props, props.children);
};

// Forms can take props.object as form value defaults.

// TODO: GUID values appear if default is selected.
const Element = props => {
  if (props.select) {
    var defaultValue = guid();
    return (
      <div className={props.wrapperClass}>
        <select name={props.name} defaultValue={props.value || defaultValue}>
          {props.label !== null && <option disabled hidden value={defaultValue}>{props.label}</option>}
          {props.select.map(s => <option key={guid()} value={s}>{s}</option>)}
        </select>
      </div>
    )
  }
  var typ = props.hidden ? "hidden" : props.text ? "text" : props.checkbox ? "checkbox" : props.password ? "password" : props.type;
  let {hidden, text, checkbox, password, wrapperClass, label, type, email, url, select, ...filteredProps} = props; // eslint-disable-line
  return (
    <div className={props.wrapperClass}>
      <input type={typ} {...filteredProps} />
      {props.label !== null && <label>{props.label}</label>}
      {props.message !== null && <span className="pure-form-message">{props.message}</span>}
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
  select: PropTypes.arrayOf(PropTypes.any),
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
  select: null,
  type: "hidden",
  value: undefined,
  label: null,
  wrapperClass: ""
};

function findForm(btn) {
  var btnp = btn;
  while (btnp) {
    if (btnp.dataset.isForm) {
      break;
    }
    btnp = btnp.parentElement;
  }
  return btnp;
}

const SubmitButton = props => {
  return <Button primary onClick={e => props.onSubmit(Form.reduceForms(findForm(e.target)))}>{props.children}</Button>;
};

SubmitButton.propTypes = {
  onSubmit: PropTypes.func
};

SubmitButton.defaultProps = {
  onSubmit: () => undefined
};

const Form = props => {
  var cns = ["pure-form"];
  if (props.aligned) cns.push("pure-form-aligned");
  if (props.stacked) cns.push("pure-form-stacked");
  return Form.setObject(props.object, (
    <div data-is-form data-is-subform={props.subForm} name={props.name} className={cns.join(' ')}>
      <fieldset>
        {props.children}
      </fieldset>
    </div>
  ));
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
Form.reduceForms = function(el, acc = {}) {
  if (!el) return acc;
  Array.from(el.children).forEach(child => {
    const tname = child.tagName.toLowerCase();
    if (child.dataIsForm)   child.dataIsSubform ? acc[child.name] = Form.reduceForms(child) : Form.reduceForms(child, acc);
    if (tname === "input")  acc[child.name] = child.value;
    if (tname === "select") acc[child.name] = child.children[child.selectedIndex].value;
    else                    Form.reduceForms(child, acc);
  });
  return acc;
};

// operates on ReactDOM elements
Form.setObject = function(obj, form) {
  if (obj) {
    return React.cloneElement(form, form.props, React.Children.map(form.props.children, c => {
      if (c.props.dataIsForm && c.props.dataIsSubform) {
        return Form.setObject(obj[c.props.name], c);
      }

      if (!c.props.dataIsForm && c.props.name) {
        return React.cloneElement(c, {defaultValue: obj[c.props.name], key: guid()}, c.props.children);
      }
      return c;
    }));
  }
  return form;
}

export { guid, Image, Grid, GridUnit, Button, Table, Menu, MenuHeading, MenuLink, MenuList, MenuItem, Element, SubmitButton, Form };
export default {
  guid: guid,
  Image: Image,
  Grid: Grid,
  GridUnit: GridUnit,
  Button: Button,
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
