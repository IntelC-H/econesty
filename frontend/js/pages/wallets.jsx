import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
import { Button, Grid, GridUnit } from 'app/components/elements';
import { Form, Input, FormGroup } from 'app/components/forms';
import { API } from 'app/api';
import { CollectionView, CollectionCreation } from 'app/components/api';

class Wallet extends Component {
  // TODO: detect changes and hide/show save button accordingly
  render({ wallet, onSubmit }) {
    return (
      <div>
        <p>Address: {wallet.address}</p>
        <Form key={wallet.id || "createwallet"} onSubmit={onSubmit}>
          <Input hidden name="user_id" value={wallet.user.id || API.getUserID()}/>
          <FormGroup>
            <Input text required
                   name="private_key"
                   value={wallet.private_key}
                   placeholder="WIF-formatted Bitcoin private key" />
          </FormGroup>
          <Button action="submit">Save</Button>
        </Form>
      </div>
    );
  }
}

Wallet.propTypes = {
  wallet: API.wallet.shape,
  onSubmit: PropTypes.func
};

Wallet.defaultProps = {
  wallet: {},
  onSubmit: () => null
};

function WalletCreateForm({ collectionView }) {
  return <Wallet onSubmit={collectionView.saveElement} />;
}

function WalletCollectionBody({ collectionView }) {
  return (
    <div>
      {collectionView.getElements().map(w =>
         <Wallet
           wallet={w}
           onSubmit={collectionView.saveElement} /> )}
    </div>
  );
}

function Wallets() {
  return (
    <Grid>
      <GridUnit size="1" sm="4-24"/>
      <GridUnit size="1" sm="16-24">
        <CollectionView collection={API.wallet.withParams({ user__id: API.getUserID() })}>
          <CollectionCreation>
            <WalletCreateForm />
          </CollectionCreation>
          <WalletCollectionBody />
        </CollectionView>
      </GridUnit>
      <GridUnit size="1" sm="4-24"/>
    </Grid>
  );
}

export { Wallets };
export default Wallets;
