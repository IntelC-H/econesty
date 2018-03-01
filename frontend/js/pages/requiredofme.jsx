import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars

import { API } from 'app/api';
import { CollectionView } from 'app/components/api';
import { Button, SideMargins, Labelled, Frown } from 'app/components/elements';
import { Form, Input } from 'app/components/forms';
import { Link } from 'app/components/routing';

function RequirementRow({ collectionView, element }) {
  let form = null;
  let rejectForm = null;
  return (
    <div className="section">
      <h3>Transaction <Link className="secondary" href={"/transaction/" + element.transaction.id}>#{element.transaction.id}</Link>:</h3>
      { element.text && element.text.length > 0 && <p className="italic">{element.text}</p>}
      {!element.fulfilled && !element.rejected &&
      <Form key={element.id + "rej"}
            ref={n => rejectForm = n}
            onSubmit={collectionView.saveElement}
            >
        <Input hidden name="id" value={element.id} />
        <Input hidden name="rejected" value={true} />
        <Button action="submit">REJECT</Button>
      </Form>}
      <Form key={element.id + "-ack"}
            ref={e => form = e}
            onSubmit={collectionView.saveElement}>
        <Input hidden name="id" value={element.id} />
        <Labelled label="Acknowledged">
          <Input checkbox
                 disabled={element.acknowledged}
                 onClick={() => form.submit()}
                 name="acknowledged" value={element.acknowledged}/>
        </Labelled>
        <Labelled label="Signature">
          <Input text
                 disabled={Boolean(element.signature)}
                 name="signature" value={element.signature}/>
        </Labelled>
        {!Boolean(element.signature) &&
         <div className="centered"><Button action="submit">SIGN</Button></div>}
      </Form>
    </div>
  );
}

function RequirementsCollection({ collectionView }) {
  if (collectionView.getElements().length === 0) return (
    <div className="frown-message">
      <Frown large />
      <p>You don't have any requirements!</p>
    </div>
  );
  return <div>{collectionView.getElements().map(e =>
            <RequirementRow collectionView={collectionView} element={e} />)}</div>;
}

function RequiredOfMe(props) { // eslint-disable-line no-unused-vars
  return (
    <SideMargins>
      <h1 className="center">Requirements of Me</h1>
      <CollectionView collection={API.requirement.withParams({ user__id: API.getUserID() })}>
        <RequirementsCollection />
      </CollectionView>
    </SideMargins>
  );
}

export default RequiredOfMe;
