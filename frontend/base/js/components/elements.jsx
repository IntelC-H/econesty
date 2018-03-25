import { h, render, cloneElement } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
import { inheritClass, cssSubclass, makeClassName } from './utilities';
import Flex from './flex';

const Error = inheritClass("div", "error");
const XOverflowable = inheritClass("div", "xoverflowable");

const BTC = inheritClass("span", "fab fa-btc");
const RedX = ({ component }) => h(component || 'span', { style: {color: "red"}, className:"fas fa-times icon" });
const GreenCheck = ({ component }) => h(component || 'span', { style: {color: "green"}, className:"fas fa-check icon" });
const Warning = ({ component }) => h(component || 'span', { style: {color: "orange"}, className:"fas fa-exclamation-triangle icon" });
const DeleteButton = inheritClass("a", "fa fa-times delete-button");
const SearchIcon = inheritClass("span", "fa fa-search search-icon");
const Frown = cssSubclass("span", {
  large: 'frown-icon-large',
  medium: 'frown-icon-medium'
}, "far fa-frown frown-icon");

const Button = cssSubclass(props => props.href ? 'a' : 'button', {
  primary: 'button-primary'
}, 'button');

const Table = cssSubclass('table', {
  selectable: 'table-selectable',
  striped: 'table-striped'
}, null);

const SideMargins = (props) =>
  <Flex container justifyContent="center">
    <Flex basis={`${100 * (2/3)}%`} {...props}/>
  </Flex>;

const Labelled = ({ label, children, ...props }) => {
  props.className = makeClassName("labelled", props.className);
  return (
    <Flex {...props} container wrap="wrap" alignItems="center">
      <Flex className="labelled-label-container" container justifyContent="flex-start" alignItems="center" basis="25%">
        <label>{label || " "}</label>
      </Flex>
      <Flex className="labelled-content" container justifyContent="flex-start" alignItems="center" basis="75%">
        {children}
      </Flex>
    </Flex>
  );
};

Labelled.propTypes = {
  label: PropTypes.string.isRequired
};
Labelled.defaultProps = {};

export { BTC, RedX, GreenCheck, Warning, Button, Table, Error, Labelled, DeleteButton, SearchIcon, SideMargins, XOverflowable, Frown };

export default {
  BTC: BTC,
  RedX: RedX,
  GreenCheck: GreenCheck,
  Warning: Warning,
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
