import React from 'react';
import Components from 'app/components';
import 'style/transaction';

export default class Transaction extends React.Component {
  render() {
    var obj = this.props.object;
    return (
      <div className="transaction">
        <div className="box">
          {Components.money(parseFloat(obj.offer), obj.offer_currency)}
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
