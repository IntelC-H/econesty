import React from 'react';
import PropTypes from 'prop-types';
import Components from 'app/components';

const propTypes = {
  object: PropTypes.shape({
    id: PropTypes.number,
    offer_currency: PropTypes.string,
    offer: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]),
    buyer: PropTypes.shape({
      id: PropTypes.number
    }),
    seller: PropTypes.shape({
      id: PropTypes.number
    })
  })
};

const defaultProps = {};

const Transaction = props => {
  var obj = props.object;
  return (
    <div className="transaction">
      <div className="box">
        <Components.Money currency={obj.offer_currency} value={parseFloat(obj.offer)} />
      </div>
      <div className="box">
        <a href={"/user/" + obj.buyer.id}>View Buyer</a>
        <a href={"/user/" + obj.seller.id}>View Seller</a>
      </div>
      <div className="box">
        <a href={"/transaction/" + obj.id}>View</a>
      </div>
    </div>
  );
};

Transaction.propTypes = propTypes;
Transaction.defaultProps = defaultProps;

export default Transaction;
