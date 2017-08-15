import { h, render, cloneElement } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
import { inheritClass, cssSubclass } from './utilities';

const Image = inheritClass('img', "pure-image");
const Grid = inheritClass('div', 'pure-g');
const MenuHeading = inheritClass('span', 'pure-menu-heading');
const MenuLink = inheritClass('a', 'pure-menu-link');
const MenuList = inheritClass('ul', 'pure-menu-list');
const ButtonGroup = inheritClass('div', 'pure-button-group');

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

const GridUnit = cssSubclass('div', {}, 'pure-u', true);

const Loading = inheritClass('div', 'loading');

const ErrorDisplay = props => <div className="error"><p>{props.message}</p></div>;

ErrorDisplay.propTypes = { message: PropTypes.string.isRequired };
ErrorDisplay.defaultProps = {};

const Resource = props => {
  if (props.showsLoading) return <Loading />;
  if (props.error) return <ErrorDisplay message={props.error.message} />;
  if (props.object) {
    const {
      showsLoading, error, // eslint-disable-line no-unused-vars
      component, ...filteredProps
    } = props;
    return h(component, filteredProps); // keep object in props
  }
  return null;
};

Resource.propTypes = {
  object: PropTypes.object,
  error: PropTypes.object,
  showsLoading: PropTypes.bool,
  component: PropTypes.any.isRequired // A (P)React `Component`
};

Resource.defaultProps = {
  object: null,
  error: null,
  showsLoading: true
};

export { Image, Grid, GridUnit, Button, ButtonGroup, Table, Menu, MenuHeading, MenuLink, MenuList, MenuItem, Loading, ErrorDisplay, Resource };

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
  ErrorDisplay: ErrorDisplay,
  Resource: Resource
};