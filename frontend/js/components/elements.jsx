import { h, render, cloneElement } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
import { inheritClass, cssSubclass, makeClassName } from './utilities';

const Image = inheritClass('img', "pure-image");
const Grid = inheritClass('div', 'pure-g');
const GridUnit = cssSubclass('div', {}, 'pure-u', true);
const MenuHeading = inheritClass('div', 'pure-menu-heading');
const MenuLink = inheritClass('a', 'pure-menu-link');
const MenuList = inheritClass('ul', 'pure-menu-list');
const ButtonGroup = inheritClass('div', 'pure-button-group');
const Loading = inheritClass('div', 'loading');
const DeleteButton = inheritClass('a', 'form-delete-button fa fa-times');
const Error = inheritClass('div', "error");

const Button = cssSubclass(props => props.href ? 'a' : 'button', {
  primary: 'pure-button-primary',
  active: 'pure-button-active'
}, 'pure-button');

const Table = cssSubclass('table', {
  bordered: 'pure-table-bordered',
  horizontal: 'pure-table-horizontal',
  striped: 'pure-table-striped'
}, 'pure-table');

const Menu = cssSubclass('div', {
  horizontal: 'pure-menu-horizontal',
  scrollable: 'pure-menu-scrollable',
  fixed: 'pure-menu-fixed'
}, 'pure-menu');

const MenuItem = cssSubclass('li', {
  disabled: 'pure-menu-disabled',
  selected: 'pure-menu-selected'
}, 'pure-menu-item');

const SideMargins = ({ children, ...props }) =>
  <Grid>
    <GridUnit size="1" sm="4-24" />
    <GridUnit {...props} size="1" sm="16-24">
      {children}
    </GridUnit>
    <GridUnit size="1" sm="4-24" />
  </Grid>;

const Labelled = ({ label, children, ...props }) => {
  props.className = makeClassName(props.className, "labelled");
  return (
    <Grid {...props}>
      <GridUnit size="1" sm="1-4">
        <label>{label || " "}</label>
      </GridUnit>
      <GridUnit size="1" sm="3-4">
        {children}
      </GridUnit>
    </Grid>
  );
};

Labelled.propTypes = {
  label: PropTypes.string.isRequired
};
Labelled.defaultProps = {};

export { Image, Grid, GridUnit, Button, ButtonGroup, Table, Menu, MenuHeading, MenuLink, MenuList, MenuItem, Loading, Error, Labelled, DeleteButton, SideMargins };

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
  Loading: Loading,
  Error: Error,
  Labelled: Labelled,
  DeleteButton: DeleteButton,
  SideMargins: SideMargins
};
