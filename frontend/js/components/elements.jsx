import { h, render, cloneElement } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
import { inheritClass, cssSubclass, makeClassName } from './utilities';

const Image = inheritClass('img', "pure-image");
const Grid = inheritClass('div', 'pure-g');
const GridUnit = cssSubclass('div', {}, 'pure-u', true);

const Loading = inheritClass('div', 'loading');
const Error = inheritClass('div', "error");

const DeleteButton = inheritClass('a', 'delete-button fa fa-times');
const SearchIcon = inheritClass('span', "search-icon fa fa-search");

const Button = cssSubclass(props => props.href ? 'a' : 'button', {
  primary: 'pure-button-primary',
  active: 'pure-button-active'
}, 'button');

const Table = cssSubclass('table', {
  selectable: 'table-selectable',
  striped: 'table-striped'
}, null);

const SideMargins = ({ children, ...props }) =>
  <Grid>
    <GridUnit size="1" sm="4-24" />
    <GridUnit {...props} size="1" sm="16-24">
      {children}
    </GridUnit>
    <GridUnit size="1" sm="4-24" />
  </Grid>;

const Labelled = ({ label, children, ...props }) => {
  props.className = makeClassName("labelled", props.className);
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

export { Image, Grid, GridUnit, Button, Table, Loading, Error, Labelled, DeleteButton, SearchIcon, SideMargins };

export default {
  Image: Image,
  Grid: Grid,
  GridUnit: GridUnit,
  Button: Button,
  Table: Table,
  Loading: Loading,
  Error: Error,
  Labelled: Labelled,
  DeleteButton: DeleteButton,
  SearchIcon: SearchIcon,
  SideMargins: SideMargins
};
