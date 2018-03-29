import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { Table, Frown } from 'base/components/elements';
import { Link, Flex, Form, Input, CollectionView, API } from 'base/base';
import { RedX, GreenCheck, SideMargins } from 'app/common';

function RequirementRow({ collectionView, element }) {
  return (
    <tr>
      <td>
        <Flex container row alignItems="center">
          {element.rejected && <RedX />}
          {element.fulfilled && <GreenCheck />}
          <h3>Transaction <Link className="secondary" href={"/transaction/" + element.transaction.id}>#{element.transaction.id}</Link></h3>
        </Flex>
        {element.text && element.text.length > 0 && <p className="italic">{element.text}</p>}
        {!element.acknowledged && <Form key={element.id + "-ack"}
              onSubmit={collectionView.saveElement}>
          <Input hidden name="id" value={element.id} />
          <Input hidden name="acknowledged" value={true} />
          <button action="submit">Acknowledge</button>
        </Form>}
        {element.acknowledged && !element.rejected &&
         <Flex container column alignItems="flex-start" justifyContent="center">
           <Form key={element.id + "-sign"}
                   onSubmit={collectionView.saveElement}>
             <Flex container row alignItems="center">
               {Boolean(element.signature) && <p className="script">{element.signature}</p>}
               {!Boolean(element.signature) && <Input hidden name="id" value={element.id} />}
               {!Boolean(element.signature) && <Input text
                      placeholder="Sign/type your name"
                      name="signature" value={element.signature} />}
               {!Boolean(element.signature) && !element.rejected && <button action="submit">SIGN</button>}
               {!element.fulfilled && <button onClick={() => collectionView.updateElement(element.id, { rejected: true, signature: null}) }>REJECT</button>}
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
        <p className="no-select">You don't have any requirements!</p>
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
      <Flex container column alignItems="center">
        <h1 className="no-select">My Requirements</h1>
        <p className="no-select">Each time onus is put upon you in a transaction, the details of your responsibility will appear here.</p>
      </Flex>
      <CollectionView collection={API.requirement.withParams({ user__id: API.getUserID() })}>
        <RequirementsCollection />
      </CollectionView>
    </SideMargins>
  );
}

export default RequiredOfMe;
