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
      className="inline secondary"
      href={"/user/" + user.id}>
      {user.first_name} {user.last_name} (@{user.username})
    </Link>
  );
}

function TransactionInfo({ elementView }) {
  let t = elementView.getElement();

  let needsSellerWallet = t.seller_wallet === null || t.seller_wallet === undefined;
  let needsBuyerWallet = t.buyer_wallet === null || t.buyer_wallet === undefined;
  let isBuyer = t.buyer.id === API.getUserID();
  let isSeller = t.seller.id === API.getUserID();

  return (
    <div className="center">
      <h1>Transaction #{t.id}</h1>
      <h2>{t.completed ? t.success ? "SUCCESS" : "FAILURE" : "INCOMPLETE"}</h2>
      <h3 className="secondary"><UserLink user={t.seller} /> is transferring BTC {parseFloat(t.amount)} to <UserLink user={t.buyer}/></h3>
      {t.error && <p>{t.error}</p>}

      {needsSellerWallet && isSeller && <Form aligned onSubmit={elementView.updateElement}>
        <FormGroup>
          <Input hidden name="id" value={t.id} />
          <Labelled label="Seller's Wallet">
            <Select
              options={makeWalletsPromise}
              name="seller_wallet_id"
              transform={w => w.id}
              faceTransform={w => w.private_key} />
          </Labelled>
          <Button action="submit">SAVE WALLET</Button>
        </FormGroup>
      </Form>}

      {needsBuyerWallet && isBuyer && <Form aligned onSubmit={elementView.updateElement}>
        <FormGroup>
          <Input hidden name="id" value={t.id} />
          <Labelled label="Buyer's Wallet">
            <Select
              options={makeWalletsPromise}
              name="buyer_wallet_id"
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
    <Table>
      <thead>
        <th>
          <td>User</td>
        </th>
        <th>
          <td>Text</td>
        </th>
        <th>
          <td>Status</td>
        </th>
      </thead>
      <tbody>
        {rs.map(r => {
          return <tr key={r.id}>
                   <td><UserLink user={r.user} /></td>
                   <td>{r.text}</td>
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
        <CollectionView collection={API.requirement.withParams({transaction__id: matches.id})}>
          <TransactionRequirements />
        </CollectionView>
      </GridUnit>
      <GridUnit size="1" sm="4-24" />
    </Grid>

  );
}

export default TransactionDetail;
