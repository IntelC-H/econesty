import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { connect } from 'preact-redux';
import { Router, DummyAPICollection, API, DeleteButton, Button,
         CollectionView, Form, FormGroup, Input, Select, Flex, Loading } from 'base/base';
import { FlexControlBlock, SideMargins, UserRow, Save, Times, Plus } from 'app/common';
import { SearchField } from 'app/components/searchfield';
import style from 'app/style';
import { noSelect } from 'base/style/mixins';
import * as ActionCreators from 'app/redux/actionCreators';

const mapStateToProps = (state, ownProps) => {
  return {
    ...ownProps,
    loadingWallets: state.wallets.loading,
    walletError: state.wallets.error,
    wallets: state.wallets.wallets,
    transaction: state.transaction_in_progress[`${ownProps.sender_id}_${ownProps.recipient_id}`] || {}
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    ...ownProps,
    reloadWallets: () => dispatch(ActionCreators.reloadWallets()),
    update: (obj) => dispatch(ActionCreators.tipUpdate(ownProps.sender_id, ownProps.recipient_id, obj)),
    deleteInProgress: () => dispatch(ActionCreators.tipDelete(ownProps.sender_id, ownProps.recipient_id)),
    removeRequirement: (idx) => dispatch(ActionCreators.tipRemoveRequirement(ownProps.sender_id, ownProps.recipient_id, idx)),
    updateRequirement: (update, idx) => dispatch(ActionCreators.tipUpdateRequirement(ownProps.sender_id, ownProps.recipient_id, update, idx)),
    startRequirement: () => dispatch(ActionCreators.tipStartRequirement(ownProps.sender_id, ownProps.recipient_id))
  };
};

const TransactionForm = connect(mapStateToProps, mapDispatchToProps)(class TransactionForm extends Component {
  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
    this.updateAmount = this.updateAmount.bind(this);
    this.updateWallet = this.updateWallet.bind(this);
    this.updateReq = this.updateReq.bind(this);
  }

  componentDidMount() {
    this.props.reloadWallets();
    this.props.update({}); // ensure there's a transaction
  }

  onSubmit(e) {
    e.preventDefault(); // prevent form POST
    e.stopPropagation(); // enable submitting subforms without affecting parent forms.

    let obj = Object.assign({}, this.props.transaction);

    API.transaction.create(obj)
                   .then(t => {
      this.props.deleteInProgress();
      Router.replace(API.transaction.baseURL + t.id);
    });
  }

  updateAmount(e) {
    console.log(e.target.value);
    this.props.update({ amount: parseFloat(e.target.value) });
  }

  updateWallet(e) {
    let u = {};
    u[this.props.authenticatedAsSender ? "sender_wallet_id" : "recipient_wallet_id"] = e.target.value;
    this.props.update(u);
  }

  updateReq(name, idx) {
    return e => {
      let o = {};
      o[name] = e.target ? e.target.value : e;
      this.props.updateRequirement(o, idx);
    };
  }

  render({ authenticatedAsSender, sender_id, recipient_id, loadingWallets, walletError, wallets, transaction,
           updateRequirement, removeRequirement }) {
    const { amount, sender_wallet_id, recipient_wallet_id, requirements } = transaction;
    let wallet_id = authenticatedAsSender ? sender_wallet_id : recipient_wallet_id;
    let has_requirements = requirements && requirements.length > 0;
    return (
      <form onSubmit={this.onSubmit}>
        <Flex container wrap justifyContent="center" row>
          <FlexControlBlock label="How many BTC?">
            <input type="number" required step="0.0001" min="0" cols="7" value={`${amount}`} onChange={this.updateAmount} />
          </FlexControlBlock>
          { loadingWallets && <Loading /> }
          { !loadingWallets && walletError && <span>{walletError}</span>}
          { !loadingWallets && !walletError &&
          <FlexControlBlock label={authenticatedAsSender ? "From Wallet" : "Into Wallet"}>
            <select key="wallets" onChange={this.updateWallet}>
              <option value={null} selected={!wallet_id}>Select a wallet</option>
              {wallets.map(w => <option value={w.id} selected={w.id === wallet_id}>{w.private_key}</option>)}
            </select>
          </FlexControlBlock>}
        </Flex>
        <Flex container wrap>
          <Flex container justifyContent="space-between" alignItems="center" grow="1" basis="100%" marginTop marginBottom style={noSelect()}>
            Requirements
            <Button onClick={this.props.startRequirement}><Plus /></Button>
          </Flex>
          {has_requirements &&
          <Flex key="requirements" grow="1" style={style.table.base} column>
              {requirements.map((r, idx) =>
                <Flex container row style={{...style.table.row, ...Boolean(idx % 2) ? style.table.oddRow : {}}}>
                  <Flex container column grow="1">
                    <FlexControlBlock label="Terms">
                      <input type="text" value={r.text} onChange={this.updateReq("text", idx)} onBlur={this.updateReq("text", idx)} style={{ width: "100%" }} />
                    </FlexControlBlock>
                    <FlexControlBlock label="Onus Upon">
                      <SearchField name="user"
                                   onValue={this.updateReq("user", idx)}
                                   api={API.user}
                                   value={r.user}
                                   placeholder="find a user"
                                   component={UserRow} />
                    </FlexControlBlock>
                  </Flex>
                  <DeleteButton onClick={() => removeRequirement(idx)} />
                </Flex>)}
          </Flex>}
        </Flex>
        <Button action="submit" type="submit">CREATE</Button>
      </form>
    );
  }
});

class CreateTransaction extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render({ matches, loadingWallets, walletError, wallets }) {
    let act = matches.action;
    let isSender = act === "send";
    let sender_id = isSender ? API.getUserID() : parseInt(matches.id);
    let recipient_id = isSender ? parseInt(matches.id) : API.getUserID();

    return (
      <SideMargins>
        <Flex container justifyContent="center">
          <h1 style={{ ...style.text.primary, ...noSelect() }}>{isSender ? "Send" : "Receive"} Bitcoin</h1>
        </Flex>
        <TransactionForm authenticatedAsSender={isSender} recipient_id={recipient_id} sender_id={sender_id} />
      </SideMargins>
    );
  }
}


export default CreateTransaction;
