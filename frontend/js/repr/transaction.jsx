import React from 'react';
import TextField from 'app/components/textfield';
import Currency from 'app/components/currency';
import 'style/transaction';

export default class Transaction extends React.Component {
  render() {
    var obj = this.props.object;
    return (
      <div className="transaction">
        <div className="box">
          <Currency currency={obj.offer_currency} value={parseFloat(obj.offer)} />
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
  }
}
