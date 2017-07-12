import React from 'react';
import PropTypes from 'prop-types';

function inheritClass(comp, cname) {
  return props => {
    var propsp = Object.assign({}, props, { className: props.className + ' ' + cname });
    return React.createElement(comp, propsp, props.children);
  }
}

function sizeProp(props, propName, componentName) {
  if (!/\A\d(?:-\d)?\Z/.test(props[propName])) {
    return new Error(
      'Invalid size prop `' + propName + '` supplied to' + ' `' + componentName + '`.'
    );
  }
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
  var className = 'pure-button';
  if (props.primary) className += " pure-button-primary";
  return React.createElement(inheritClass(props.href ? 'a' : 'button', className), props, props.children);
};

function applyStriping(props, isOdd = true) {
  var io = isOdd;
  React.Children.forEach(this.props.children, function(child) {
   // if (child.props.)
    child.props.className = child.props.className + (io ? ' pure-table-odd' : '');
  });
  return io;
}

const Table = props => {
  // TODO: <tr class="pure-table-odd"> for browsers that don't support nth-child
  var className = 'pure-table';
  if (props.bordered) className += ' pure-table-bordered';
  if (props.horizontal) className += ' pure-table-horizontal';
  if (props.striped) className += ' pure-table-striped';

  var counter = 1;
  React.Children.forEach(props.children, function( child ) {
    child.props.className = 
    child.props.selected = child.props.value === e.target.value;

  });

  return React.createElement(inheritClass('table', className), props, props.children);
};

const OddRow = inheritClass('tr', 'pure-table-odd');

const Menu = props => {
  var className = 'pure-menu';
  if (props.horizontal) className += ' pure-menu-horizontal';
  if (props.scrollable) className += ' pure-menu-scrollable';
  return React.createElement(inheritClass('div', className), props, props.children);
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

export { Image, Grid, GridUnit, Button, Table, OddRow, Menu, MenuHeading, MenuLink, MenuList, MenuItem };
export default {
  Image: Image,
  Grid: Grid,
  GridUnit: GridUnit,
  Button: Button,
  Table: Table,
  OddRow: OddRow,
  Menu: Menu,
  MenuHeading: MenuHeading,
  MenuLink: MenuLink,
  MenuList: MenuList,
  MenuItem: MenuItem
};
