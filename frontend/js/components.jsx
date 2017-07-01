import React from 'react';
import PropTypes from 'prop-types';

import SignatureField from './components/signaturefield';
import TextField from './components/textfield';
import Higher from './components/higher';

function redirectWith(path, p=null) {
  if (p) return withPromise(p, (props) => props.history.replace(path + props.object.id));
  else return (props) => props.history.replace(path + res.id);
}

function rewrite(compName, value) {
  if (value instanceof Promise) return withPromise(value, (props) => return rewrite(compName, props.object)(props));
  return (props) => props.history.replace(props.location.pathname.replace("/" + compName, "/" + value));
}

function money(value, currency) {
  function toSymbol(curr) {
    if (curr == 'USD') return '$';
    if (curr == 'EUR') return '€';
    if (curr == 'JPY') return '¥';
    if (curr == 'GBP') return '£';
    if (curr == 'CAD') return '$';
    if (curr == 'AUD') return '$';
    if (curr == 'HKD') return '$';
    return null;
  }

  return (props) => <span>{toSymbol(currency.toUpperCase()) || curr} {value}</span>;
}

const Components = {
  APIComponent: APIComponent,
  TextField: TextField,
  SignatureField: SignatureField,

  Higher: Higher,

  redirectWith: redirectWith,
  rewrite: rewrite,
  apiView: apiView,
  form: form,
  apiForm: apiForm,

  money: money
};

export default Components;