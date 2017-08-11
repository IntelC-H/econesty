import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
//import PropTypes from 'prop-types';
import { Form, ControlGroup, Input, Select, Button, SubmitButton, Grid, GridUnit } from 'app/pure';
import { API } from 'app/api';
import { Resource, SearchField } from 'app/components';
import { Router, Link } from 'app/routing';

class EditTransactionPage extends Component {
  constructor(props) {
    super(props);
    this.formEl = null;
    this.onSubmit = this.onSubmit.bind(this);
    this.state = { object: props.object || null, error: this.props.error || null };
    this.setState = this.setState.bind(this);
    this.renderForm = this.renderForm.bind(this);
    this.addRequirement = this.addRequirement.bind(this);
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
    if (!this.state.object) {
      API.user.payment(this.otherId).catch(e => this.setState(st => {
        return Object.assign({}, st, { error: e });
      })).then(res => {
        const isBuyer = this.isBuyer;

        var me = res.me.user;
        var them = res.them.user;
        var payment = res;
  
        this.setState(st => Object.assign({}, st, {
          object: {
            offer_currency: "USD",
            buyer_id: isBuyer ? me.id : them.id,
            buyer_payment_data_id: isBuyer ? payment.me.id : payment.them.id,
            seller_id: isBuyer ? them.id : me.id,
            seller_payment_data_id: isBuyer ? payment.them.id : payment.me.id
          }
        }));
      });
    }
  }

  // FIXME: adding the first requirement wipes the form.
  setState(state, callback) {
    if (this.formEl) {
      const obj = Form.toObject(this.formEl);
      super.setState(st => ({ ...st, object: obj }));
    }
    return super.setState(state, callback);
  }

  onSubmit(obj) {
    console.log("submitted ", obj);
    // const requirements = obj.requirements;
    // obj.requirements = undefined;

    // const logic = transaction => {
    //   this.setState(st => Object.assign({}, st, { object: transaction }));
    //   Router.redirect("/transaction/" + transaction.id);
    // };

    // const errorLogic = e => {
    //   this.setState(st => Object.assign({}, st, { error: e }));
    // };

    // (obj.id ?
    //   API.transaction.update(obj.id, obj)
    //   :
    //   API.transaction.create(obj)
    // ).catch(errorLogic).then(logic);
  }

  // FIXME: This form cannot restore users on changes to the form itself.
  renderForm({ object }) {
    const currencies = ["USD", "EUR", "JPY", "GBP"];
    return (
      <Form object={object} aligned ref={ el => {
        if (el) this.formEl = el.base;
        return;
      } }>
        <ControlGroup label="Offer">
          <Input text required name="offer" />
        </ControlGroup>
        <ControlGroup label="Currency">
          <Select options={currencies} name="offer_currency" />
        </ControlGroup>
        <Input hidden name="buyer_id"/>
        <Input hidden name="buyer_payment_data_id" />
        <Input hidden name="seller_id" />
        <Input hidden name="seller_payment_data_id" />
        <Form group name="requirements">
          <ControlGroup label="Terms">
            <Input text required name="text" />
          </ControlGroup>
          <ControlGroup label="User">
            <SearchField name="user" isFormElement api={API.user} component={props => props.object.username} />
          </ControlGroup>
          <ControlGroup label="Require Signature" message="The user will be required to provide a signature.">
            <Input checkbox required name="signature_required" />
          </ControlGroup>
          <ControlGroup label="Require Acknowledgment" message="The user has to acknowledge this transaction.">
            <Input checkbox required name="acknowledgment_required" />
          </ControlGroup>
        </Form>
        <SubmitButton onSubmit={this.onSubmit}>
          {this.isBuyer ? "BUY" : "SELL"}
        </SubmitButton>
      </Form>
    );
  }

  addRequirement() {
    let r = {
      user: null,
      text: "",
      signature_required: false,
      acknowledgment_required: false
    };
    this.setState(st => {
      var cpy = Object.assign({}, st);
      cpy.object = cpy.object || {};
      cpy.object.requirements = cpy.object.requirements || [];
      cpy.object.requirements.push(r);
      return cpy;
    });
  }

  render(props, { object, error }) {
    return (
      <div className="edit-transaction">
        <Resource
          component={this.renderForm}
          object={object}
          error={this.otherId ? error : new Error("invalid user id")}
          {...props} />
        <Button onClick={this.addRequirement}>+ Requirement</Button>
      </div>
    );
  }
}

export default EditTransactionPage;
