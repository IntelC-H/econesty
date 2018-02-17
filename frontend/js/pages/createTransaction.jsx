import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { Button, Grid, GridUnit, Labelled, DeleteButton } from 'app/components/elements';
import { Form, FormGroup, Input, Select } from 'app/components/forms';

import { CollectionView, CollectionCreation } from 'app/components/api';
import { API, DummyAPICollection } from 'app/api';
import SearchField from 'app/components/searchfield';
import { Router } from 'app/components/routing';

function RequirementCreationForm({ collectionView, CancelButton }) {
  return (
    <Form aligned onSubmit={collectionView.saveElement} className="section">
      <FormGroup>
        <Labelled label="Terms">
          <Input text name="text" />
        </Labelled>
        <Labelled label="Responsible User">
          <SearchField name="user"
                       api={API.user}
                       placeholder="find a user..."
                       component={props => props.element.username} />
        </Labelled>
      </FormGroup>
      <Button action="submit">ADD</Button>
      <CancelButton />
    </Form>
  );
}

function RequirementCollection({ collectionView }) {
  let rs = collectionView.getElements();
  if (rs.length === 0) return (
                         <h3 className="secondary">No Requirements</h3>
                       );
  return (
   <div>
   {rs.map(r =>
       <Form aligned onSubmit={collectionView.saveElement}>
         <DeleteButton onClick={() => collectionView.deleteElement(r.id)} />
         <FormGroup>
           {r.id !== null && r.id !== undefined && <Input hidden name="id" value={r.id} /> }
           <Labelled label="Terms">
             <Input text name="text" value={r.text} />
           </Labelled>
           <Labelled label="Responsible User">
             <SearchField name="user"
                          api={API.user}
                          value={r.user}
                          placeholder="find a user..."
                          component={props => props.element.username} />
           </Labelled>
         </FormGroup>
         <Button action="submit">SAVE</Button>
       </Form>)}
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
    return API.user.append("/" + API.getUserID() + "/all_wallets")
                   .list(-1).then(({ results }) => results);
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
      <Grid>
        <GridUnit size="1" sm="4-24"/>
        <GridUnit size="1" sm="16-24">
          <div className="section">
            <h1 className="primary">{isSender ? "Send BTC" : "Receive BTC"}</h1>
          </div>
          <Form aligned onSubmit={this.onSubmit}>
            <Input hidden name="sender_id" value={sender_id} />
            <Input hidden name="recipient_id" value={recipient_id} />

            <Labelled label="Your Wallet">
              <Select
                options={this.makeWalletsPromise}
                name={isSender ? "sender_wallet_id" : "recipient_wallet_id"}
                transform={w => w.id}
                faceTransform={w => w.private_key} />
            </Labelled>

            <Labelled label="How much?">
              <Input number required name="amount" step="0.0001" min="0" cols="7" />
            </Labelled>

            <h2>Requirements for Transaction:</h2>
            <CollectionView collection={this.dummyCollection}>
              <CollectionCreation createText="+ Requirement">
                <RequirementCreationForm />
              </CollectionCreation>
              <RequirementCollection />
            </CollectionView>
            <Button action="submit">CREATE</Button>
          </Form>
        </GridUnit>
        <GridUnit size="1" sm="4-24"/>
      </Grid>
    );
  }
}

export default CreateTransaction;
