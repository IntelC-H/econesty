import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { Grid, GridUnit, Money, Table } from 'app/components/elements';
import { CollectionView, ElementView } from 'app/components/api';
import { Link } from 'app/components/routing';
import { API } from 'app/api';

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
  return (
    <div className="center">
      <h1>Transaction #{t.id}{t.completed ? "" : " (INCOMPLETE)"}</h1>
      <h2 className="secondary"><UserLink user={t.seller} /> is transferring <Money currency={t.currency} value={t.offer} /> to <UserLink user={t.buyer}/> via {t.buyer_payment_data.kind}</h2>
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
          let fulfilled = (r.acknowledged || !r.acknowledgement_required)
                       && (Boolean(r.signature) || !r.signature_required);
          return <tr key={r.id}>
                   <td><UserLink user={r.user} /></td>
                   <td>{r.text}</td>
                   <td>{fulfilled ? "FULFILLED" : "UNFULFILLED"}</td>
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
        <CollectionView collection={API.requirement.forTransaction(matches.id)}>
          <TransactionRequirements />
        </CollectionView>
      </GridUnit>
      <GridUnit size="1" sm="4-24" />
    </Grid>

  );
}

export default TransactionDetail;
