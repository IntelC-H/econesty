import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { SideMargins, Save, Times, Plus } from 'app/common';
import { Flex, Collapsible, CollectionView,
         API, Form, Input, DeleteButton, Button } from 'base/base';
import style from 'app/style';
import palette from 'app/palette';
import BaseStyles from 'base/style';
import { noSelect } from 'base/style/mixins';
import { parseSize, renderSize, fmapSize } from 'base/style/sizing';

const walletStyles = {
  keyInput: {
    textAlign: "center",
    width: undefined,
    margin: `${BaseStyles.padding}`
  },
  testnetLabel: {
    ...noSelect(),
    transform: "rotate(180deg)",
    textAlign: "center",
    color: palette.accentColor,
    writingMode: "vertical-lr",
    width: "1em",
    fontSize: "0.75rem",
    margin: BaseStyles.padding
  },
  privateKey: {
    marginTop: BaseStyles.padding,
    marginBottom: BaseStyles.padding
  },
  address: {
    margin: BaseStyles.padding
  },
  collapsible: {
    margin: BaseStyles.padding
  }
};

class WalletCreationControls extends Component {
  constructor(props) {
    super(props);
    this.state = { formVisible: false };
    this.openForm = this.openForm.bind(this);
    this.closeForm = this.closeForm.bind(this);
  }

  openForm() {
    console.log("Open Form");
    this.setState(st => ({ ...st, formVisible: true }));
  }

  closeForm() {
    console.log("Close Form");
    this.setState(st => ({ ...st, formVisible: false }));
  }

  render({ collectionView }, { formVisible }) {
    if (!formVisible) {
      return (
        <Flex container row wrap margin justifyContent="center">
          <Button onClick={() => collectionView.listMethod("POST", "generate", {})}>Generate</Button>
          <Button onClick={this.openForm}><Plus /></Button>
        </Flex>
      );
    }
    return (
      <Flex component={Form} onSubmit={collectionView.saveElement}
            container row wrap margin justifyContent="center" alignItems="stretch">
        <Input hidden name="user_id" value={API.getUserID()}/>
        <Flex component={Input} grow="2"
              text required
              style={walletStyles.keyInput}
              name="private_key"
              placeholder="Wallet private key (WIF format)" />
        <Button type="submit"><Save /></Button>
        <Button onClick={this.closeForm}><Times /></Button>
      </Flex>
    );
  }
}

function Wallets({}) {
  return (
    <SideMargins>
      <Flex component="h1" style={{ ...style.text.primary, ...noSelect() }}
            container justifyContent="center">
        Your Wallets
      </Flex>
      <CollectionView collection={API.wallet.withParams({ user__id: API.getUserID() })}>
        <WalletCreationControls />
        {collectionView =>
        <Flex container column style={style.table.base}>
          {collectionView.getElements().map((w, idx) =>
            <Flex container style={{ ...style.table.row,
                                     ...idx % 2 ? style.table.oddRow : {},
                                     ...style.table.column}}>
              {w.is_testnet &&
                <Flex align="flex-start" style={walletStyles.testnetLabel}>TESTNET</Flex>}
              <Flex grow="2">
                <p style={{ ...style.text.secondary, ...style.text.crypto, ...walletStyles.address }}>
                  {w.address}
                </p>
                <Collapsible label="Private Key" animateOpen style={walletStyles.collapsible}>
                  <p style={{...style.text.secondary, ...style.text.crypto, ...walletStyles.privateKey }}>
                    {w.private_key}
                  </p>
                </Collapsible>
              </Flex>
              <DeleteButton onClick={() => collectionView.deleteElement(w.id)} />
            </Flex>)}
        </Flex>}
      </CollectionView>
    </SideMargins>
  );
}

export { Wallets };
export default Wallets;
