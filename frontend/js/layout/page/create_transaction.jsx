import React from 'react';
import PropTypes from 'prop-types';

// utilities
import Networking from 'app/networking';

// JSON
import JSONObject from 'app/json/object';
import JSONForm from 'app/json/form';

// Elements
import TextField from 'app/layout/element/textfield';

// Representations
import Transaction from 'app/layout/repr/transaction';

export default class CreateTransaction extends React.Component {
  constructor(props) {
    super(props);
    this.afterSubmit = this.afterSubmit.bind(this);
    this.state = {
      buyer_id: null,
      buyer_payment_data_id: null,
      seller_id: null,
      seller_payment_data_id: null
    }
  }

  get isBuyer() {
    return this.props.match.params["action"] == "buy";
  }

  get otherId() {
    var u = this.props.match.params["user"];
    return u == "me" ? undefined : parseInt(u);
  }

  render() {
    if (this.state.me_id == null) {
      return null;
    }
    var otherId = this.otherId || this.state.me_id;
    return (
      <div>
        <JSONObject path={"/api/user/" + otherId + "/"} component={(props) => {
          return (
            <h3>{this.isBuyer ? "Buying from" : "Selling to"} @{props.element.object.username}</h3>
          );
        }} />
        <JSONForm path="/api/transaction/" create afterSubmit={this.afterSubmit}>
          <TextField name="offer" label="Offer" />
          <TextField name="offer_currency" label="Currency" />
          <input type="hidden" name="buyer_id" value={this.state.buyer_id} />
          <input type="hidden" name="buyer_payment_data_id" value={this.state.buyer_payment_data_id} />
          <input type="hidden" name="seller_id" value={this.state.seller_id} />
          <input type="hidden" name="seller_payment_data_id" value={this.state.seller_payment_data_id} />
          <input type="submit" value="Create Transaction" />
        </JSONForm>
      </div>
    );
  }

  afterSubmit(res) {
    if (res.error != null) {

    } else {
      this.props.history.push("/transaction/" + res.body.id);
    }
  }

  componentDidMount() {
    var n = Networking.create.appendPath("api", "user").asJSON().withLocalTokenAuth("token");
    n.appendPath("me").go((user) => {
      var meId = parseInt(user.body.id);
      var otherId = this.otherId || meId;
      n.appendPath(otherId, "payment").go((payment) => {
        this.setState({
          me_id: meId,
          buyer_id: this.isBuyer ? meId : otherId,
          buyer_payment_data_id: this.isBuyer ? payment.body.me.id : payment.body.them.id,
          seller_id: this.isBuyer ? otherId : meId,
          seller_payment_data_id: this.isBuyer ? payment.body.them.id : payment.body.me.id
        });
      });
    });
  }
}