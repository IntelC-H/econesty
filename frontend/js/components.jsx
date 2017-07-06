import React from 'react';
import PropTypes from 'prop-types';
import { Redirect, withRouter } from 'react-router';

import SignatureField from './components/signaturefield';
import TextField from './components/textfield';
import Higher from './components/higher';
import API from './components/api';
import Decorators from './components/decorators';

function rewritePath(regex, v) {
  var p = v instanceof Promise ? v : Promise.resolve(v);
  return withRouter(Higher.withPromise(p, props => <Redirect
                                                     push={false}
                                                     from={props.location.pathname}
                                                     to={props.location.pathname.replace(regex, props.object)}
                                                   />));
}

function money(value, currency) {
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

  return props => <span>{toSymbol(currency.toUpperCase()) || currency} {value}</span>;
}

export { Higher, API, TextField, SignatureField, rewritePath, money }

export default {
  Higher: Higher, // Contains higher-level components
  API: API, // Contains API-related higher-level components.
  Decorators: Decorators, // Contains decorators

  TextField: TextField,
  SignatureField: SignatureField,
  
  rewritePath: rewritePath,
  money: money
};
