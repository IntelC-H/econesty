import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { inheritClass, cssSubclass, makeClassName } from './utilities';

const Error = inheritClass("div", "error");

const DeleteButton = inheritClass("a", "fa fa-times delete-button");

const Table = cssSubclass('table', {
  selectable: 'table-selectable',
  striped: 'table-striped'
});

export { Table, Error, DeleteButton };

export default {
  Table: Table,
  Error: Error,
  DeleteButton: DeleteButton
};
