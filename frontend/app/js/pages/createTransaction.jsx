import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { Table, DeleteButton } from 'base/components/elements';
import { Router, SearchField, UserRow, DummyAPICollection, API,
         CollectionView, Form, FormGroup, Input, Select, Flex, inheritClass } from 'base/base';
import { FlexControlBlock, SideMargins } from 'app/common';

function Requirement({ collectionView, closeAction, element, key }) {
  let r = element;
  return (
    <tr style={{width: "100%"}}>
      <td>
        <Form onSubmit={collectionView.saveElement}>
          { r && <Input hidden name="id" value={r.id} /> }
          <FormGroup>
            <Flex container wrap="wrap">
              <Flex container direction="column" grow="1">
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
                <Flex container direction="row" justifyContent="center">
                  <button type="submit"><i className="fa fa-save" /></button>
                  {closeAction && <button type="button" onClick={closeAction}><i className="fa fa-times" /></button>}
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
    let children = rs.map(r => h(Requirement, {
                                 collectionView: collectionView,
                                 element: r
                               }));
    return (
      <Flex container wrap="wrap">
        <Flex container justifyContent="space-between" alignItems="center" grow="1" basis="100%" marginTop marginBottom>
          Requirements
          {!showingCreate && <button onClick={this.showCreate}><i className="fas fa-plus"/></button>}
        </Flex>
        <Flex grow="1" basis="100%">
          <Table striped>
            {showingCreate && <Requirement key="non_collection" collectionView={collectionView} closeAction={this.hideCreate}/>}
            {children}
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
          <h1 className="primary">{isSender ? "Send" : "Receive"} Bitcoin</h1>
        </Flex>
        <Form onSubmit={this.onSubmit}>
          <FormGroup>
            <Input hidden name="sender_id" value={sender_id} />
            <Input hidden name="recipient_id" value={recipient_id} />

            <Flex container wrap="wrap" justifyContent="center">
              <Flex container wrap="wrap" alignItems="center" grow="1" marginLeft marginRight>
                <Flex container justifyContent="flex-start" alignItems="center" basis="100%" marginTop marginBottom>How many BTC?</Flex>
                <Flex container justifyContent="flex-start" alignItems="center" basis="100%">
                  <Input number required name="amount" step="0.0001" min="0" cols="7" />
                </Flex>
              </Flex>
              <Flex container wrap="wrap" alignItems="center" grow="1" marginLeft marginRight>
                <Flex container justifyContent="flex-start" alignItems="center" basis="100%" marginTop marginBottom>{isSender ? "From Wallet" : "Into Wallet"}</Flex>
                <Flex container justifyContent="flex-start" alignItems="center" basis="100%">
                  <Select
                    options={this.makeWalletsPromise}
                    name={isSender ? "sender_wallet_id" : "recipient_wallet_id"}
                    transform={w => w.id}
                    faceTransform={w => w.private_key} />
                </Flex>
              </Flex>
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
