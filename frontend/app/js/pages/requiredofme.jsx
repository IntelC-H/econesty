import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { Table, Button, SideMargins, Frown, RedX, GreenCheck } from 'base/components/elements';
import { Link, Flex, Form, Input, CollectionView, API, Collapsible } from 'base/base';

function RequirementRow({ collectionView, element }) {
  return (
    <tr>
      <td>
        <Flex container alignItems="center" direction="row">
          {element.rejected && <RedX />}
          {element.fulfilled && <GreenCheck />}
          <h3>Transaction <Link className="secondary" href={"/transaction/" + element.transaction.id}>#{element.transaction.id}</Link></h3>
        </Flex>
        {element.text && element.text.length > 0 && <p className="italic">{element.text}</p>}
        {!element.acknowledged && <Form key={element.id + "-ack"}
              onSubmit={collectionView.saveElement}>
          <Input hidden name="id" value={element.id} />
          <Input hidden name="acknowledged" value={true} />
          <Button action="submit">Acknowledge</Button>
        </Form>}
        {element.acknowledged && !element.rejected &&
          <Flex container alignItems="flex-start" justifyContent="center" direction="column">
              {!element.fulfilled && <Button onClick={() => collectionView.updateElement(element.id, { rejected: true, signature: null}) }>REJECT</Button>}
          <Form key={element.id + "-sign"}             
                  onSubmit={collectionView.saveElement}>
            <Flex container alignItems="center" direction="row">
              {Boolean(element.signature) &&
               <p className="script">{element.signature}</p>}
              {!Boolean(element.signature) && <Input hidden name="id" value={element.id} />}
              {!Boolean(element.signature) && <Input text
                     placeholder="Sign/type your name"
                     name="signature" value={element.signature} />}
              {!Boolean(element.signature) && !element.rejected && <Button action="submit">SIGN</Button>}
           </Flex>
         </Form>
         </Flex>}
      </td>
    </tr>
  );
}

function RequirementsCollection({ collectionView }) {
  if (collectionView.getElements().length === 0) {
    return (
      <div className="frown-message">
        <Frown large />
        <p>You don't have any requirements!</p>
      </div>
    );
  }
  return (
    <Table striped>
      {collectionView.getElements().map(e =>
        <RequirementRow collectionView={collectionView} element={e} />)}
    </Table>
  );
}

function RequiredOfMe(props) { // eslint-disable-line no-unused-vars
  return (
    <SideMargins>
      <Flex container alignItems="center" direction="column">
        <h1>My Requirements</h1>
        <p>Each time onus is put upon you in a transaction, the details of your responsibility will appear here.</p>
      </Flex>
      <CollectionView collection={API.requirement.withParams({ user__id: API.getUserID() })}>
        <RequirementsCollection />
      </CollectionView>
    </SideMargins>
  );
}

export default RequiredOfMe;
