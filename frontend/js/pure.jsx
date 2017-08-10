import { h, render } from 'preact';
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


const Element = props => {
  const {hidden, text, checkbox, password,
         wrapperClass, label, type, email,
         url, select, message, className,
         size, sm, md, lg, xl, ...filteredProps} = props; // eslint-disable-line
  const typeString = checkbox ? "checkbox" : hidden ? "hidden" : text ? "text" : password ? "password" : email ? "email" : url ? "url" : type;

  let control = null;
  if (!select) {
    let classes = [className];
    if (size) classes.push("pure-input-" + size)
    classes.concat(_sizes.filter(k => k in props)
                         .map(k => 'pure-input-' + k + '-' + props[k]));
    control = <input
                value={null}
                type={typeString}
                className={classes.join(' ')}
                {...filteredProps}
              />;
  } else {
    control = (
      <select name={props.name}>
        {select.map(s => <option key={props.name + '-' + s} value={s}>{s}</option>)}
      </select>
    );
  }

  return (
    <div className={makeClassName(wrapperClass, "pure-control-group")}>
      {label !== null && <label className={checkbox ? "pure-checkbox" : ""}>{label}</label>}
      {control}
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
  wrapperClass: PropTypes.string,
  size: sizeProp,
  sm: sizeProp,
  md: sizeProp,
  lg: sizeProp,
  xl: sizeProp,
  ignore: PropTypes.bool
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
  wrapperClass: "",
  size: null,
  ignore: false
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

SubmitButton.findForm = btn => {
  var btnp = btn;
  while (btnp) {
    if (btnp.attributes.form && !btnp.attributes.subform) break;
    btnp = btnp.parentElement;
  }
  return btnp;
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
          if (group) e._templateFieldset = render(h('fieldset', props, children));
          Form.setObject(object, e);
        }
      }}
      form={true}
      subform={subForm}
      group={group}
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
    const ignore = child.getAttribute("ignore") || false;
    const name = child.getAttribute("name") || false;//  (child.attributes.name || {}).value;
    const isForm = child.getAttribute("form") || false; // (child.attributes.form || {}).value || false;

    if (ignore) {
      acc = Form.toObject(child, acc);
    } else if (name) {
      const isGroup = child.getAttribute("group") || false;
      const isSubform = child.getAttribute("subform") || false;
      const tname = child.tagName.toLowerCase();
      
      if (isForm) {
        if (isGroup) acc[name] = Array.from(child.children)
                                      .filter(e => e.className.toLowerCase() === "form-group")
                                      .map(e => Form.toObject(e));
        else if (isSubform) acc[name] = Form.toObject(child);
      }
      else if (tname === "input")  acc[name] = child.type === "checkbox" ? child.checked || false : child.value;
      else if (tname === "select") acc[name] = child.children[child.selectedIndex].value;
      else                         acc       = Form.toObject(child, acc);
    } else acc = Form.toObject(child, acc);
  });
  return acc;
};

// operates on DOM elements
Form.setObject = (obj, c) => {
  if (obj && c) {
    const isForm = (c.attributes.form || {}).value;
    const isGroup = (c.attributes.group || {}).value;
    const isSubform = (c.attributes.subform || {}).value;
    const tname = c.tagName.toLowerCase();
    const name = (c.attributes.name || {}).value;

    const val = obj[name] || undefined;

    // FIXME: set value only if not set for text fields!
    if (!isForm && !isSubform && !isGroup && name) {
      if (tname === "input") {
        if (c.type === "checkbox")                          c.checked = val === true;
        else if (val && (!c.value || c.value.length === 0)) c.value = val;
      }
    } else if (isForm && isGroup) {
      if (val && val.length > 0) {
        let ary = val.slice();
  
        while (c.firstChild) {
          if (c.firstChild instanceof HTMLElement && c.firstChild.tagName.toLowerCase() === "fieldset") {
            Form.setObject(ary.shift(), c.firstChild);
          } else c.removeChild(c.firstChild);
        }
  
        ary.forEach(elem => {
          let n = c._templateFieldset.cloneNode(true);
          let div = document.createElement('div');
          div.className = "form-group";
          div.appendChild(n);
          c.appendChild(div);
          Form.setObject(elem, n);
        });
      }
    } else if (isForm && isSubform && !isGroup) Form.setObject(c, (!name) ? obj : val);
    else if (c.children) Array.from(c.children).forEach(x => Form.setObject(obj, x));
  }
};

export { Image, Grid, GridUnit, Button, ButtonGroup, Table, Menu, MenuHeading, MenuLink, MenuList, MenuItem, Element, SubmitButton, Form };
export default {
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
