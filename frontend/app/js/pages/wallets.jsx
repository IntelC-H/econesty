import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { Table, Button, DeleteButton, SideMargins } from 'base/components/elements';
import { FlexContainer, FlexItem, Collapsible, CollectionCreation,
         CollectionView, API, Form, Input, FormGroup } from 'base/base';

function WalletGenerateButton({ collectionView, testnet }) {
  return (
    <Form onSubmit={o => collectionView.getCollection().classMethod("POST", "generate_key", o).then(collectionView.saveElement)}>
      <Input hidden name="testnet" value={testnet ? "true" : "false"} />
      <Button action="submit">Generate{testnet ? " (Testnet)" : ""}</Button>
    </Form>
  );
}

function WalletCreateForm({ collectionView, CancelButton }) {
  return (
    <Form className="input-form" onSubmit={collectionView.saveElement}>
      <FlexContainer justifyContent="center"
                     direction="row"
                     wrap="wrap"
                     alignItems="stretch">
        <Input hidden name="user_id" value={API.getUserID()}/>
        <FlexItem grow="2">
          <FormGroup>
            <Input text required
                   name="private_key"
                   placeholder="Wallet private key (WIF format)" />
          </FormGroup>
        </FlexItem>
        <div className="centered">
          <Button action="submit"><i className="fa fa-save" /></Button>
          <CancelButton />
        </div>
      </FlexContainer>
    </Form>
  );
}

function WalletCollectionBody({ collectionView }) {
  return (
    <Table striped>
      <tbody>
      {collectionView.getElements().map(w =>
         <tr className={w.is_testnet ? "wallet-row testnet" : "wallet-row"}>
           <td>
             <FlexContainer>
               <FlexItem align="center">
                 {w.is_testnet && <p className="testnet-label">TESTNET</p>}
               </FlexItem>
               <FlexItem grow="2">
                 <p className="secondary crypto-text">{w.address}</p>
                 <Collapsible label="Private Key" animateClose={false}>
                   <p className="teritary crypto-text">{w.private_key}</p>
                 </Collapsible>
               </FlexItem>
               <FlexItem>
                 <DeleteButton onClick={() => collectionView.deleteElement(w.id)} />
               </FlexItem>
             </FlexContainer>
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
                            createText={<i className="fas fa-plus" />}
                            cancelText={<i className="fas fa-times-circle" />}
                            peers={[
                              <WalletGenerateButton />
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
