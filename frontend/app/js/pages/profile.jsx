import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { XOverflowable, Frown, BTC, SideMargins } from 'app/common';
import { Table } from 'base/components/elements';
import { Anchor, Button, Router, API, CollectionView, ElementView, Flex } from 'base/base';

import BaseStyles from 'base/style';
import { noSelect } from 'base/style/mixins';
import style from 'app/style';

const profileStyle = {
  primaryAvatar: {
    height: "7em",
    width: "7em",
    borderRadius: BaseStyles.border.radius,
    objectFit: "contain",
    margin: BaseStyles.padding
  },
  userFullName: {
    ...style.text.primary,
    marginBottom: BaseStyles.padding,
    marginLeft: BaseStyles.padding,
    width: "content"
  },
  userUsername: {
    ...style.text.secondary,
    margin: BaseStyles.padding
  },
  userEditProfile: {
    ...style.text.tertiary,
    margin: BaseStyles.padding
  }
};

function User({ elementView }) {
  let { avatar_url, first_name, last_name, username, is_me } = elementView.getElement();
  return (
    <Flex container row alignItems="center">
      <Flex component='img' src={avatar_url} style={profileStyle.primaryAvatar} />
      <Flex>
        <div style={profileStyle.userFullName}>{first_name || "First Name"} {last_name || "Last Name"}</div>
        <div style={profileStyle.userUsername}>@{username}</div>
        {is_me && <Anchor href="/profile/edit" style={profileStyle.userEditProfile}>Edit Profile</Anchor>}
      </Flex>
    </Flex>
  );
}

function transactionColor({ completed, success, rejected }) {
  return completed ? success ? "green" : "yellow" : rejected ? "red" : null;
}

function TransactionCollectionBody({ collectionView, userId }) {
  let es = collectionView.getElements();

  if (es.length === 0) {
    let isMe = userId === API.getUserID();
    return (
      <div style={style.element.frownMessage}>
        <Frown large />
        <p style={noSelect()}>{isMe ? "No transactions...yet!" : "No mutual transactions..." }</p>
      </div>
    );
  }

  return (
      <Flex container column style={style.table.base}>
        {es.map((obj, i) => {
          let isOdd = (i % 2) === 1;
          let direction = null;
          let user = null;
          if (obj.sender.id === parseInt(userId)) {
            direction = "to";
            user = obj.recipient;
          } else if (obj.recipient.id === parseInt(userId)) {
            direction = "from";
            user = obj.sender;
          }
          return (
            <Flex container row alignItems="center" justifyContent="space-between" component={Button}
                  key={obj.id}
                  disableBaseStyles
                  href={"/transaction/" + obj.id}
                  hoverStyle={style.table.rowHover}
                  activeStyle={style.table.rowActive}
                  style={{
                    ...style.table.row,
                    ...isOdd ? style.table.oddRow : {},
                    color: transactionColor(obj) }}>
              <Flex style={style.table.column}># {obj.id}</Flex>
              <Flex container alignItems="center" style={style.table.column}><BTC/><span>{parseFloat(obj.amount)}</span></Flex>
              {direction && <small style={style.table.column}>{direction}</small>}
              {user && <p style={style.table.column}>{user.first_name} {user.last_name} (@{user.username})</p>}
            </Flex>
          );
      })}
      </Flex>
  );
}

function Profile({ matches }) {
  const userId = parseInt(matches.id);
  const isAuthenticatedUser = userId === API.getUserID();
  return (
      <Flex container column alignItems="center">
        <ElementView collection={API.user} elementID={userId}>
          <User />
        </ElementView>
        <Flex container column style={{maxWidth:"100%", width: "100%"}}>
          <Flex container row wrap justifyContent="center">
            {!isAuthenticatedUser &&
              <Button
                href={API.user.baseURL + userId + "/transaction/send"}
              >Send BTC</Button>}
              {!isAuthenticatedUser &&
              <Button
                href={API.user.baseURL + userId + "/transaction/receive"}
              >Receive BTC</Button>}
              {isAuthenticatedUser &&
              <Button
                href="/wallets"
              >Wallets</Button>}
              {isAuthenticatedUser &&
              <Button
                href="/required"
              >Required</Button>}
              {isAuthenticatedUser &&
               <Button
                 onClick={() => {
                   API.networking("DELETE", "/token/clear", {}, {}).then(() => {
                     API.clearAuth();
                     Router.push("/");
                   });
                 }}
               >Log Out</Button>}
          </Flex>
          <CollectionView collection={API.user.append("/" + userId + "/transactions")}>
            <TransactionCollectionBody userId={userId} />
          </CollectionView>
        </Flex>
      </Flex>
  );
}

export default Profile;
