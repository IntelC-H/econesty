import React from 'react';
import PropTypes from 'prop-types';

// utilities
import Networking from 'app/networking';

// JSON
import JSONObject from 'app/json/object';

// Elements
import TextField from 'app/layout/element/textfield';

// TODO: redirect
export default class CreateTransaction extends React.Component {
  constructor(props) {
    super(props);
    this.create = this.create.bind(this);
    this.renderCreateForm = this.renderCreateForm.bind(this);
  }

  get isBuyer() {
    return this.props.match.params["action"] == "buy";
  }

  get otherUserId() {
    var u = this.props.match.params["user"];
    return parseInt(this.props.match.params["user"]);
  }

  render() {
    return <JSONObject path="/api/transaction/" autoload={false} component={Transaction} createComponent={this.renderCreateForm} />;
  }

  renderCreateForm(props) {
    var e = props.element;
    e.state.object = e.object || {};
    return (
      <div>
        <JSONObject path={"/api/user/" + this.otherUserId + "/"} component={(props) => {
          return (
            <h3>{this.isBuyer ? "Buying from" : "Selling to"} @{props.element.object.username}</h3>
          );
        }} />
        <TextField label="Offer" onChange={(tf) => e.object.offer = parseInt(tf.text)} />
        <TextField label="Currency" onChange={(tf) => e.object.offer_currency = tf.text} />
        <button onClick={(_) => this.create(props.element)}>Create Transaction</button>
      </div>
    );
  }

  create(element) {
    var n = Networking.create.appendPath("api").asJSON().withLocalTokenAuth("token");
    n.appendPath("user", "me").go((user) => {
      var meId = parseInt(user.body.id);
      n.appendPath("user", this.otherUserId || meId, "payment").go((payment) => {
        element.object = element.object || {};
        element.object.buyer_id = this.isBuyer ? meId : (this.otherUserId || meId);
        element.object.buyer_payment_data_id = this.isBuyer ? payment.body.me.id : payment.body.them.id;
        element.object.seller_id = this.isBuyer ? (this.otherUserId || meId) : meId;
        element.object.seller_payment_data_id = this.isBuyer ? payment.body.them.id : payment.body.me.id;
        element.save();
      });
    });
  }
}