import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
//import PropTypes from 'prop-types';
import { Button, Grid, GridUnit } from 'app/components/elements';
import { Form, Input, Select, ControlGroup, SubmitButton } from 'app/components/forms';

import { API } from 'app/api';
import { Resource, SearchField } from 'app/components';
// import { Router, Link } from 'app/components/routing';

class EditTransactionPage extends Component {
  constructor(props) {
    super(props);
    this.formEl = null;
    this.onSubmit = this.onSubmit.bind(this);
    this.state = { object: null, error: null };
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
            buyer_id: isBuyer ? me.id : them.id,
            buyer_payment_data_id: isBuyer ? payment.me.id : payment.them.id,
            seller_id: isBuyer ? them.id : me.id,
            seller_payment_data_id: isBuyer ? payment.them.id : payment.me.id
          }
        }));
      });
    }
  }

  onSubmit(obj) {
    console.log("submitted ", obj); // eslint-disable-line no-console
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

  addRequirement() {
    let obj = this.formEl ? Form.toObject(this.formEl) : this.state.object;
    obj.requirements = obj.requirements || [];
    obj.requirements.push({});
    this.setState(st => ({...st, object: obj}));
  }

  renderForm({ object }) {
    const currencies = ["USD", "EUR", "JPY", "GBP"];
    return (
      <Grid>
        <GridUnit size="1" sm="4-24"/>
        <GridUnit size="1" sm="16-24">
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
                <SearchField name="user" api={API.user} component={props => props.object.username} />
              </ControlGroup>
              <ControlGroup label="Require Signature" message="The user will be required to provide a signature.">
                <Input checkbox required name="signature_required" />
              </ControlGroup>
              <ControlGroup label="Require Acknowledgment" message="The user has to acknowledge this transaction.">
                <Input checkbox required name="acknowledgment_required" />
              </ControlGroup>
            </Form>
            <Button onClick={this.addRequirement}>+ Requirement</Button>
            <SubmitButton onSubmit={this.onSubmit}>
              {this.isBuyer ? "BUY" : "SELL"}
            </SubmitButton>
          </Form>
          <GridUnit size="1" sm="4-24"/>
        </GridUnit>
      </Grid>
    );
  }

  render(props, { object, error }) {
    return <Resource
      component={this.renderForm}
      object={object}
      error={error}
      {...props}
    />
  }
}

export default EditTransactionPage;
