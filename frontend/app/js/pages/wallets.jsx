import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { Table, Button, DeleteButton } from 'base/components/elements';
import { SideMargins } from 'app/common';
import { Flex, Collapsible, CollectionCreation,
         CollectionView, API, Form, Input, FormGroup } from 'base/base';

function WalletGenerateButton({ collectionView, testnet }) {
  return (
    <Form onSubmit={o => collectionView.listMethod("POST", "generate", o)}>
      <Input hidden name="testnet" value={testnet ? "true" : "false"} />
      <Button action="submit">Generate{testnet ? " (Testnet)" : ""}</Button>
    </Form>
  );
}

function WalletCreateForm({ collectionView, CancelButton }) {
  return (
    <Form className="input-form" onSubmit={collectionView.saveElement}>
      <Flex container justifyContent="center"
                     direction="row"
                     wrap="wrap"
                     alignItems="stretch">
        <Input hidden name="user_id" value={API.getUserID()}/>
        <Flex grow="2">
          <FormGroup>
            <Input text required
                   name="private_key"
                   placeholder="Wallet private key (WIF format)" />
          </FormGroup>
        </Flex>
        <Flex container justifyContent="center" alignItems="center">
          <Button action="submit"><i className="fa fa-save" /></Button>
          <CancelButton />
        </Flex>
      </Flex>
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
             <Flex container>
               <Flex align="center">
                 {w.is_testnet && <p className="testnet-label">TESTNET</p>}
               </Flex>
               <Flex grow="2">
                 <p className="secondary crypto-text">{w.address}</p>
                 <Collapsible label="Private Key" animateClose={false}>
                   <p className="teritary crypto-text">{w.private_key}</p>
                 </Collapsible>
               </Flex>
               <Flex>
                 <DeleteButton onClick={() => collectionView.deleteElement(w.id)} />
               </Flex>
             </Flex>
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
