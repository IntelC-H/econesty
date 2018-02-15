import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars

import { API } from 'app/api';
import { CollectionView } from 'app/components/api';
import { Table, Button, SideMargins } from 'app/components/elements';
import { Form, Input } from 'app/components/forms';
import { Link } from 'app/components/routing';

function RequirementRow({ collectionView, element }) {
  let form = null;
  return (
    <tr>
      <td>{element.text}</td>
      <td>
        <Form key={element.id + "-ack"}
              id={element.id + "-ack"}
              ref={e => form = e}
              onSubmit={obj => collectionView.updateElement(element.id, obj)}>
          <Input checkbox
                          disabled={element.acknowledged}
                          onClick={() => form.submit()}
                          name="acknowledged" value={element.acknowledged}/>
        </Form>
      </td>
      <td>
        <Form key={element.id + "-sig"} onSubmit={obj => collectionView.updateElement(element.id, obj)}>
          <Input text
                 disabled={Boolean(element.signature)}
                 name="signature" value={element.signature}/>
          {!Boolean(element.signature) &&
           <Button action="submit">SIGN</Button>}
        </Form>
      </td>
      <td>
        <Link className="secondary"
              href={"/transaction/" + element.transaction.id}>
          #{element.transaction.id}
        </Link>
      </td>
    </tr>
  );
}

function RequirementsCollection({ collectionView }) {
  return (
    <div className="collection">
      <Table striped horizontal>
        <thead>
          <tr>
            <th>Text</th>
            <th>Acknowledged</th>
            <th>Signature</th>
            <th>Transaction</th>
          </tr>
        </thead>
        <tbody>
          {collectionView.getElements().map(e =>
            <RequirementRow collectionView={collectionView} element={e} />)}
        </tbody>
      </Table>
    </div>
  );
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
