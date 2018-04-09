import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { Table } from 'base/components/elements';
import { Anchor, Flex, Form, Input, CollectionView, API } from 'base/base';
import { SideMargins, Frown } from 'app/common';
import style from 'app/style';
import BaseStyle from 'base/style';
import { noSelect } from 'base/style/mixins';

const rsStyle = {
  pageTitle: {
    ...noSelect(),
    ...style.text.primary,
    padding: `${BaseStyle.padding} 0`
  },
  reqTitle: {
    ...noSelect(),
    ...style.text.secondary,
    padding: `${BaseStyle.padding} 0`
  },
  signature: {
    ...style.text.script,
    padding: `${BaseStyle.padding} 0`
  },
  terms: {
    padding: `${BaseStyle.padding} 0`
  }
};

function RequirementRow({ collectionView, element }) {
  return (
    <tr>
      <td>
        <Flex container row alignItems="center">
          <p style={{ ...rsStyle.reqTitle, color: element.rejected ? "red" : element.fulfilled ? "green" : null }}>
            Transaction <Anchor style={style.text.secondary} href={"/transaction/" + element.transaction.id}>#{element.transaction.id}</Anchor>
          </p>
        </Flex>
        <Flex container justifyContent="space-between" alignItems="center">
          <div>
            <p style={rsStyle.terms}>{Boolean(element.text) ? element.text : "No written terms."}</p>
            {element.fulfilled && <p style={rsStyle.signature}>{element.signature}</p>}
          </div>
          {!element.acknowledged &&
          <Form key={element.id + "-ack"} onSubmit={collectionView.saveElement}>
            <Input hidden name="id" value={element.id} />
            <Input hidden name="acknowledged" value={true} />
            <button action="submit">Acknowledge</button>
          </Form>}
          {element.acknowledged && !element.rejected &&
          <Flex container column alignItems="flex-start" justifyContent="center">
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
        </Flex>
      </td>
    </tr>
  );
}

function RequirementsCollection({ collectionView }) {
  if (collectionView.getElements().length === 0) {
    return (
      <div style={style.element.frownMessage}>
        <Frown large />
        <p style={noSelect()}>You don't have any requirements!</p>
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
      <Flex container column alignItems="center" margin>
        <p style={rsStyle.pageTitle}>My Requirements</p>
      </Flex>
      <CollectionView collection={API.requirement.withParams({ user__id: API.getUserID() })}>
        <RequirementsCollection />
      </CollectionView>
    </SideMargins>
  );
}

export default RequiredOfMe;
