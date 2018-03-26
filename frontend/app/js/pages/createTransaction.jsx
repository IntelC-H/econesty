import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { Table, Button, DeleteButton, SideMargins } from 'base/components/elements';
import { Router, SearchField, UserRow, DummyAPICollection, API,
         CollectionView, CollectionCreation, Form, FormGroup,
         Input, Select, Flex, Collapsible } from 'base/base';

function Requirement({ collectionView, CancelButton, element }) {
  let r = element;
  return (
    <tr>
      <td>
        <Form onSubmit={collectionView.saveElement} className="section">
          { r && <Input hidden name="id" value={r.id} /> }
          <Flex container direction="row" justifyContent="space-between">
            <Flex container direction="column" style={{width: "100%"}} basis="97%">
              <Flex container direction="row" justifyContent="space-between">
                <Flex container alignItems="center" className="ellipsis-text" paddingRight>Terms</Flex>
                <Flex height="100%"><Input text name="text" {...(r && {value: r.text})} /></Flex>
              </Flex>
              <Flex container direction="row" justifyContent="space-between">
                <Flex container alignItems="center" className="ellipsis-text" paddingRight>Onus Upon</Flex>
                <Flex height="100%">
                  <SearchField name="user"
                               api={API.user}
                               {...(r && {value: r.user})}
                               placeholder="find a user"
                               component={UserRow} />
                </Flex>
              </Flex>
              <Flex container direction="row" justifyContent="center">
                <Button action="submit"><i className="fa fa-save" /></Button>
                {CancelButton && <CancelButton />}
              </Flex>
            </Flex>
            { r && <DeleteButton onClick={() => collectionView.deleteElement(r.id)} /> }
          </Flex>
        </Form>
      </td>
    </tr>
  );
}

function RequirementCollection({ collectionView }) {
  let rs = collectionView.getElements();
  if (rs.length === 0) return null;
  let children = rs.map(r => h(Requirement, {
                               collectionView: collectionView,
                               element: r
                             }));
  return <Table striped>{children}</Table>;
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

            <Flex container wrap="wrap" alignItems="center" direction="row">
              <Flex container justifyContent="flex-start" alignItems="center" basis="25%" paddingRight marginTop marginBottom>How many BTC?</Flex>
              <Flex container justifyContent="flex-start" alignItems="center" basis="75%">
                <Input number required name="amount" step="0.0001" min="0" cols="7" />
              </Flex>
            </Flex>

            <Flex container wrap="wrap" alignItems="center" direction="row">
              <Flex container justifyContent="flex-start" alignItems="center" basis="25%" paddingRight marginTop marginBottom>{isSender ? "To Wallet" : "From Wallet"}</Flex>
              <Flex container justifyContent="flex-start" alignItems="center" basis="75%">
                <Select
                  options={this.makeWalletsPromise}
                  name={isSender ? "sender_wallet_id" : "recipient_wallet_id"}
                  transform={w => w.id}
                  faceTransform={w => w.private_key} />
              </Flex>
            </Flex>

            <CollectionView collection={this.dummyCollection}>
              <CollectionCreation createText={<div><i className="fas fa-plus" /> Requirement</div>}>
                <Requirement />
              </CollectionCreation>
              <RequirementCollection />
            </CollectionView>
            <Button action="submit">CREATE</Button>
          </FormGroup>
        </Form>
      </SideMargins>
    );
  }
}

export default CreateTransaction;
