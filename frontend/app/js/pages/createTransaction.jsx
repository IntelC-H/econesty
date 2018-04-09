import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { Table } from 'base/components/elements';
import { Router, DummyAPICollection, API, DeleteButton,
         CollectionView, Form, FormGroup, Input, Select, Flex } from 'base/base';
import { FlexControlBlock, SideMargins, UserRow, Save, Times, Plus } from 'app/common';
import { SearchField } from 'app/components/searchfield';
import style from 'app/style';
import { noSelect } from 'base/style/mixins';

function Requirement({ collectionView, closeAction, element }) {
  let r = element;
  return (
    <tr style={{width: "100%"}}>
      <td>
        <Form onSubmit={collectionView.saveElement}>
          { r && <Input hidden name="id" value={r.id} /> }
          <FormGroup>
            <Flex container>
              <Flex container column grow="1">
                <FlexControlBlock label="Terms">
                  <Input text name="text" {...(r && {value: r.text})} />
                </FlexControlBlock>
                <FlexControlBlock label="Onus Upon">
                  <SearchField name="user"
                               api={API.user}
                               {...(r && {value: r.user})}
                               placeholder="find a user"
                               component={UserRow} />
                </FlexControlBlock>
                <Flex container row justifyContent="center">
                  <button type="submit"><Save /></button>
                  {closeAction && <button type="button" onClick={closeAction}><Times /></button>}
                </Flex>
              </Flex>
              { r && <DeleteButton onClick={() => collectionView.deleteElement(r.id)} /> }
            </Flex>
          </FormGroup>
        </Form>
      </td>
    </tr>
  );
}

class RequirementCollection extends Component {
  constructor(props) {
    super(props);
    this.state = { showingCreate: false };
    this.hideCreate = this.hideCreate.bind(this);
    this.showCreate = this.showCreate.bind(this);
  }

  hideCreate() {
    this.setState(st => ({ ...st, showingCreate: false }));
  }

  showCreate() {
    this.setState(st => ({ ...st, showingCreate: true }));
  }

  render({ collectionView }, { showingCreate }) {
    let rs = collectionView.getElements();
    return (
      <Flex container wrap>
        <Flex container justifyContent="space-between" alignItems="center" grow="1" basis="100%" marginTop marginBottom>
          Requirements
          {!showingCreate && <button onClick={this.showCreate}><Plus /></button>}
        </Flex>
        <Flex grow="1" basis="100%">
          <Table striped>
            {showingCreate &&
            <Requirement key="non_collection" collectionView={collectionView} closeAction={this.hideCreate}/>}
            {rs.map(r => h(Requirement, {
                           collectionView: collectionView,
                           element: r
                         }))}
          </Table>
        </Flex>
      </Flex>
    );
  }
}

class CreateTransaction extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.onSubmit = this.onSubmit.bind(this);
    this.dummyCollection = new DummyAPICollection();
    this.makeWalletsPromise = this.makeWalletsPromise.bind(this);
  }

  makeWalletsPromise() {
    return API.wallet.withParams({ user__id: API.getUserID() }).listAll();
  }

  onSubmit(obj) {
    obj.requirements = this.dummyCollection.getElements().map(r => {
      r.user_id = (r.user || {}).id || null;
      delete r.user;
      delete r.id;
      return r;
    });

    API.transaction.create(obj)
                   .then(t => Router.replace(API.transaction.baseURL + t.id));
  }

  render({ matches }) {
    let act = matches.action;
    let isSender = act === "send";
    let sender_id = isSender ? API.getUserID() : parseInt(matches.id);
    let recipient_id = isSender ? parseInt(matches.id) : API.getUserID();

    return (
      <SideMargins>
        <Flex container justifyContent="center">
          <h1 style={{ ...style.text.primary, ...noSelect() }}>{isSender ? "Send" : "Receive"} Bitcoin</h1>
        </Flex>
        <Form onSubmit={this.onSubmit}>
          <FormGroup>
            <Input hidden name="sender_id" value={sender_id} />
            <Input hidden name="recipient_id" value={recipient_id} />

            <Flex container wrap justifyContent="center">
              <FlexControlBlock label="How many BTC?">
                <Input number required name="amount" step="0.0001" min="0" cols="7" />
              </FlexControlBlock>
              <FlexControlBlock label={isSender ? "From Wallet" : "Into Wallet"}>
                <Select
                  options={this.makeWalletsPromise}
                  name={isSender ? "sender_wallet_id" : "recipient_wallet_id"}
                  transform={w => w.id}
                  faceTransform={w => w.private_key} />
              </FlexControlBlock>
            </Flex>
            <CollectionView collection={this.dummyCollection}>
              <RequirementCollection />
            </CollectionView>
            <button action="submit" type="submit">CREATE</button>
          </FormGroup>
        </Form>
      </SideMargins>
    );
  }
}

export default CreateTransaction;
