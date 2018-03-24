import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { Table, Labelled, Button, XOverflowable, SideMargins } from 'base/components/elements';
import { CollectionView } from 'base/components/collectionview';
import { ElementView } from 'base/components/elementview';
import { Form, FormGroup, Select, Input } from 'base/components/forms';
import { Link } from 'base/components/routing';
import { API } from 'base/api';

function makeWalletsPromise() {
  return API.wallet.withParams({ user__id: API.getUserID() }).listAll();
}

function UserLink({ user }) {
  return (
    <Link
      className="userlink secondary"
      href={"/user/" + user.id}>
      {user.first_name} {user.last_name} (@{user.username})
    </Link>
  );
}

function TransactionInfo({ elementView }) {
  let t = elementView.getElement();

  let needsRecipientWallet = t.recipient_wallet === null || t.recipient_wallet === undefined;
  let needsSenderWallet = t.sender_wallet === null || t.sender_wallet === undefined;
  let isSender = t.sender.id === API.getUserID();
  let isRecipient = t.recipient.id === API.getUserID();

  return (
    <div className="center">
      <h1>Transaction #{t.id}</h1>
      <h2>{t.completed ?
             t.success ? "SUCCESS" : "FAILURE"
             :
             t.rejected ? "REJECTED" : "INCOMPLETE"}</h2>
      <h3 className="secondary"><UserLink user={t.recipient} /> is sending BTC {parseFloat(t.amount)} to <UserLink user={t.sender}/></h3>
      {t.error && <p>{t.error}</p>}

      {needsRecipientWallet && isRecipient && <Form onSubmit={elementView.updateElement}>
        <FormGroup>
          <Input hidden name="id" value={t.id} />
          <Labelled label="Recipient's Wallet">
            <Select
              options={makeWalletsPromise}
              name="recipient_wallet_id"
              transform={w => w.id}
              faceTransform={w => w.private_key} />
          </Labelled>
          <Button action="submit">SAVE WALLET</Button>
        </FormGroup>
      </Form>}

      {needsSenderWallet && isSender && <Form onSubmit={elementView.updateElement}>
        <FormGroup>
          <Input hidden name="id" value={t.id} />
          <Labelled label="Sender's Wallet">
            <Select
              options={makeWalletsPromise}
              name="sender_wallet_id"
              transform={w => w.id}
              faceTransform={w => w.private_key} />
          </Labelled>
          <Button action="submit">SAVE WALLET</Button>
        </FormGroup>
      </Form>}

    </div>
  );
}

function TransactionRequirements({ collectionView }) {
  let rs = collectionView.getElements();

  if (rs.count === 0) return null;

  return (
    <XOverflowable>
      <Table striped horizontal>
        <thead>
          <tr>
          <th>Requirement</th>
          <th>User</th>
          <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rs.map(r => {
            return <tr key={r.id}>
                     <td>{r.text}</td>
                     <td><UserLink user={r.user} /></td>
                     <td>{r.fulfilled ? "FULFILLED" : r.rejected ? "REJECTED" : "UNFULFILLED"}</td>
                   </tr>;
          })}
        </tbody>
      </Table>
    </XOverflowable>
  );
}

function TransactionDetail({ matches }) {
  return (
    <SideMargins>
      <ElementView collection={API.transaction} elementID={matches.id}>
        <TransactionInfo />
      </ElementView>
      <CollectionView collection={API.requirement.withParams({transaction__id: matches.id})}>
        <TransactionRequirements />
      </CollectionView>
    </SideMargins>
  );
}

export default TransactionDetail;
