import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { Table, DeleteButton } from 'base/components/elements';
import { SideMargins } from 'app/common';
import { Flex, Collapsible, CollectionCreation, RevealButton,
         CollectionView, API, Form, Input, FormGroup } from 'base/base';

class WalletCreationControls extends Component {
  constructor(props) {
    super(props);
    this.state = { formVisible: false };
    this.openForm = this.openForm.bind(this);
    this.closeForm = this.closeForm.bind(this);
  }

  openForm() {
    this.setState(st => ({ ...st, formVisible: true }));
  }

  closeForm() {
    this.setState(st => ({ ...st, formVisible: false }));
  }

  render({ collectionView }, { formVisible }) {
    if (!formVisible) {
      return (
        <Flex container
                wrap="wrap"
                direction="row"
                justifyContent="center"
                marginTop marginLeft marginRight marginBottom>
          <button onClick={() => collectionView.listMethod("POST", "generate", {})}>Generate</button>
          <button onClick={this.openForm}><i className="fas fa-plus" /></button>
        </Flex>
      );
    }
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
                     style={{ textAlign: "center" }}
                     name="private_key"
                     placeholder="Wallet private key (WIF format)" />
            </FormGroup>
          </Flex>
          <Flex container justifyContent="center" alignItems="center">
            <button action="submit"><i className="fa fa-save" /></button>
            <button onClick={this.closeForm}><i className="fas fa-times" /></button>
          </Flex>
        </Flex>
      </Form>
    );
  }
}

function Wallets({}, { creationOpen }) {
  return (
    <SideMargins>
      <Flex container justifyContent="center">
        <h1 className="primary">Your Wallets</h1>
      </Flex>
      <CollectionView collection={API.wallet.withParams({ user__id: API.getUserID() })}>
        <WalletCreationControls />
        {collectionView => 
        <Table striped>
          {collectionView.getElements().map(w =>
          <tr>
            <td>
              <Flex container>
                <Flex align="center" marginRight>
                  {w.is_testnet && <p className="vertical-text">TESTNET</p>}
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
        </Table>}
      </CollectionView>
    </SideMargins>
  );
}

export { Wallets };
export default Wallets;
