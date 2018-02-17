import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars

import { API } from 'app/api';
import { CollectionView } from 'app/components/api';
import { Button, SideMargins } from 'app/components/elements';
import { Form, Input } from 'app/components/forms';
import { Link } from 'app/components/routing';

function RequirementRow({ collectionView, element }) {
  let form = null;
  return (
    <div className="section">
      <h3>Transaction <Link className="secondary" href={"/transaction/" + element.transaction.id}>#{element.transaction.id}</Link>:</h3>
      <p>{element.text}</p>
      <Form key={element.id + "-ack"}
            ref={e => form = e}
            onSubmit={collectionView.saveElement}>
        <Input hidden name="id" value={element.id} />
        <Input checkbox
               placeholder="Acknowledged"
               disabled={element.acknowledged}
               onClick={() => form.submit()}
               name="acknowledged" value={element.acknowledged}/>
        <Input text
               disabled={Boolean(element.signature)}
               name="signature" value={element.signature}/>
        {!Boolean(element.signature) &&
         <Button action="submit">SIGN</Button>}
      </Form>
    </div>
  );
}

function RequirementsCollection({ collectionView }) {
  return <div>{collectionView.getElements().map(e =>
            <RequirementRow collectionView={collectionView} element={e} />)}</div>;
}

function RequiredOfMe(props) { // eslint-disable-line no-unused-vars
  return (
    <SideMargins>
      <CollectionView collection={API.requirement.withParams({ user__id: API.getUserID() })}>
        <RequirementsCollection />
      </CollectionView>
    </SideMargins>
  );
}

export default RequiredOfMe;
