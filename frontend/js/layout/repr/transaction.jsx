import React from 'react';
import { JSONComponent } from 'app/json';
import TextField from 'app/layout/element/textfield';
import Currency from 'app/layout/element/currency';
import 'style/transaction';

export default class Transaction extends JSONComponent {
  render() {
    return (
      <div className="transaction">
        <div className="box">
          <Currency currency={this.json.offer_currency} value={parseFloat(this.json.offer)} />
        </div>
        <div className="box">
          <a href={"/user/" + this.json.buyer.id}>View Buyer</a>
          <a href={"/user/" + this.json.seller.id}>View Seller</a>
        </div>
        <div className="box">
          <a href={"/transaction/" + this.json.id}>View</a>
        </div>
      </div>
    );
  }
}
