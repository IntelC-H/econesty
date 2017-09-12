import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
import { Resource, Button, Grid, GridUnit } from 'app/components/elements';
import { Form, Input, Select, ControlGroup, FormGroup } from 'app/components/forms';
import { API } from 'app/api';

const kinds = ['btc', 'csh', 'cdt', 'dbt', 'gnc'];

class PaymentData extends Component {
  constructor(props) {
    super(props);
    this.savePaymentData = this.savePaymentData.bind(this);
    this.state = { payments: [] };
    this.newPayment = this.newPayment.bind(this);
  }

  newPayment() {
    this.setState(st => ({ ...st, payments: st.payments.concat([{}])}));
  }

  savePaymentData(pd, idx) {
    API.user.me().then(me => {
      pd.user_id = me.id;
      API.payment_data
         .save(pd)
         .catch(console.log)
         .then(pdSaved => {
           console.log("created payment data", pdSaved);
         });
    });
  }

  render(props, { payments }) {
    return (
      <Grid>
        <GridUnit size="1" sm="4-24"/>
        <GridUnit size="1" sm="16-24">
          {payments.map((pd, idx) =>
            <Form
              key={pd.id ? pd.id : JSON.stringify(pd)}
              onSubmit={o => this.savePaymentData(o, idx)}
              >
              <FormGroup>
                <Select options={kinds} name="kind" />
                <Input text required name="data" placeholder="Payment data..." />
              </FormGroup>
              <FormGroup>
                <Input checkbox required name="encrypted" placeholder="Encrypted?" />
              </FormGroup>
              <Button action="submit">{pd.id ? "Update" : "Create"}</Button>
            </Form>
          )}
          <Button onClick={this.newPayment}>+ New</Button>
        </GridUnit>
        <GridUnit size="1" sm="4-24"/>
      </Grid>
    );
  }
}

PaymentData.propTypes = {};
PaymentData.defaultProps = {};

export { PaymentData };
export default PaymentData;
