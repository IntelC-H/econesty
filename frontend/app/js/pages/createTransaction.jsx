import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { Table, Button, DeleteButton, SideMargins } from 'base/components/elements';
import { Router, SearchField, UserRow, DummyAPICollection, API,
         CollectionView, CollectionCreation, Form, FormGroup,
         Input, Select, Flex, Collapsible, RevealButton } from 'base/base';

function FlexControlBlock({ label, children }) {
  return (
    <Flex container direction="row" wrap="wrap" alignItems="center" grow="1">
      <Flex container className="ellipsis-text" justifyContent="flex-start" alignItems="center" basis="100%">
        {label}
      </Flex>
      <Flex container justifyContent="flex-start" alignItems="center" basis="100%">
        {children}
      </Flex>
    </Flex>
  );
}

function Requirement({ collectionView, revealButton, element }) {
  let r = element;
  return (
    <tr style={{width: "100%"}}>
      <td>
        <Form onSubmit={console.log/*collectionView.saveElement*/} className="section">
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
                  <Button action="submit"><i className="fa fa-save" /></Button>
                  {revealButton && <Button onClick={revealButton.close}><i className="fa fa-times" /></Button>}
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

function RequirementCollection({ collectionView }) {
  let rs = collectionView.getElements();
  let children = rs.map(r => h(Requirement, {
                               collectionView: collectionView,
                               element: r
                             }));
  return (
    <div>
       <Table striped>
         <RevealButton label={<div><i className="fas fa-plus" /> Requirement</div>}>
           <Requirement collectionView={collectionView}/>
         </RevealButton>
         {children}
       </Table>
    </div>
  );
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
    console.log("OBJ TWO", obj);
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
                <Flex container justifyContent="flex-start" alignItems="center" basis="100%" marginTop marginBottom>{isSender ? "To Wallet" : "From Wallet"}</Flex>
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
            <Button action="submit" type="submit">CREATE</Button>
          </FormGroup>
        </Form>
      </SideMargins>
    );
  }
}

export default CreateTransaction;
