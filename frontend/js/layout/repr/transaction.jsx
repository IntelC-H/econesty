import React from 'react';
import { JSONComponent } from 'app/json';
import TextField from 'app/layout/element/textfield';
import Currency from 'app/layout/element/currency';
import 'style/transaction';

export default class Transaction extends JSONComponent {
  constructor(props) {
    super(props);
    this.handleOfferChange = this.handleOfferChange.bind(this);
    this.handleCurrencyChange = this.handleCurrencyChange.bind(this);
  }

  render() {
  //  <TextField label="Offer" text={this.json.offer} onChange={this.handleOfferChange} />
    //      <TextField label="Currency" maxLength={3} text={this.json.offer_currency} onChange={this.handleCurrencyChange} />
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

  handleCurrencyChange(tf) {
    this.json.offer_currency = tf.text.substring(0, 3);
   // this.save();
  }

  handleOfferChange(tf) {
    this.json.offer = parseFloat(tf.text);
    //this.save();
  }
}
