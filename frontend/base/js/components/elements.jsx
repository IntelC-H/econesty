import { h, render, cloneElement } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
import { inheritClass, cssSubclass, makeClassName } from './utilities';

const Grid = inheritClass("div", "pure-g");
const GridUnit = cssSubclass("div", {}, "pure-u", true);

const Error = inheritClass("div", "error");
const XOverflowable = inheritClass("div", "xoverflowable");

const BTC = inheritClass("span", "fab fa-btc");
const RedX = () => <span style={{color: "red"}} className="fas fa-times" />;
const GreenCheck = () => <span style={{color: "green"}} className="fas fa-check" />;
const Warning = () => <span style={{color: "orange"}} className="fas fa-exclamation-triangle" />;
const DeleteButton = inheritClass("a", "fa fa-times delete-button");
const SearchIcon = inheritClass("span", "fa fa-search search-icon");
const Frown = cssSubclass("span", {
  large: 'frown-icon-large',
  medium: 'frown-icon-medium'
}, "far fa-frown frown-icon");

const Button = cssSubclass(props => props.href ? 'a' : 'button', {
  primary: 'pure-button-primary',
  active: 'pure-button-active'
}, 'button');

const Table = cssSubclass('table', {
  selectable: 'table-selectable',
  striped: 'table-striped'
}, null);

const SideMargins = (props) =>
  <Grid>
    <GridUnit size="1" sm="4-24" />
    <GridUnit {...props} size="1" sm="16-24" />
    <GridUnit size="1" sm="4-24" />
  </Grid>;

const Labelled = ({ label, children, ...props }) => {
  props.className = makeClassName("labelled", props.className);
  return (
    <Grid {...props}>
      <GridUnit className="labelled-label-container" size="1" sm="1-4">
        <label>{label || " "}</label>
      </GridUnit>
      <GridUnit className="labelled-content" size="1" sm="3-4">
        {children}
      </GridUnit>
    </Grid>
  );
};

Labelled.propTypes = {
  label: PropTypes.string.isRequired
};
Labelled.defaultProps = {};

export { BTC, RedX, GreenCheck, Warning, Grid, GridUnit, Button, Table, Error, Labelled, DeleteButton, SearchIcon, SideMargins, XOverflowable, Frown };

export default {
  BTC: BTC,
  RedX: RedX,
  GreenCheck: GreenCheck,
  Warning: Warning,
  Grid: Grid,
  GridUnit: GridUnit,
  Button: Button,
  Table: Table,
  Error: Error,
  Labelled: Labelled,
  DeleteButton: DeleteButton,
  SearchIcon: SearchIcon,
  SideMargins: SideMargins,
  XOverflowable: XOverflowable,
  Frown: Frown
};
