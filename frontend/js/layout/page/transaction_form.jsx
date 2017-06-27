import React from 'react';
import PropTypes from 'prop-types';

// utilities
import Networking from 'app/networking';

// JSON
import JSONForm from 'app/json/form';

// Elements
import TextField from 'app/layout/element/textfield';

// Representations
import Transaction from 'app/layout/repr/transaction';

export default class TransactionForm extends React.Component {
  constructor(props) {
    super(props);
    this.afterSubmit = this.afterSubmit.bind(this);
    this.state = {
      offer: this.props.transaction.offer || null,
      offer_currency: this.props.transaction.offer_currency || null,
      required_witnesses: this.props.transaction.required_witnesses || 0,
      buyer_id: this.props.transaction.buyer_id || null,
      buyer_payment_data_id: this.props.transaction.buyer_payment_data_id || null,
      seller_id: this.props.transaction.seller_id || null,
      seller_payment_data_id: this.props.transaction.seller_payment_data_id || null
    }
  }

  render() {
    if (!this.state.buyer_payment_data_id) return null;
    return (
      <div>
        <JSONForm path="/api/transaction/"
                  objectId={this.props.transaction.id}
                  afterSubmit={this.afterSubmit}>
          <TextField label="Offer" name="offer" value={this.state.offer} />
          <TextField label="Currency" name="offer_currency" value={this.state.offer_currency} />
          <TextField label="Witnesses" name="required_witnesses" value={this.state.required_witnesses} />
          <input type="hidden" name="buyer_id" value={this.state.buyer_id} />
          <input type="hidden" name="buyer_payment_data_id" value={this.state.buyer_payment_data_id} />
          <input type="hidden" name="seller_id" value={this.state.seller_id} />
          <input type="hidden" name="seller_payment_data_id" value={this.state.seller_payment_data_id} />
          <input type="submit" value={this.props.transaction != {} ? "Save Transaction" : "Create Transaction"} />
        </JSONForm>
      </div>
    );
  }

  afterSubmit(res) {
    if (res.error != null) {
      console.log(res.error);
    } else {
      if (this.props.history) {
        console.log(res.body.id);
        this.props.history.push("/transaction/" + res.body.id);
      }
    }
  }

  componentDidMount() {
    // Using the auth state and URL, determine who is
    // the buyer and who is the seller.
    //
    // Then, load a common payment data for each user.

    // TODO: other sources of finding the buyer and seller ids
    // This means more controls!

    var isBuyer = undefined;
    var otherId = undefined;

    if (this.props.match) {
      isBuyer = this.props.match.params["action"] == "buy";
      otherId = this.props.match.params["user"];
      otherId = otherId == "me" ? undefined : parseInt(otherId);
    }

    if (!this.state.buyer_payment_data_id) {
      Networking.create.asJSON()
                       .withLocalTokenAuth("token")
                       .appendPath("api", "user", "me")
                       .go((user) => {
        if (user.error) {
          console.log(user.error);
        } else {
          var meId = parseInt(user.body.id);
          var otherId = this.otherId || meId;
          Networking.create.asJSON()
                           .withLocalTokenAuth("token")
                           .appendPath("api", "user", otherId, "payment")
                           .go((res) => {
            // TODO: no common payments error!
            if (res.error) {
              console.log(error);
            } else {
              var payment = res.body;
              this.setState((st) => {
                st.buyer_id = this.isBuyer ? meId : otherId;
                st.buyer_payment_data_id = this.isBuyer ? payment.me.id : payment.them.id;
                st.seller_id = this.isBuyer ? otherId : meId;
                st.seller_payment_data_id = this.isBuyer ? payment.them.id : payment.me.id;
                return st;
              });
            }
          });
        }
      });
    }
  }
}

TransactionForm.defaultProps = {
  transaction: {}
}

TransactionForm.propTypes = {
  transaction: PropTypes.object
}
