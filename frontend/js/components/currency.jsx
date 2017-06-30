import React from 'react';
import PropTypes from 'prop-types';

export default class Currency extends React.Component {
  render() {
    var curr = this.props.currency.toUpperCase();
    var sym = this.currencyToSymbol(curr);
    if (sym == null) {
      return <span>{this.props.value} {curr}</span>;
    }
    return <span>{sym} {this.props.value}</span>;
  }

  currencyToSymbol(curr) {
    if (curr == 'USD') return '$';
    if (curr == 'EUR') return '€';
    if (curr == 'JPY') return '¥';
    if (curr == 'GBP') return '£';
    if (curr == 'CHF') return 'CHF';
    if (curr == 'CAD') return '$';
    if (curr == 'AUD') return '$';
    if (curr == 'HKD') return '$';
    return null;
  }
}

Currency.propTypes = {
  currency: PropTypes.string,
  value: PropTypes.number
};

Currency.defaultProps = {
  currency: "USD",
  value: 0
};