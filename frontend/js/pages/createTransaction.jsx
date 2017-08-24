import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
//import PropTypes from 'prop-types';
import { Resource, Button, Grid, GridUnit } from 'app/components/elements';
import { Form, Input, Select, ControlGroup, SubmitButton } from 'app/components/forms';

import { API } from 'app/api';
import SearchField from 'app/components/searchfield';
import { Router } from 'app/components/routing';

class CreateTransaction extends Component {
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

  onSubmit(obj) {
    const objCopy = Object.assign({}, obj);
    console.log("submitted ", obj); // eslint-disable-line no-console
    let requirements = objCopy.requirements;
    requirements.forEach(r => {
      r.user_id = (r.user || {}).id || null;
      delete r.user;
    });
    delete objCopy.requirements;

    const logic = transaction => {
      // TODO: catch errors on creating requirements
      const rs = requirements.map(r => ({...r, transaction_id: transaction.id}))

      Promise.all(rs.map(r => API.requirement.create(r))).then(rs => {
        transaction.requirements = rs;
        this.setState(st => Object.assign({}, st, { object: transaction }));
        Router.replace("/transaction/" + transaction.id);
      });
    };

    API.transaction.create(objCopy)
                   .then(logic)
                   .catch(e => this.setState(st => ({...st, error: e })))
  }

  addRequirement() {
    let obj = this.form ? Form.toObject(this.form.base) : this.state.object;
    obj.requirements = obj.requirements || [];
    obj.requirements.push({});
    this.setState(st => ({...st, object: obj}));
  }

  renderForm(props) {
    const currencies = ["USD", "EUR", "JPY", "GBP"];
    return (
      <Grid>
        <GridUnit size="1" sm="4-24"/>
        <GridUnit size="1" sm="16-24">
          <div className="informational">
            <h3>Create a Transaction</h3>
            <p>This is the page you use to create a transaction.</p>
          </div>
          <Form aligned
                ref={ el => this.form = el }
                {...props}
          >
            <ControlGroup label="How much?">
              <Select options={currencies} name="offer_currency" />
              <Input number required name="offer" step="0.01" min="0" cols="6" />
            </ControlGroup>
            <Input hidden name="buyer_id"/>
            <Input hidden name="buyer_payment_data_id" />
            <Input hidden name="seller_id" />
            <Input hidden name="seller_payment_data_id" />
            <Form group aligned name="requirements">
              <ControlGroup label="Terms">
                <Input text required name="text" />
              </ControlGroup>
              <ControlGroup label="User">
                <SearchField name="user" api={API.user} component={props => props.object.username} />
              </ControlGroup>
              <ControlGroup>
                <Input checkbox required name="signature_required" placeholder="Require a signature" />
                <Input checkbox required name="acknowledgment_required" placeholder="Require acknowledgment" />
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

export default CreateTransaction;
