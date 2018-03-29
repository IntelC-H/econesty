import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { BTC, RedX, GreenCheck, Warning } from 'app/common';
import { Table, XOverflowable, Frown } from 'base/components/elements';
import { Link, Router, API, CollectionView, ElementView, Form,
         FormGroup, Input, Flex } from 'base/base';

const dateOpts = { year: 'numeric', month: 'long', day: 'numeric' };
const formatDate = x => new Date(x).toLocaleString(navigator.language, dateOpts);

function BriefUserInfo({ user }) {
  return (
    <span className="secondary">
      {user.first_name} {user.last_name} (@{user.username})
    </span>
  );
}

function NoTransactions({ userId }) {
  let isMe = userId === API.getUserID();
  return (
    <div className="frown-message">
      <Frown large />
      {isMe && <p>No transactions yet!</p>}
      {!isMe && <p>No transactions with this user yet!</p>}
    </div>
  );
}

function TransactionCollectionBody({ collectionView, userId }) {
  let es = collectionView.getElements();

  return (
    <XOverflowable>
      <Table striped selectable>
        <thead>
          <tr><th>#</th><th>Amount</th><th>Sender</th><th>Recipient</th><th></th></tr>
        </thead>
        {es.length > 0 && <tbody>
          {es.map(obj =>
            <tr key={obj.id} onClick={() => Router.push("/transaction/" + obj.id)}>
              <td>
                {obj.id}
              </td>
              <td>
                <span><BTC/> {parseFloat(obj.amount)}</span>
              </td>
              <td>
                <BriefUserInfo user={obj.sender} />
              </td>
              <td>
                <BriefUserInfo user={obj.recipient} />
              </td>
              <td>
                {obj.completed ?
                   obj.success ? <GreenCheck /> : <Warning />
                   :
                   obj.rejected ? <RedX /> : null}
              </td>
            </tr>
          )}
        </tbody>}
      </Table>
      {es.length === 0 && <NoTransactions userId={userId} />}
    </XOverflowable>
  );
}

function User({ elementView }) {
  if (elementView.getElement().is_me) return <EditableUserRepresentation elementView={elementView} />;
  return <UserRepresentation elementView={elementView} />;
}

function UserRepresentation({ elementView }) {
  let user = elementView.getElement();
  return (
    <div className="user">
      <img src={user.avatar_url} />
      <div className="primary">{user.first_name || "First Name"} {user.last_name || "Last Name"}</div>
      <div className="tertiary">(@{user.username})</div>
      <div className="secondary">User #{user.id}, since {formatDate(user.date_joined)}</div>
    </div>
  );
}

function EditableUserRepresentation({ elementView }) {
  let user = elementView.getElement();
  return (
    <div className="user editable">
      <img src={user.avatar_url} />
      <Form onSubmit={elementView.updateElement}>
        <FormGroup>
          <Input text name="first_name" autocomplete="given-name" placeholder="First name" value={user.first_name} />
          <Input text name="last_name" autocomplete="family-name" placeholder="Last name" value={user.last_name} />
        </FormGroup>
        <FormGroup>
          <Input text name="username" placeholder="Username" value={user.username} />
          <Input text name="email" autocomplete="email" placeholder="email" value={user.email} />
        </FormGroup>
        <button action="submit">Save</button>
      </Form>
    </div>
  );
}

function Profile(props) {
  const userId = parseInt(props.matches.id);
  return (
    <Flex container direction="column" alignItems="center">
      <Flex basis="50%">
        <ElementView collection={API.user} elementID={userId}>
          <User />
        </ElementView>
      </Flex>
      <Flex container direction="column" grow="1" basis="100%" style={{maxWidth:"100%", width: "100%"}}>
        <Flex container className="profile-button-group"
                        justifyContent="flex-start" direction="row" wrap="wrap">
          {userId !== API.getUserID() &&
            <Link
              component={'button'}
              href={API.user.baseURL + userId + "/transaction/send"}
            >Send BTC</Link>}
            {userId !== API.getUserID() &&
            <Link
              component={'button'}
              href={API.user.baseURL + userId + "/transaction/receive"}
            >Receive BTC</Link>}
            {userId === API.getUserID() &&
            <Link
              component={'button'}
              href="/wallets"
            >Wallets</Link>}
            {userId === API.getUserID() &&
            <Link
              component={'button'}
              href="/required"
            >Required</Link>}
            {userId === API.getUserID() &&
             <button
               onClick={() => {
                 API.networking("DELETE", "/token/clear", {}, {}).then(() => {
                   API.clearAuth();
                   Router.push("/");
                 });
               }}
             >Log Out</button>}
        </Flex>
        <CollectionView collection={API.user.append("/" + userId + "/transactions")}>
          <TransactionCollectionBody userId={userId} />
        </CollectionView>
      </Flex>
    </Flex>
  );
}

export default Profile;
