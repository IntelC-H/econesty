import React from 'react';
import JSONObject from 'app/json/object';
import JSONCollection from 'app/json/collection';
import User from 'app/layout/repr/user';
import Transaction from 'app/layout/repr/transaction';

export default class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.buyFrom = this.buyFrom.bind(this);
    this.sellTo = this.sellTo.bind(this);
  }

  render() {
    return (
      <div>
        <JSONObject path={"/api/user/" + this.props.match.params.user + "/"} component={User} />
        <button onClick={this.buyFrom}>Buy From</button>
        <button onClick={this.sellTo}>Sell To</button>
        <JSONCollection path="/api/transaction/" component={Transaction} headerComponent={this.renderTransactionHeader} />
      </div>
    );
  }

  renderTransactionHeader(props) {
    return <span className="primary light">Transactions</span>;
  }

  buyFrom() {
    this.props.history.push("/user/" + this.props.match.params.user + "/transaction/buy");
  }

  sellTo() {
    this.props.history.push("/user/" + this.props.match.params.user + "/transaction/sell");
  }
}

