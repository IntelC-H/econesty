import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { cssSubclass } from './utilities';

const Table = cssSubclass('table', {
  selectable: 'table-selectable',
  striped: 'table-striped'
});

export { Table };

export default {
  Table: Table
};
