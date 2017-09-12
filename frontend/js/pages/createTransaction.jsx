import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
//import PropTypes from 'prop-types';
import { Resource, Loading, ErrorDisplay, Button, Grid, GridUnit, Labelled } from 'app/components/elements';
import { Form, FormGroup, Input, Select, SubmitButton } from 'app/components/forms';

import { API } from 'app/api';
import SearchField from 'app/components/searchfield';
import { Router } from 'app/components/routing';

import linkState from 'linkstate';
import linkRef from 'linkref';

class CreateTransaction extends Component {
  constructor(props) {
    super(props);
    this.formEl = null;
    this.onSubmit = this.onSubmit.bind(this);
    this.state = { hiddens: null, error: null, reqs: [] };
    this.setState = this.setState.bind(this);
    this.renderForm = this.renderForm.bind(this);
    this.addRequirement = this.addRequirement.bind(this);
  }

  get isBuyer() { return this.props.matches.action === "buy"; }
  get isSeller() { return this.props.matches.action === "sell"; }
  get otherId() { return parseInt(this.props.matches.id); }

  componentDidMount() {
    if (!this.state.hiddens) {
      API.user.payment(this.otherId).catch(e => this.setState(st => {
        return Object.assign({}, st, { error: e });
      })).then(res => {
        const isBuyer = this.isBuyer;

        var me = res.me.user;
        var them = res.them.user;
        var payment = res;

        this.setState(st => Object.assign({}, st, {
          hiddens: {
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
    let requirements = objCopy.requirements;
    if (requirements) {
      requirements.forEach(r => {
        r.user_id = (r.user || {}).id || null;
        delete r.user;
      });
    }

    delete objCopy.requirements;

    const logic = transaction => {
      // TODO: catch errors on creating requirements
      const rs = requirements.map(r => ({...r, transaction_id: transaction.id}));

      Promise.all(rs.map(r => API.requirement.create(r))).then(rs => {
        transaction.requirements = rs;
        this.setState(st => Object.assign({}, st, { object: transaction }));
        Router.replace("/transaction/" + transaction.id);
      });
    };

  //  delete objCopy.__proto__;
    console.log("CREATING TRANSACTION", objCopy);

    API.transaction.create(objCopy)
                   .then(logic)
                   .catch(e => this.setState(st => ({...st, error: e })));
  }

  addRequirement() {
    this.setState(st => ({...st, reqs: st.reqs.concat([Math.random()]) }));
  }

  deleteRequirementAtIndex(idx) {
    this.setState(st => {
      var ary = st.reqs.slice();
      ary.splice(idx, 1);
      return { ...st, reqs: ary };
    });
  }

  renderForm(values) {
    const currencies = ["USD", "EUR", "JPY", "GBP"];
    return (
      <Grid>
        <GridUnit size="1" sm="4-24"/>
        <GridUnit size="1" sm="16-24">
          <div className="informational">
            <h3>Create a Transaction</h3>
            <p>This is the page you use to create a transaction.</p>
          </div>

          <Form aligned onSubmit={this.onSubmit}>
            <Input hidden name="requirements" value={[]} />
            <Input hidden
                   name="requirements.length"
                   value={this.state.reqs.length}
                   key={this.state.reqs.length}/>
            <Input hidden name="buyer_id" value={values.buyer_id} />
            <Input hidden name="buyer_payment_data_id" value={values.buyer_payment_data_id} />
            <Input hidden name="seller_id" value={values.seller_id} />
            <Input hidden name="seller_payment_data_id" value={values.seller_payment_data_id} />

            <Labelled label="How much?">
              <Select options={currencies} name="offer_currency" />
              <Input number required name="offer" step="0.01" min="0" cols="6" />
            </Labelled>

            {this.state.reqs.map((r, idx) =>
              <div>
                <a
                   className="form-delete-button fa fa-times"
                   onClick={() => this.deleteRequirementAtIndex(idx)}
                />
                <FormGroup key={r} keypath={"requirements." + idx}>
                  <Labelled label="Terms">
                    <Input text name="text" />
                  </Labelled>
                  <Labelled label="User">
                    <SearchField name="user"
                                 api={API.user}
                                 component={props => props.object.username} />
                  </Labelled>              
                  <Input checkbox
                         name="signature_required"
                         placeholder="Require a signature" />
                  <Input checkbox
                         name="acknowledgment_required"
                         placeholder="Require acknowledgment" />
                </FormGroup>
              </div>
            )}

            <Button type="button" onClick={this.addRequirement}>+ Requirement</Button>
            <Button action="submit">{this.isBuyer ? "BUY" : "SELL"}</Button>
          </Form>
          <GridUnit size="1" sm="4-24"/>
        </GridUnit>
      </Grid>
    );
  }

  render(props, { hiddens, error }) {
    if (error) return <ErrorDisplay message={error.message}/>;
    if (!hiddens) return <Loading/>;
    return this.renderForm(hiddens);
  }
}

export default CreateTransaction;
