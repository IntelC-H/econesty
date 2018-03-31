import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { Table, DeleteButton } from 'base/components/elements';
import { SideMargins } from 'app/common';
import { Flex, Collapsible,
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
        <Flex container row wrap margin justifyContent="center">
          <button onClick={() => collectionView.listMethod("POST", "generate", {})}>Generate</button>
          <button onClick={this.openForm}><i className="fas fa-plus" /></button>
        </Flex>
      );
    }
    return (
      <Flex component={Form} onSubmit={collectionView.saveElement}
            container row wrap margin justifyContent="center" alignItems="stretch">
        <Input hidden name="user_id" value={API.getUserID()}/>
        <Flex component={FormGroup} grow="2">
          <Input text required
                 style={{ textAlign: "center" }}
                 name="private_key"
                 placeholder="Wallet private key (WIF format)" />
        </Flex>
        <Flex container justifyContent="center" alignItems="center">
          <button action="submit"><i className="fa fa-save" /></button>
          <button onClick={this.closeForm}><i className="fas fa-times" /></button>
        </Flex>
      </Flex>
    );
  }
}

function Wallets({}) {
  return (
    <SideMargins>
      <Flex key="your_wallets"
            component="h1" className="primary no-select"
            container justifyContent="center">
        Your Wallets
      </Flex>
      <CollectionView collection={API.wallet.withParams({ user__id: API.getUserID() })}>
        <WalletCreationControls />
        {collectionView =>
        <Table striped>
          {collectionView.getElements().map(w =>
          <tr>
            <Flex container component="td">
              {w.is_testnet &&
                <Flex component="p" className="vertical-text no-select"
                      align="center" marginRight>TESTNET</Flex>}
              <Flex grow="2">
                <p className="secondary crypto-text">{w.address}</p>
                <Collapsible label="Private Key" animateClose={false}>
                  <p className="private-key teritary crypto-text">{w.private_key}</p>
                </Collapsible>
              </Flex>
              <DeleteButton onClick={() => collectionView.deleteElement(w.id)} />
            </Flex>
          </tr>)}
        </Table>}
      </CollectionView>
    </SideMargins>
  );
}

export { Wallets };
export default Wallets;
