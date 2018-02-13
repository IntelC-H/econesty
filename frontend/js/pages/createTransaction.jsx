import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { Button, Grid, GridUnit, Labelled } from 'app/components/elements';
import { Form, FormGroup, Input } from 'app/components/forms';

import { CollectionView, CollectionCreation } from 'app/components/api';
import { API, DummyAPICollection } from 'app/api';
import SearchField from 'app/components/searchfield';
import { Router } from 'app/components/routing';

function RequirementCreationForm({ collectionView }) {
  return (
    <Form aligned onSubmit={collectionView.saveElement}>
      <FormGroup>
        <Labelled label="Terms">
          <Input text name="text" />
        </Labelled>
        <Labelled label="User">
          <SearchField name="user"
                       api={API.user}
                       component={props => props.element.username} />
        </Labelled>
      </FormGroup>
      <Button action="submit">CREATE</Button>
    </Form>
  );
}

function RequirementCollection({ collectionView }) {
  let rs = collectionView.getElements();
  return (
   <div>
   {rs.map(r =>
       <Form aligned onSubmit={collectionView.saveElement}>
         <a
           className="form-delete-button fa fa-times"
           onClick={() => collectionView.deleteElement(r.id)}
         />
         <FormGroup>
           {r.id !== null && r.id !== undefined && <Input hidden name="id" value={r.id} /> }
           <Labelled label="Terms">
             <Input text name="text" value={r.text} />
           </Labelled>
           <Labelled label="User">
             <SearchField name="user"
                          api={API.user}
                          value={r.user}
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
  }

  onSubmit(obj) {
    obj.requirements = this.dummyCollection.getElements().map(r => {
      r.user_id = (r.user || {}).id || null;
      delete r.user;
      delete r.id;
      return r;
    });

    console.log("CREATING", obj);

    API.transaction.create(obj)
                   .catch(console.log)
                   .then(t => {
                     console.log("CREATED: ", t);
                     return Router.replace(API.transaction.baseURL + t.id);});
  }

  render({ matches }) {
    let act = matches.action;
    let buyer_id = act === "buy" ? API.getUserID() : parseInt(matches.id);
    let seller_id = act === "buy" ? parseInt(matches.id) : API.getUserID();

    return (
      <Grid>
        <GridUnit size="1" sm="4-24"/>
        <GridUnit size="1" sm="16-24">
          <div className="informational">
            <h3>Create a Transaction</h3>
            <p>This is the page you use to create a transaction.</p>
          </div>
          <Form aligned onSubmit={this.onSubmit}>
            <Input hidden name="buyer_id" value={buyer_id} />
            <Input hidden name="seller_id" value={seller_id} />

            {/* TODO: wallet selection */}

            <Labelled label="How much?">
              <Input number required name="amount" step="0.0001" min="0" cols="7" />
            </Labelled>
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
