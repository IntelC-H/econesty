import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { connect } from 'preact-redux';
import { SideMargins, Save, Times, Plus } from 'app/common';
import { Flex, Collapsible, FadeTransition, Loading,
         API, Form, Input, DeleteButton, Button } from 'base/base';
import style from 'app/style';
import palette from 'app/palette';
import BaseStyles from 'base/style';
import { noSelect } from 'base/style/mixins';
import { createWallet, deleteWallet, reloadWallets } from 'app/redux/actionCreators';

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
    this.setState(st => ({ ...st, formVisible: true }));
  }

  closeForm() {
    this.setState(st => ({ ...st, formVisible: false }));
  }

  render({ collectionView }, { formVisible }) {
    if (!formVisible) {
      return (
        <Flex container row wrap margin justifyContent="center">
          <Button onClick={() => this.props.createWallet()}>Generate</Button>
          <Button onClick={this.openForm}><Plus /></Button>
        </Flex>
      );
    }
    return (
      <Flex component={Form} onSubmit={this.props.createWallet}
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

const WalletsTable = ({ wallets, deleteWallet }) => {
  return (
    <Flex container column style={style.table.base}>
      {wallets.map((w, idx) =>
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
          <DeleteButton onClick={() => deleteWallet(w.id)} />
        </Flex>)}
    </Flex>
  );
};

const Wallets_mapStateToProps = (state, ownProps) => {
  return {
    ...ownProps,
    ...state.wallets
  };
};

const Wallets_mapDispatchToProps = (dispatch, ownProps) => {
  return {
    ...ownProps,
    reloadWallets: () => dispatch(reloadWallets()),
    createWallet: (wallet = null) => dispatch(createWallet(wallet)),
    deleteWallet: (walletId) => dispatch(deleteWallet(walletId))
  };
};

const Wallets = connect(Wallets_mapStateToProps, Wallets_mapDispatchToProps)(class Wallets extends Component {
  componentDidMount() {
    this.props.reloadWallets();
  }

  render() {
    const { wallets, loading, error, createWallet, deleteWallet } = this.props;
    console.log(typeof wallets);
    return (
      <SideMargins>
        <Flex component="h1" style={{ ...style.text.primary, ...noSelect() }}
              container justifyContent="center">
          Your Wallets
        </Flex>
        <FadeTransition>
          {loading && <Loading fadeOut fadeIn key="loading" />}
          {!loading && error && <span fadeIn key="error">{error}</span>}
          {!loading && !error && <WalletCreationControls fadeIn key="controls" createWallet={createWallet} />}
          {!loading && !error && <WalletsTable fadeIn key="wallets" wallets={wallets} deleteWallet={deleteWallet} />}
        </FadeTransition>
      </SideMargins>
    );
  }
});

export { Wallets };
export default Wallets;
