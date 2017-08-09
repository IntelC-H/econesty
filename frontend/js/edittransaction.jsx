import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
import { Form, Element, Button, SubmitButton, Menu, MenuList, MenuHeading, MenuItem, Grid, GridUnit } from 'app/pure';
import { API } from 'app/api';
import { Resource, Money } from 'app/components';
import { Router, Link } from 'app/routing';

class EditTransactionPage extends Component {
  constructor(props) {
    super(props);
    this.save = this.save.bind(this);
    this.state = { object: null, error: null, requirements: [] };
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
    if (!this.state.object) {
      API.user.payment(this.otherId).catch(e => this.setState(st => {
        return Object.assign({}, st, { error: e });
      })).then(res => {
        const isBuyer = this.isBuyer;
  
        console.log(res);
  
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
  }

  save(obj) {
    console.log("saving ", obj);
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

  renderForm({ object }) {
    let o = object || {};
    o.requirements = o.requirements || [];
    return (
      <Form object={o} aligned>
        <Element text   name="offer" label="Offer" />
        <Element        name="offer_currency" label="Currency" select={["USD", "EUR", "JPY", "GBP"]} />
        <Element hidden name="buyer_id" />
        <Element hidden name="buyer_payment_data_id" />
        <Element hidden name="seller_id" />
        <Element hidden name="seller_payment_data_id" />
        <Form group name="requirements">
          <Element text name="text" label="Text" />
          <Element checkbox name="signature_required" label="Signature Required" />
          <Element checkbox name="acknowledgment_required" label="Acknowledgment Required" />
        </Form>
        <SubmitButton onSubmit={this.save}>
          {this.isBuyer ? "BUY" : "SELL"}
        </SubmitButton>
      </Form>
    );
  }

  addRequirement() {
    let r = {
      text: "",
      signature_required: false,
      acknowledgment_required: false
    };
    this.setState(st => {
      var cpy = Object.assign({}, st);
      cpy.object = cpy.object || {requirements: []};
      cpy.object.requirements.push(r);
      return cpy;
    });
  }

  render(props, { object, error, creatingRequirement }) {
    // return <Form aligned object={ { offer: "$0", array: [
    //   {
    //     foo: "FOO",
    //     bar: "BAR"
    //   },
    //   {
    //     foo: "suck",
    //     bar: "it"
    //   }
    // ]} }>
    //   <Element text   name="offer" label="Offer" />
    //   <Form aligned group name="array">
    //     <Element text name="foo" label="Foo" />
    //     <Element text name="bar" label="Bar" />
    //   </Form>
    //   <SubmitButton onSubmit={console.log}>SUBMIT</SubmitButton>
    // </Form>;

    console.log(object);

    return (
      <div className="edit-transaction">
        <Resource
          component={this.renderForm}
          object={object}
          error={this.otherId ? error : new Error("invalid user id")}
          {...props} />
        <Button onClick={() => this.addRequirement() }>+ Requirement</Button>
      </div>
    );
  }
}

export default EditTransactionPage;
