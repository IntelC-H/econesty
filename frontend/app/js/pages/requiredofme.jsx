import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { Table } from 'base/components/elements';
import { Anchor, Flex, Form, Input, CollectionView, API } from 'base/base';
import { RedX, GreenCheck, SideMargins, Frown } from 'app/common';
import style from 'app/style';

function RequirementRow({ collectionView, element }) {
  return (
    <tr>
      <td>
        <Flex container row alignItems="center">
          {element.rejected && <RedX />}
          {element.fulfilled && <GreenCheck />}
          <h3>Transaction <Anchor className="secondary" href={"/transaction/" + element.transaction.id}>#{element.transaction.id}</Anchor></h3>
        </Flex>
        {element.text && element.text.length > 0 && <p style={style.text.italic}>{element.text}</p>}
        {!element.acknowledged && <Form key={element.id + "-ack"}
              onSubmit={collectionView.saveElement}>
          <Input hidden name="id" value={element.id} />
          <Input hidden name="acknowledged" value={true} />
          <button action="submit">Acknowledge</button>
        </Form>}
        {element.acknowledged && !element.rejected &&
         <Flex container column alignItems="flex-start" justifyContent="center">
           {element.fulfilled && <p style={style.text.script}>{element.signature}</p>}
           {!element.fulfilled && <Form key={element.id + "-sign"}
                   onSubmit={collectionView.saveElement}>
             <Flex container row alignItems="center">
               <Input hidden name="id" value={element.id} />
               <Flex component={Input} margin
                     text
                     placeholder="Sign/type your name"
                     name="signature" value={element.signature} />
               <button action="submit">SIGN</button>
               <button onClick={() => collectionView.updateElement(element.id, { rejected: true, signature: null}) }>REJECT</button>
             </Flex>
           </Form>}
         </Flex>}
      </td>
    </tr>
  );
}

function RequirementsCollection({ collectionView }) {
  if (collectionView.getElements().length === 0) {
    return (
      <Flex margin style={style.element.frownMessage}>
        <Frown large />
        <p className="no-select">You don't have any requirements!</p>
      </Flex>
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
      <Flex container column alignItems="center" margin>
        <h1 className="no-select">My Requirements</h1>
      </Flex>
      <CollectionView collection={API.requirement.withParams({ user__id: API.getUserID() })}>
        <RequirementsCollection />
      </CollectionView>
    </SideMargins>
  );
}

export default RequiredOfMe;
