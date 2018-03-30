import { h, render, cloneElement } from 'preact'; // eslint-disable-line no-unused-vars
import { inheritClass, cssSubclass } from './utilities';

const Error = inheritClass("div", "error");
//const XOverflowable = inheritClass("div", "xoverflowable");
const XOverflowable = 'div';

const DeleteButton = inheritClass("a", "fa fa-times delete-button");
const SearchIcon = inheritClass("span", "fa fa-search search-icon");
const Frown = inheritClass(cssSubclass("span", {
  large: 'frown-icon-large',
  medium: 'frown-icon-medium'
}), "far fa-frown frown-icon");

const Table = inheritClass(cssSubclass('table', {
  selectable: 'table-selectable',
  striped: 'table-striped'
}), 'xoverflowable');

export { Table, Error, DeleteButton, SearchIcon, XOverflowable, Frown };

export default {
  Table: Table,
  Error: Error,
  DeleteButton: DeleteButton,
  SearchIcon: SearchIcon,
  XOverflowable: XOverflowable,
  Frown: Frown
};
