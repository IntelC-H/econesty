import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { Table, DeleteButton } from 'base/components/elements';
import { SideMargins } from 'app/common';
import { Flex, Collapsible, CollectionView,
         API, Form, Input, FormGroup, SVGIcon } from 'base/base';
import style from 'app/style';
import palette from 'app/palette';
import BaseStyles from 'base/style';
import { noSelect } from 'base/style/mixins';
import { parseSize, renderSize, fmapSize, reduceSizes } from 'base/style/sizing';

const icons = {
  plus: {
    viewBox: "0 0 448 512",
    path: "M436 228H252V44c0-6.6-5.4-12-12-12h-32c-6.6 0-12 5.4-12 12v184H12c-6.6 0-12 5.4-12 12v32c0 6.6 5.4 12 12 12h184v184c0 6.6 5.4 12 12 12h32c6.6 0 12-5.4 12-12V284h184c6.6 0 12-5.4 12-12v-32c0-6.6-5.4-12-12-12z"
  },
  times: {
    viewBox: "0 0 384 512",
    path: "M231.6 256l130.1-130.1c4.7-4.7 4.7-12.3 0-17l-22.6-22.6c-4.7-4.7-12.3-4.7-17 0L192 216.4 61.9 86.3c-4.7-4.7-12.3-4.7-17 0l-22.6 22.6c-4.7 4.7-4.7 12.3 0 17L152.4 256 22.3 386.1c-4.7 4.7-4.7 12.3 0 17l22.6 22.6c4.7 4.7 12.3 4.7 17 0L192 295.6l130.1 130.1c4.7 4.7 12.3 4.7 17 0l22.6-22.6c4.7-4.7 4.7-12.3 0-17L231.6 256z"
  },
  save: {
    viewBox: "0 0 448 512",
    path: "M433.941 129.941l-83.882-83.882A48 48 0 0 0 316.118 32H48C21.49 32 0 53.49 0 80v352c0 26.51 21.49 48 48 48h352c26.51 0 48-21.49 48-48V163.882a48 48 0 0 0-14.059-33.941zM224 416c-35.346 0-64-28.654-64-64 0-35.346 28.654-64 64-64s64 28.654 64 64c0 35.346-28.654 64-64 64zm96-304.52V212c0 6.627-5.373 12-12 12H76c-6.627 0-12-5.373-12-12V108c0-6.627 5.373-12 12-12h228.52c3.183 0 6.235 1.264 8.485 3.515l3.48 3.48A11.996 11.996 0 0 1 320 111.48z"
  }
};

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
          <button onClick={this.openForm}><SVGIcon {...icons.plus} /></button>
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
          <button action="submit"><SVGIcon {...icons.save} /></button>
          <button type="button" onClick={this.closeForm}><SVGIcon {...icons.times}/></button>
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
