import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars

/*
// These are probably useful for implementing this page
import { API } from 'app/api';

import { Button, Grid, GridUnit, Image, Money, Table } from 'app/components/elements';
import { CollectionView, ElementView } from 'app/components/api';
import { Form, FormGroup, Input } from 'app/components/forms';
*/

function TransactionDetail(props) {
  let transactionId = props.matches.id;
  return "transaction " + transactionId;
}

export default TransactionDetail;
