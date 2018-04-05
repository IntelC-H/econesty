import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { inheritClass, cssSubclass } from './utilities';

const Error = inheritClass("div", "error");

const Table = cssSubclass('table', {
  selectable: 'table-selectable',
  striped: 'table-striped'
});

export { Table, Error };

export default {
  Table: Table,
  Error: Error
};
