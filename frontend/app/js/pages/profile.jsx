import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { XOverflowable, Frown, BTC, RedX, GreenCheck, Warning } from 'app/common';
import { Table } from 'base/components/elements';
import { Anchor, Router, API, CollectionView, ElementView, Form,
         FormGroup, Input, Flex } from 'base/base';

import BaseStyles from 'base/style';
import style from 'app/style';

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
    <Flex margin style={style.element.frownMessage}>
      <Frown large />
      {isMe && <p className="no-select">No transactions yet!</p>}
      {!isMe && <p className="no-select">No transactions with this user yet!</p>}
    </Flex>
  );
}

function User({ elementView }) {
  if (elementView.getElement().is_me) return <EditableUserRepresentation elementView={elementView} />;
  return <UserRepresentation elementView={elementView} />;
}

function UserRepresentation({ elementView }) {
  let user = elementView.getElement();
  return (
    <Flex container column alignItems="center">
      <Flex margin component='img' src={user.avatar_url} style={style.shape.circular} />
      <Flex margin>
        <div className="primary">{user.first_name || "First Name"} {user.last_name || "Last Name"}</div>
        <div className="secondary">@{user.username}</div>
      </Flex>
    </Flex>
  );
}

function EditableUserRepresentation({ elementView }) {
  let user = elementView.getElement();
  return (
    <Flex container column alignItems="center">
      <img src={user.avatar_url} style={style.shape.circular} />
      <Flex container column alignItems="center" component={Form} onSubmit={elementView.updateElement}>
        <FormGroup>
          <Input text name="first_name" autocomplete="given-name" placeholder="First name" value={user.first_name} />
          <Input text name="last_name" autocomplete="family-name" placeholder="Last name" value={user.last_name} />
        </FormGroup>
        <FormGroup>
          <Input text name="username" placeholder="Username" value={user.username} />
          <Input text name="email" autocomplete="email" placeholder="email" value={user.email} />
        </FormGroup>
        <button action="submit">Save</button>
      </Flex>
    </Flex>
  );
}

function TransactionCollectionBody({ collectionView, userId }) {
  let es = collectionView.getElements();

  if (es.length === 0) return <NoTransactions userId={userId} />;

  return (
    <XOverflowable>
      <Table striped selectable>
        <thead className="no-select">
          <tr><th>#</th><th/><th>Sender</th><th>Recipient</th><th></th></tr>
        </thead>
        <tbody>
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
        </tbody>
      </Table>
    </XOverflowable>
  );
}

function Profile({ matches }) {
  const userId = parseInt(matches.id);
  const isAuthenticatedUser = userId === API.getUserID();
  return (
    <Flex container column alignItems="center">
      <Flex basis="50%">
        <ElementView collection={API.user} elementID={userId}>
          <User />
        </ElementView>
      </Flex>
      <Flex container column grow="1" basis="100%" style={{maxWidth:"100%", width: "100%"}}>
        <Flex container row className="profile-button-group" justifyContent="flex-start" wrap>
          {!isAuthenticatedUser &&
            <Anchor
              component='button'
              href={API.user.baseURL + userId + "/transaction/send"}
            >Send BTC</Anchor>}
            {!isAuthenticatedUser &&
            <Anchor
              component='button'
              href={API.user.baseURL + userId + "/transaction/receive"}
            >Receive BTC</Anchor>}
            {isAuthenticatedUser &&
            <Anchor
              component='button'
              href="/wallets"
            >Wallets</Anchor>}
            {isAuthenticatedUser &&
            <Anchor
              component='button'
              href="/required"
            >Required</Anchor>}
            {isAuthenticatedUser &&
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
