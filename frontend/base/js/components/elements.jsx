import { h, render, cloneElement } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
import { inheritClass, cssSubclass, makeClassName } from './utilities';
import Flex from './flex';
import Responsive from './responsive';

const Error = inheritClass("div", "error");
const XOverflowable = inheritClass("div", "xoverflowable");

const BTC = inheritClass("span", "fab fa-btc");
const RedX = ({ component }) => h(component || 'span', { style: {color: "red"}, className:"fas fa-times icon" });
const GreenCheck = ({ component }) => h(component || 'span', { style: {color: "green"}, className:"fas fa-check icon" });
const Warning = ({ component }) => h(component || 'span', { style: {color: "orange"}, className:"fas fa-exclamation-triangle icon" });
const DeleteButton = inheritClass("a", "fa fa-times delete-button");
const SearchIcon = inheritClass("span", "fa fa-search search-icon");
const Frown = inheritClass(cssSubclass("span", {
  large: 'frown-icon-large',
  medium: 'frown-icon-medium'
}), "far fa-frown frown-icon");

const Button = inheritClass(cssSubclass(props => props.href ? 'a' : 'button', {
  primary: 'button-primary'
}), 'button');

const Table = cssSubclass('table', {
  selectable: 'table-selectable',
  striped: 'table-striped'
});

const SideMargins = ({ children, ...props }) =>
  <Responsive>
    { rprops => {
      if (!rprops.sm) return <div {...props}>{children}</div>;
      return (
        <Flex container justifyContent="center">
          <Flex basis={`${100 * (2/3)}%`} {...props}>
            {children}
          </Flex>
        </Flex>
      );
    }}
  </Responsive>;

export { BTC, RedX, GreenCheck, Warning, Button, Table, Error, DeleteButton, SearchIcon, SideMargins, XOverflowable, Frown };

export default {
  BTC: BTC,
  RedX: RedX,
  GreenCheck: GreenCheck,
  Warning: Warning,
  Button: Button,
  Table: Table,
  Error: Error,
  DeleteButton: DeleteButton,
  SearchIcon: SearchIcon,
  SideMargins: SideMargins,
  XOverflowable: XOverflowable,
  Frown: Frown
};
