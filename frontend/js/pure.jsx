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

// makes a component that assigns props to additional classes
const cssSubclass = (BaseComponent, mapping, baseClasses = []) => {
  const f = props => {
    var propsCopy = Object.assign({}, props);
    var classes = baseClasses.splice();

    for (var k in mapping) {
      if (mapping.hasOwnProperty(k) && propsCopy.hasOwnProperty(k)) {
        var v = propsCopy[k];
        delete propsCopy[k];
        if (!!v || v === "true") {
          classes.push(mapping[k]);
        }
      }
    }

    const Comp = BaseComponent instanceof Function ? BaseComponent(propsCopy) : BaseComponent;
    return h(inheritClass(Comp, classes.join(' ')), propsCopy);
  };

  f.propTypes = {};
  f.defaultProps = {};

  for (var k in mapping) {
    f.propTypes[k] = PropTypes.bool;
    f.defaultProps[k] = false;
  }

  return f;
}

const Image = inheritClass('img', "pure-image");
const Grid = inheritClass('div', 'pure-g');
const MenuHeading = inheritClass('span', 'pure-menu-heading');
const MenuLink = inheritClass('a', 'pure-menu-link');
const MenuList = inheritClass('ul', 'pure-menu-list');
const ButtonGroup = inheritClass('div', 'pure-button-group');

const Button = cssSubclass(props => props.href ? 'a' : 'button', {
  primary: 'pure-button-primary',
  active: 'pure-button-active'
}, ['pure-button']);

const Table = cssSubclass('table', {
  bordered: 'pure-table-bordered',
  horizontal: 'pure-table-horizontal',
  striped: 'pure-table-striped'
}, ['table-fill', 'pure-table']);

const Menu = cssSubclass('div', {
  horizontal: 'pure-menu-horizontal',
  scrollable: 'pure-menu-scrollable',
  fixed: 'pure-menu-fixed'
}, ['pure-menu']);

const MenuItem = cssSubclass('li', {
  disabled: 'pure-menu-disabled',
  selected: 'pure-menu-selected'
}, ['pure-menu-item']);

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

export { makeClassName, Image, Grid, GridUnit, Button, ButtonGroup, Table, Menu, MenuHeading, MenuLink, MenuList, MenuItem };
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
  MenuItem: MenuItem
};
