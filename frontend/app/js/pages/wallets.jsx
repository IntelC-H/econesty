import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { Table } from 'base/components/elements';
import { SideMargins, Save, Times, Plus } from 'app/common';
import { Flex, Collapsible, CollectionView,
         API, Form, Input, FormGroup, SVGIcon, DeleteButton } from 'base/base';
import style from 'app/style';
import palette from 'app/palette';
import BaseStyles from 'base/style';
import { noSelect } from 'base/style/mixins';
import { parseSize, renderSize, fmapSize } from 'base/style/sizing';

const walletStyles = {
  keyInput: {
    textAlign: "center"
  },
  walletRow: {
    minHeight: renderSize(fmapSize(a => a * 2, parseSize(BaseStyles.elementHeight)))
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
          <button onClick={this.openForm}><Plus /></button>
        </Flex>
      );
    }
    return (
      <Flex component={Form} onSubmit={collectionView.saveElement}
            container row wrap margin justifyContent="center" alignItems="stretch">
        <Input hidden name="user_id" value={API.getUserID()}/>
        <Flex component={FormGroup} grow="2">
          <Input text required
                 style={walletStyles.keyInput}
                 name="private_key"
                 placeholder="Wallet private key (WIF format)" />
        </Flex>
        <Flex container justifyContent="center" alignItems="center">
          <button action="submit"><Save /></button>
          <button type="button" onClick={this.closeForm}><Times /></button>
        </Flex>
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
        <Table striped>
          {collectionView.getElements().map(w =>
          <tr style={{ ...style.table.tr, ...walletStyles.walletRow }}>
            <Flex container component="td" style={style.table.td}>
              {w.is_testnet &&
                <Flex component="p" align="flex-start" style={walletStyles.testnetLabel}>TESTNET</Flex>}
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
            </Flex>
          </tr>)}
        </Table>}
      </CollectionView>
    </SideMargins>
  );
}

export { Wallets };
export default Wallets;
