import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { Table, Button, DeleteButton, Labelled, SideMargins } from 'base/components/elements';
import { Form, Input, FormGroup } from 'base/components/forms';
import { API } from 'base/api';
import { CollectionView } from 'base/components/collectionview';
import { CollectionCreation } from 'base/components/collectioncreation';
import { Collapsible } from 'base/components/collapsible';

function WalletGenerateForm({ collectionView, testnet }) {
  return (
    <Form onSubmit={o => collectionView.getCollection().classMethod("POST", "generate_key", o).then(collectionView.saveElement)}>
      <Input hidden name="testnet" value={testnet ? "true" : "false"} />
      <Button className={"generate-" + (testnet ? "main" : "test") + "net-button"} action="submit"><i className="fas fa-pallet"></i> Generate{testnet ? " Testnet" : " Mainnet"}</Button>
    </Form>
  );
}

function WalletCreateForm({ collectionView, CancelButton }) {
  return (
    <Form className="input-form" onSubmit={collectionView.saveElement}>
      <Input hidden name="user_id" value={API.getUserID()}/>
      <FormGroup>
        <Input text required
               name="private_key"
               placeholder="Bitcoin wallet private key (WIF format)" />
      </FormGroup>
      <div className="centered">
        <Button action="submit"><i className="fa fa-save" />&nbsp;Save</Button>
        <CancelButton />
      </div>
    </Form>
  );
}

function WalletCollectionBody({ collectionView }) {
  return (
    <Table striped>
      <tbody>
      {collectionView.getElements().map(w =>
         <tr className={w.is_testnet ? "testnet" : "mainnet"}>
           <td>
             <DeleteButton onClick={() => collectionView.deleteElement(w.id)} />
             <p className="secondary">{w.address}</p>
             <Collapsible label="Private Key" animateClose={false}>
               <p className="teritary">{w.private_key}</p>
             </Collapsible>
           </td>
         </tr>)}
      </tbody>
    </Table>
  );
}

function Wallets() {
  return (
    <SideMargins className="wallets">
      <h1 className="primary">Your Wallets</h1>
      <CollectionView collection={API.wallet.withParams({ user__id: API.getUserID() })}>
        <CollectionCreation className="wallet-create-form"
                            createText={"+ Add"}
                            peers={[
                              <WalletGenerateForm />,
                              <WalletGenerateForm testnet />
                            ]}>
          <WalletCreateForm />
        </CollectionCreation>
        <WalletCollectionBody />
      </CollectionView>
    </SideMargins>
  );
}

export { Wallets };
export default Wallets;
