import React from 'react';
import PropTypes from 'prop-types';

import SignatureField from './components/signaturefield';
import SearchField from './components/searchfield';
import Higher from './components/higher';
import Form from './components/form';

function _toCurrencySymbol(curr) {
  if (curr === 'USD') return '$';
  if (curr === 'EUR') return '€';
  if (curr === 'JPY') return '¥';
  if (curr === 'GBP') return '£';
  // TODO: more
  return null;
}

const Money = props => <span>{_toCurrencySymbol(props.currency.toUpperCase()) || props.currency} {props.value}</span>;

Money.propTypes = {
  currency: PropTypes.string,
  value: PropTypes.number
};

Money.defaultProps = {
  currency: "USD",
  value: 0.00
}

export { Higher, Form, SearchField, SignatureField, Money };

export default {
  Higher: Higher, // Contains higher-level components
  Form: Form, // Form creation

  SignatureField: SignatureField,
  SearchField: SearchField,
  Money: Money
};
