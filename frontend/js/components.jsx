import { h } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';

import Forms from './components/forms';
import Routing from './components/routing';
import Resource from './components/resource';
import SignatureField from './components/signaturefield';
import SearchField from './components/searchfield';
import Higher from './components/higher';

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

export { Forms, Higher, Resource, SearchField, SignatureField, Money };

export default {
  Forms: Forms,
  Routing: Routing,
  Higher: Higher,
  Resource: Resource,
  SignatureField: SignatureField,
  SearchField: SearchField,
  Money: Money
};
