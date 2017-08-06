import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { Router, Link } from 'app/routing';
import { API, APICollection, APIActionCollection } from 'app/api';

import { Form, Element, Button, SubmitButton, Menu, MenuList, MenuHeading, MenuItem, Grid, GridUnit } from 'app/pure';

// Representations
import Transaction from 'app/repr/transaction';
import User from 'app/repr/user';

// Components
import Components, { SearchField } from 'app/components';
import { withPromiseFactory, withPromise, asyncCollection, /*rewritePath,*/ wrap } from 'app/components/higher';

// Setup API
API.user = new APICollection("user");
API.user.me = () => API.user.classMethod("GET", "me");
API.user.transactions = (userId, page = 1) => API.user.instanceMethod("GET", "transactions", userId, null, {page: page});
API.user.payment = otherId => API.user.instanceMethod("GET", "payment", otherId)
API.transaction = new APICollection("transaction");
API.payment_data = new APICollection("paymentdata");
API.countersignature = new APICollection("countersignature");
API.token =  new APIActionCollection("token", res => API.setToken(res.token));

function saveFormTo(api, f = null) {
  return obj => {
    api.create(obj).catch(e => {
      throw e;
    }).then(f || (() => undefined));
  };
}

function upsertFormTo(api, oid, f = null) {
  return obj => {
    var p = oid ? api.update(oid, obj) : api.create(obj);
    p.catch(e => {
      throw e;
    }).then(f || (() => undefined));
  };
}

function withAPI(api, form) {
  return props => {
    const WrappedForm = withPromise(api.read(props.matches.id), form);
    return <WrappedForm {...props} />;
  };
}

///// FORMS

// Create-Only

const loginForm = props =>
  <Form object={props.object}>
    <Element text name="username" label="Username" />
    <Element password name="password" label="Password" />
    <SubmitButton onSubmit={saveFormTo(API.token, obj => {
      console.log(obj);
      API.setToken(obj.key);
      Router.push("/user/me");
    })}>
      OK
    </SubmitButton>
  </Form>
;

const signupForm = props =>
  <Form object={props.object}>
    <Element text     name="first_name" label="First Name" />
    <Element text     name="last_name"  label="Last Name" />
    <Element email    name="email"      label="Email" />
    <Element text     name="username"   label="New Username" />
    <Element password name="password"   label="New Password" />
    <SubmitButton onSubmit={saveFormTo(API.user, user => Router.push("/user/" + user.id))}>
      OK
    </SubmitButton>
  </Form>
;

const countersignForm = props =>
  <Form object={props.object}>
    <Element hidden name="user_id" />
    <Element hidden name="transaction_id" />
    <Components.SignatureField editable name="signature" />
    <SubmitButton onSubmit={saveFormTo(API.countersignature, cs => Router.push("/transaction/" + cs.transaction.id))}>
      OK
    </SubmitButton>
  </Form>
;

const countersignDefaults = props => API.user.me().then(me => ({
  user_id: me.id,
  transaction_id: parseInt(props.matches.id),
  signature: ""
}));

// Create/update forms.

const paymentDataForm = props =>
  <Form object={props.object} aligned>
    <Element text     name="data"      label="Data" />
    <Element checkbox name="encrypted" label="Encrypted" />
    <Element hidden   name="user_id" />
    <SubmitButton onSubmit={upsertFormTo(API.payment_data, props.matches.id, pd => Router.push("/payment/" + pd.id))}>
      OK
    </SubmitButton>
  </Form>
;

const paymentDataDefaults = () => API.user.me().then(me => ({
  data: "",
  encrypted: false,
  user_id: me.id
}));

const transactionForm = props =>
  <Form object={props.object} aligned>
    <Element text name="offer" label="Offer" />
    <Element      name="offer_currency" label="Currency" select={["USD", "EUR", "JPY", "GBP"]} />
    <Element hidden name="buyer_id" />
    <Element hidden name="buyer_payment_data_id" />
    <Element hidden name="seller_id" />
    <Element hidden name="seller_payment_data_id" />
    <SubmitButton onSubmit={saveFormTo(API.transaction, t => Router.push("/transaction/" + t.id))}>
      OK
    </SubmitButton>
  </Form>
;

const transactionDefaults = props => {
  var isBuyer = undefined;
  var otherId = undefined;

  if (props.matches) {
    isBuyer = props.matches.action === "buy";
    otherId = props.matches.id;
    otherId = otherId === "me" ? undefined : parseInt(otherId);
  }

  return API.user.payment(otherId).then(res => {
    var me = res.me.user;
    var them = res.them.user;
    var payment = res;
    return {
      offer: "0.00",
      offer_currency: "USD",
      required_witnesses: "0",
      buyer_id: isBuyer ? me.id : them.id,
      buyer_payment_data_id: isBuyer ? payment.me.id : payment.them.id,
      seller_id: isBuyer ? them.id : me.id,
      seller_payment_data_id: isBuyer ? payment.them.id : payment.me.id
    };
  });
};

