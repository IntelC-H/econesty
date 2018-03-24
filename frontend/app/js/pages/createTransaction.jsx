import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { Button, Labelled, DeleteButton, SideMargins } from 'base/components/elements';
import { Router, SearchField, UserRow, DummyAPICollection, API,
         CollectionView, CollectionCreation, Form, FormGroup,
         Input, Select } from 'base/base';

function Requirement({ collectionView, CancelButton, element }) {
  let r = element;
  return (
    <Form onSubmit={collectionView.saveElement} className="section">
      { r && <DeleteButton onClick={() => collectionView.deleteElement(r.id)} /> }
      { r && <Input hidden name="id" value={r.id} /> }
      <FormGroup>
        <Labelled label="Terms">
          <Input text name="text" {...(r && {value: r.text})} />
        </Labelled>
        <Labelled label="Onus upon">
          <SearchField name="user"
                       api={API.user}
                       {...(r && {value: r.user})}
                       placeholder="find a user"
                       component={UserRow} />
        </Labelled>
      </FormGroup>
      <div className="centered">
        <Button action="submit">{r ? "SAVE" : "ADD"}</Button>
        {CancelButton && <CancelButton />}
      </div>
    </Form>
  );
}

function RequirementCollection({ collectionView }) {
  let rs = collectionView.getElements();
  if (rs.length === 0) return null;
  let children = rs.map(r => h(Requirement, {
                               collectionView: collectionView,
                               element: r
                             }));
  return h('div', {}, children);
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
        <div className="section">
          <h1 className="primary">{isSender ? "Send" : "Receive"} Bitcoin</h1>
        </div>
        <Form onSubmit={this.onSubmit}>
          <FormGroup>
            <Input hidden name="sender_id" value={sender_id} />
            <Input hidden name="recipient_id" value={recipient_id} />

            <Labelled label="How many BTC?">
              <Input number required name="amount" step="0.0001" min="0" cols="7" />
            </Labelled>

            <Labelled label="From wallet">
              <Select
                options={this.makeWalletsPromise}
                name={isSender ? "sender_wallet_id" : "recipient_wallet_id"}
                transform={w => w.id}
                faceTransform={w => w.private_key} />
            </Labelled>

            <h2>With Requirements:</h2>
            <CollectionView collection={this.dummyCollection}>
              <CollectionCreation createText="+ Requirement">
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
