import React from 'react';
import { JSONComponent } from 'app/json';
import TextField from 'app/layout/element/textfield';

export default class Transaction extends JSONComponent {
  constructor(props) {
    super(props);
    this.handleOfferChange = this.handleOfferChange.bind(this);
    this.handleCurrencyChange = this.handleCurrencyChange.bind(this);
  }

  render() {
    return (
      <div>
        <TextField label="Offer" text={this.json.offer} onChange={this.handleOfferChange} />
        <TextField label="Currency" maxLength={3} text={this.json.offer_currency} onChange={this.handleCurrencyChange} />
        <a href={"/user/" + this.json.buyer.id}>Buyer: {this.json.buyer.username}</a>
        <a href={"/user/" + this.json.seller.id}>Seller: {this.json.seller.username}</a>
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
