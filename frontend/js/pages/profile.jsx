import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { Link } from 'app/components/routing';
import { API } from 'app/api';

import { Button, Grid, GridUnit, Image, Money } from 'app/components/elements';
import { withPromiseFactory, asyncCollection } from 'app/components/higher';

const dateOpts = { year: 'numeric', month: 'long', day: 'numeric' };
const formatDate = x => new Date(x).toLocaleString(navigator.language, dateOpts);

const Profile = props => {
  const userId = props.matches.id;

  const UserInfoView = withPromiseFactory(
    props => API.user.read(props.matches.id),
    props => {
      var user = props.object;
      return (
        <div className="user">
          <Image src={user.avatar_url} />
          <div className="primary">{user.first_name || "First Name"} {user.last_name || "Last Name"}</div>
          <div>@{user.username}</div>
          <div className="secondary">User number {user.id} since {formatDate(user.date_joined)}</div>
        </div>
      );
    }
  );
  const TransactionCollection = asyncCollection(
    () => <tr><th>Offer</th><th>Buyer</th><th>Seller</th></tr>,
    props => {
      var obj = props.object;
      return (
        <tr>
          <td><Money currency={obj.offer_currency} value={parseFloat(obj.offer)} /></td>
          <td><Link className="secondary" href={"/user/" + obj.buyer.id}>{obj.buyer.first_name} {obj.buyer.last_name} (@{obj.buyer.username})</Link></td>
          <td><Link className="secondary" href={"/user/" + obj.seller.id}>{obj.seller.first_name} {obj.seller.last_name} (@{obj.seller.username})</Link></td>
        </tr>
      );
    },
    page => API.paginate(API.user.transactions(userId, page), API.transaction)
  );

  return (
    <Grid>
      <GridUnit size="1" sm="4-24">
        <UserInfoView {...props} />
      </GridUnit>
      <GridUnit size="1" sm="16-24">
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
        <TransactionCollection {...props} />
      </GridUnit>
      <GridUnit size="1" sm="4-24" />
    </Grid>
  );
};

export default Profile;
