import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { Grid, GridUnit, Table, Labelled, Button } from 'app/components/elements';
import { CollectionView, ElementView } from 'app/components/api';
import { Form, FormGroup, Select, Input } from 'app/components/forms';
import { Link } from 'app/components/routing';
import { API } from 'app/api';

function makeWalletsPromise() {
  return API.user.append("/" + API.getUserID() + "/all_wallets")
                 .list(-1).then(({ results }) => results);
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
      <h2>{t.completed ? t.success ? "SUCCESS" : "FAILURE" : "INCOMPLETE"}</h2>
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
  return (
    <Table striped horizontal>
      <thead>
        <tr>
        <th>Text</th>
        <th>User</th>
        <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {rs.map(r => {
          return <tr key={r.id}>
                   <td>{r.text}</td>
                   <td><UserLink user={r.user} /></td>
                   <td>{r.fulfilled ? "FULFILLED" : "UNFULFILLED"}</td>
                 </tr>;
        })}
      </tbody>
    </Table>
  );
}

function TransactionDetail({ matches }) {
  return (
    <Grid>
      <GridUnit size="1" sm="4-24" />
      <GridUnit size="1" sm="16-24">
        <ElementView collection={API.transaction} elementID={matches.id}>
          <TransactionInfo />
        </ElementView>
        <CollectionView collection={API.requirement.withParams({transaction__id: matches.id})}
                        empty={null}>
          <TransactionRequirements />
        </CollectionView>
      </GridUnit>
      <GridUnit size="1" sm="4-24" />
    </Grid>

  );
}

export default TransactionDetail;
