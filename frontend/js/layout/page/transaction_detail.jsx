import React from 'react';
import TransactionForm from 'app/layout/page/transaction_form';
import Networking from 'app/networking'

export default class TransactionDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = { transaction: null };
  }

  componentDidMount() {
    Networking.create.asJSON()
                     .withLocalTokenAuth("token")
                     .appendPath("api", "transaction", this.props.match.params["id"] || this.props.id)
                     .go((res) => {
      if (res.error) {
        console.log(res.error);
      } else {
        this.setState({
          transaction: res.body
        });
      }
    });
  }

  render() {
    if (!this.state.transaction) return null;
  	return <TransactionForm transaction={this.state.transaction} />;
  }
}