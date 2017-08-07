import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
import { Form, Element, Button, SubmitButton, Menu, MenuList, MenuHeading, MenuItem, Grid, GridUnit } from 'app/pure';
import { API } from 'app/api';
import { Resource } from 'app/components';
import { Router } from 'app/routing';

class EditTransactionPage extends Component {
  constructor(props) {
    super(props);
    this.save = this.save.bind(this);
    this.state = { object: null, error: null };
    this.setState = this.setState.bind(this);
    this.renderForm = this.renderForm.bind(this);
  }

  get isBuyer() {
    return this.props.matches.action === "buy";
  }

  get isSeller() {
    return this.props.matches.action === "sell";
  }

  get otherId() {
    return parseInt(this.props.matches.id);
  }

  componentDidMount() {
    API.user.payment(this.otherId).then(res => {
      const isBuyer = this.isBuyer;

      var me = res.me.user;
      var them = res.them.user;
      var payment = res;

      this.setState(st => Object.assign({}, st, {
        object: {
          offer: "0.00",
          offer_currency: "USD",
          buyer_id: isBuyer ? me.id : them.id,
          buyer_payment_data_id: isBuyer ? payment.me.id : payment.them.id,
          seller_id: isBuyer ? them.id : me.id,
          seller_payment_data_id: isBuyer ? payment.them.id : payment.me.id
        }
      }));
    });
  }

  save(obj) {
    const logic = transaction => {
      this.setState(st => Object.assign({}, st, { object: transaction }));
      Router.push("/transaction/" + transaction.id);
    };

    const errorLogic = e => {
      this.setState(st => Object.assign({}, st, { error: e }));
    }

    (obj.id ? 
      API.transaction.update(obj.id, obj)
      :
      API.transaction.create(obj)
    ).catch(errorLogic).then(logic);
  }

  renderForm({ object }) {
    return (
      <Form object={object} aligned>
        <Element text   name="offer" label="Offer" />
        <Element        name="offer_currency" label="Currency" select={["USD", "EUR", "JPY", "GBP"]} />
        <Element hidden name="buyer_id" />
        <Element hidden name="buyer_payment_data_id" />
        <Element hidden name="seller_id" />
        <Element hidden name="seller_payment_data_id" />
        <SubmitButton onSubmit={this.save}>
          {this.isBuyer ? "BUY" : "SELL"}
        </SubmitButton>
      </Form>
    );
  }

  render(props, { object, error }) {
    // TODO: persisted banner, maybe google-drive saving status bar
    return (
      <div className="edit-transaction">
        <Resource
          component={this.renderForm}
          object={object}
          error={this.otherId ? error : new Error("invalid user id")}
          {...props} />
        { /* TODO: UI for adding requirements. */ }
      </div>
    );
  }
}

export default EditTransactionPage;