const Page = props =>
  <div>
    <Menu horizontal fixed className="header raised-v">
      <MenuHeading>
        <Link href="/" className="light-text">Econesty</Link>
      </MenuHeading>
      <MenuList>
        <MenuItem>
          <SearchField
            api={API.user}
            component={props => <tr><td><Link href={"/user/" + props.object.id.toString()}>{props.object.username}</Link></td></tr>}
          />
        </MenuItem>
        <MenuItem><Link href="/user/me" className="light-text"><span className="fa fa-user-circle-o header-icon" aria-hidden="true"></span></Link></MenuItem>
      </MenuList>
    </Menu>
    <div className="content">
      {props.children}
    </div>
  </div>
;

const makePage = (content, lgutter = null, rgutter = null) =>
  <Grid>
    <GridUnit size="1" sm="4-24">{lgutter}</GridUnit>
    <GridUnit size="1" sm="16-24">{content}</GridUnit>
    <GridUnit size="1" sm="4-24">{rgutter}</GridUnit>
  </Grid>
;

////////// APP JSX

const Profile = props => {
  const userId = props.matches.id;
  const TransactionCollection = API.isAuthenticated ? asyncCollection(
    () => <tr><th>Offer</th><th>Buyer</th><th>Seller</th></tr>,
    Transaction,
    page => API.paginate(API.user.transactions(userId, page), API.transaction)
  ) : AuthRequired;

  return makePage([
    <div className="profile-button-group">
      <Button className="margined raised" onClick={() => Router.push("/user/" + userId + "/transaction/buy")}>Buy From</Button>
      <Button className="margined raised" onClick={() => Router.push("/user/" + userId + "/transaction/sell")}>Sell To</Button>
    </div>,
    h(TransactionCollection, props)
  ], h(withAPI(API.user, User), props));
}

const makeColumn = (header, bodies) =>
  <GridUnit size="1" sm="1-3">
    <div className="padded">
      <h3>{header}</h3>
      {bodies.map(txt => <p>{txt}</p>)}
    </div>
  </GridUnit>
;

const Home = () => makePage([
  <div className="center">
    <h1>Econesty</h1>
    <h2>Fairness in Negotiation</h2>
  </div>,
  makeColumn("Recruit friends to secure your transactions.", [
    "Econesty enables you to attach conditions to transactions. Your friends have to sign off that the transaction was fair & equitable.",
    "For example, if you're buying a used car, you might recruit your car nerd friend to sign off that the deal is fair."
  ]),
  makeColumn("Use the best payment method every time.", [
    "Add your debit card, bitcoin wallet, paypal account, and more to Econesty. When you make a transaction, Econesty determines the best payment method to use."
  ]),
  makeColumn("Highly Secure.", [
    "Sensitive data is encrypted with a security key that never leaves your head. Econesty favors security over convenience; so every time payment data is used, Econesty will prompt you for the password."
  ])
]);

const NotFound = wrap(Page, () => <span>Not Found.</span>);
const AuthRequired = props => <span>Authentication Required.</span>;
const LoginRedirect = props => Router.push("/login")

export default () => {
  const makeRoute = (path, Comp, wcs = {}) => <Comp path={path} wildcards={wcs} />;
  const routes = [
    makeRoute("/", wrap(Page, Home)),
    makeRoute("/login", wrap(Page, loginForm)),
    makeRoute("/signup", wrap(Page, signupForm)),
    makeRoute("/user/me", props => h(API.isAuthenticated ? withPromise(
        API.user.me().then(res => "/user/" + res.id.toString()),
        props => Router.replace(document.location.pathname.replace(/.*/, props.object))
      ) : LoginRedirect, props)),
    makeRoute("/user/:id", wrap(Page, Profile)),
    makeRoute("/user/:id/transaction/:action",
              wrap(Page, withPromiseFactory(transactionDefaults, transactionForm)),
              {action: ["buy", "sell"]}),
    makeRoute("/payment/new", wrap(Page, withPromiseFactory(paymentDataDefaults, paymentDataForm))),
    makeRoute("/payment/:id", wrap(Page, withAPI(API.payment_data, paymentDataForm))),
    makeRoute("/transaction/:id", wrap(Page, withAPI(API.transaction, Transaction))),
    makeRoute("/transaction/:id/countersign", wrap(Page, withPromiseFactory(countersignDefaults, countersignForm)))
  ];

  return <Router notFound={NotFound}>{routes}</Router>;
};
