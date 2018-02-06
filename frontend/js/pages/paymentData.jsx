import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
import { Resource, Button, Grid, GridUnit } from 'app/components/elements';
import { Form, Input, Select, ControlGroup, FormGroup } from 'app/components/forms';
import { API } from 'app/api';
import { CollectionView, CollectionCreation } from 'app/components/api';

const kinds = ['btc', 'csh', 'cdt', 'dbt', 'gnc'];

class PaymentDatum extends Component {
  // TODO: detect changes and hide/show submit button accordingly
  render({ paymentData, onSubmit }) {
    return (
      <Form key={paymentData.id || "createpd"} onSubmit={onSubmit}>
        <Input hidden name="user_id" value={paymentData.id || API.getUserID()}/>
        <FormGroup>
          <Select options={kinds} name="kind" value={paymentData.kind}/>
          <Input text required
                 name="data"
                 value={paymentData.data}
                 placeholder="Payment data..." />
        </FormGroup>
        <FormGroup>
          <Input checkbox name="encrypted" placeholder="Encrypted?" value={paymentData.encrypted}/>
        </FormGroup>
        <Button action="submit">Save</Button>
      </Form>
    );
  }
}

PaymentDatum.defaultProps = {
  paymentData: {},
  onSubmit: () => null
};

function PaymentDataCreateForm({ collectionView }) {
  return <PaymentDatum onSubmit={collectionView.saveElement} />;
}

function PaymentDataCollectionBody({ collectionView }) {
  let elements = collectionView.getElements();
  return (
    <Grid>
      <GridUnit size="1" sm="4-24"/>
      <GridUnit size="1" sm="16-24">
        {elements.map(pd => <PaymentDatum
                              paymentData={pd}
                              onSubmit={collectionView.saveElement} /> )}
      </GridUnit>
      <GridUnit size="1" sm="4-24"/>
    </Grid>
  );
}

function PaymentData(props) {
  return (
    <CollectionView collection={API.payment_data}>
      <PaymentDataCollectionBody />
      <CollectionCreation>
        <PaymentDataCreateForm />
      </CollectionCreation>
    </CollectionView>
  );
}

export { PaymentData };
export default PaymentData;
