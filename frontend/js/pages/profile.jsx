import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { Link } from 'app/components/routing';
import { API } from 'app/api';

import { Button, Grid, GridUnit, Image, Money, Table } from 'app/components/elements';
import { CollectionView, ElementView } from 'app/components/api';

const dateOpts = { year: 'numeric', month: 'long', day: 'numeric' };
const formatDate = x => new Date(x).toLocaleString(navigator.language, dateOpts);

function UserLink({ user }) {
  return (
    <Link
      className="secondary"
      href={"/user/" + user.id}>
      {user.first_name} {user.last_name} (@{user.username})
    </Link>
  );
}

function TransactionCollectionBody({ collectionView }) {
  return (
    <div className="collection">
      <Table striped horizontal>
        <thead>
          <tr><th>Offer</th><th>Buyer</th><th>Seller</th></tr>
        </thead>
        <tbody>
          {collectionView.getElements().map(obj =>
            <tr key={obj.id}>
              <td>
                <Money
                  currency={obj.offer_currency}
                  value={parseFloat(obj.offer)} />
              </td>
              <td>
                <UserLink user={obj.buyer} />
              </td>
              <td>
                <UserLink user={obj.seller} />
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}

function UserRepresentation({ elementView }) {
  let user = elementView.getElement();
  return (
    <div className="user">
      <Image src={user.avatar_url} />
      <div className="primary">{user.first_name || "First Name"} {user.last_name || "Last Name"}</div>
      <div className="tertiary">(@{user.username})</div>
      <div className="secondary">User #{user.id}, since {formatDate(user.date_joined)}</div>
      {user.is_me && <Link
        component={Button}
        className="margined raised"
        href="/payment"
      >Payment Options</Link>}
    </div>
  );
}

function Profile(props) {
  const userId = props.matches.id;

  return (
    <Grid>
      <GridUnit size="1" sm="1-4">
        <ElementView collection={API.user} elementID={userId}>
          <UserRepresentation />
        </ElementView>
      </GridUnit>
      <GridUnit size="1" sm="17-24">
        <div className="profile-button-group">
          <Link
            component={Button}
            className="margined raised"
            href={"/user/" + userId + "/transaction/buy"}
          >Buy From</Link>
          <Link
            component={Button}
            className="margined raised"
            href={"/user/" + userId + "/transaction/sell"}
          >Sell To</Link>
        </div>
        <CollectionView collection={API.user.transactions(userId)}>
          <TransactionCollectionBody />
        </CollectionView>
      </GridUnit>
      <GridUnit size="1" sm="1-24" />
    </Grid>
  );
}

export default Profile;
