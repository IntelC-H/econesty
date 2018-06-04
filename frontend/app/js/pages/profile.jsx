import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { Frown, BTC, SideMargins, LeftArrow, RightArrow } from 'app/common';
import { Anchor, Button, Router, API, Flex, Loading, FadeTransition } from 'base/base';
import { connect } from 'preact-redux';

import * as ActionCreators from '../redux/actionCreators';

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

const User_mapStateToProps = (state, ownProps) => {
  return {
    ...ownProps,
    ...(state.users[ownProps.userId] || {})
  };
};

const User_mapDispatchToProps = (dispatch, ownProps) => {
  return {
    ...ownProps,
    reloadUser: (userId) => dispatch(ActionCreators.reloadUser(userId))
  };
};

const User = connect(User_mapStateToProps, User_mapDispatchToProps)(class User extends Component {
  componentDidMount() {
    this.props.reloadUser(this.props.userId);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.userId !== nextProps.userId) {
      nextProps.reloadUser(nextProps.userId);
    }
  }

  render() {
    if (this.props.loading || !this.props.user) return <Loading />;

    let { avatar_url, first_name, last_name, username, is_me } = this.props.user;
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
});

const Transactions_mapStateToProps = (state, ownProps) => {
  return {
    ...ownProps,
    ...(state.transactions[ownProps.userId] || {})
  };
};

const Transactions_mapDispatchToProps = (dispatch, ownProps) => {
  return {
    ...ownProps,
    reloadTransactions: (page) => dispatch(ActionCreators.reloadTransactions(ownProps.userId, page || 1))
  };
};

const Transactions = connect(Transactions_mapStateToProps, Transactions_mapDispatchToProps)(class Transactions extends Component {
  constructor(props) {
    super(props);
    this.gotoPage = this.gotoPage.bind(this);
  }

  componentDidMount() {
    this.props.reloadTransactions(this.props.page || 1);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.userId !== nextProps.userId) {
      nextProps.reloadTransactions(nextProps.page || 1);
    }
  }

  colorFor({ completed, success, rejected }) {
    return completed ? success ? "green" : "yellow" : rejected ? "red" : null;
  }

  gotoPage(page) {
    this.props.reloadTransactions(page);
  }

  render() {
    let loading = !this.props.transactions || this.props.loading;
    let errored = !loading && this.props.error;
    let succeeded = !loading && !this.props.error;
    let userId = parseInt(this.props.userId);
    let hasTransactions = this.props.transactions && this.props.transactions.length > 0;
    return (
      <FadeTransition>
        {loading && <Loading fadeOut />}
        {succeeded && !hasTransactions && <div fadeIn style={style.element.frownMessage}>
            <Frown large />
            <p style={noSelect()}>{userId === API.getUserID() ? "No transactions...yet!" : "No mutual transactions..." }</p>
          </div>}
        {succeeded && hasTransactions && <Flex fadeIn container column style={style.table.base}>
          { this.props.transactions.map((obj, i) => {
            let isOdd = Boolean(i % 2);
            let direction = null;
            let user = null;
            if (obj.sender.id === userId) {
              direction = "to";
              user = obj.recipient;
            } else if (obj.recipient.id === userId) {
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
                      color: this.colorFor(obj) }}>
                <Flex shrink="0" style={style.table.column}># {obj.id}</Flex>
                <Flex shrink="1" wrap container alignItems="center" justifyContent="flex-end" style={style.table.column}>
                  <BTC style={{ fontSize: "1.5em" }} />
                  <span>&nbsp;{parseFloat(obj.amount)}</span>
                  {direction && <small style={{ padding: BaseStyles.padding}}>{direction}</small>}
                  {user && <span>{user.first_name} {user.last_name} (@{user.username})</span>}
                </Flex>
              </Flex>
            );
        })}
        </Flex>}
        {succeeded && hasTransactions && <Flex fadeIn key="controls" container row justifyContent="space-around" alignItems="center">
          <Button disabled={this.props.previousPage === null}
                  onClick={() => this.gotoPage(this.props.previousPage)}
                  ><LeftArrow /></Button>
          <span style={noSelect()}>{this.props.page} of {Math.ceil(this.props.count/10) || 1}</span>
          <Button disabled={this.props.nextPage === null}
                  onClick={() => this.gotoPage(this.props.nextPage)}
                  ><RightArrow /></Button>
        </Flex>}
      </FadeTransition>
    );
  }
});

function logOut() {
  API.networking("DELETE", "/token/clear", {}, {}).then(() => {
    API.clearAuth();
    Router.push("/");
  });
}

function Profile({ matches }) {
  const userId = parseInt(matches.id);
  const isAuthenticatedUser = userId === API.getUserID();
  return (
    <SideMargins>
      <Flex container column alignItems="center">
        <User userId={userId} />
        <Flex container column style={{maxWidth:"100%", width: "100%"}}>
          <Flex container row wrap justifyContent="center">
            {!isAuthenticatedUser && <Button href={`/user/${userId}/transaction/send`}>Send BTC</Button>}
            {!isAuthenticatedUser && <Button href={`/user/${userId}/transaction/receive`}>Receive BTC</Button>}
            {isAuthenticatedUser && <Button href="/wallets">Wallets</Button>}
            {isAuthenticatedUser && <Button href="/required">Required</Button>}
            {isAuthenticatedUser && <Button onClick={logOut}>Log Out</Button>}
          </Flex>
          <Transactions userId={userId} />
        </Flex>
      </Flex>
    </SideMargins>
  );
}

export default Profile;
