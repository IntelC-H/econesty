import React from 'react';
import PropTypes from 'prop-types';

import SignatureField from './components/signaturefield';
import TextField from './components/textfield';
import Higher from './components/higher';
import API from './components/api';

export function redirect(path) {
  return (props) => {
    props.history.replace(path);
    return null; // Appease react
  }
}

export function redirectWith(path, p=null) {
  if (p) return Higher.withPromise(p, (props) => props.history.replace(path + props.object.id));
  else return redirect(path); //(props) => props.history.replace(path);
}

export function rewritePath(compName, value) {
  if (value instanceof Promise) {
    return Higher.withPromise(value, (props) => React.createElement(rewritePath(compName, props.object), props, null));
  }
  return (props) => {
    props.history.replace(props.location.pathname.replace("/" + compName, "/" + value));
    return null; // appease React
  };
}

export function money(value, currency) {
  function toSymbol(curr) {
    if (curr === 'USD') return '$';
    if (curr === 'EUR') return '€';
    if (curr === 'JPY') return '¥';
    if (curr === 'GBP') return '£';
    if (curr === 'CAD') return '$';
    if (curr === 'AUD') return '$';
    if (curr === 'HKD') return '$';
    return null;
  }

  return (props) => <span>{toSymbol(currency.toUpperCase()) || curr} {value}</span>;
}

export { Higher, API, TextField, SignatureField }

export default {
  Higher: Higher,
  API: API,

  TextField: TextField,
  SignatureField: SignatureField,
  
  redirectWith: redirectWith,
  rewritePath: rewritePath,
  money: money
};