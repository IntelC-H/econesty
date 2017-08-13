import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { Router, Link } from 'app/routing';
import { API, APICollection, APIActionCollection } from 'app/api';

import { Form, Input, Select, ControlGroup, Button, SubmitButton, Menu, MenuList, MenuHeading, MenuItem, Grid, GridUnit } from 'app/pure';

// Representations
import Transaction from 'app/repr/transaction';
import User from 'app/repr/user';

// Pages
import EditTransaction from 'app/edittransaction';

// Components
import Components, { SearchField, Resource } from 'app/components';
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

function secure(comp) {
  return props => {
    if (API.isAuthenticated) return h(comp, props);
    Router.replace("/login");
    return null;
  };
}

///// FORMS

// Create-Only

const loginForm = props =>
  <Form object={props.object} aligned>
    <ControlGroup label="Username">
      <Input text required name="username" />
    </ControlGroup>
    <ControlGroup label="Password">
      <Input password required name="password" />
    </ControlGroup>
    <SubmitButton onSubmit={saveFormTo(API.token, obj => {
      API.setToken(obj.key);
      Router.push("/user/me");
    })}>
      LOGIN
    </SubmitButton>
  </Form>
;

const signupForm = props =>
  <Form object={props.object} aligned>
    <ControlGroup label="First Name">
      <Input text required name="first_name" />
    </ControlGroup>
    <ControlGroup label="Last Name">
      <Input text required name="last_name" />
    </ControlGroup>
    <ControlGroup label="Email">
      <Input email required name="email" />
    </ControlGroup>
    <ControlGroup label="Username">
      <Input text required name="username" />
    </ControlGroup>
    <ControlGroup label="Password">
      <Input password required name="password" />
    </ControlGroup>
    <SubmitButton onSubmit={saveFormTo(API.user, user => Router.push("/user/" + user.id))}>
      SIGN UP
    </SubmitButton>
  </Form>
;

// const countersignForm = props =>
//   <Form object={props.object} aligned>
//     <Element hidden name="user_id" />
//     <Element hidden name="transaction_id" />
//     <Components.SignatureField editable name="signature" />
//     <SubmitButton onSubmit={saveFormTo(API.countersignature, cs => Router.push("/transaction/" + cs.transaction.id))}>
//       SIGN
//     </SubmitButton>
//   </Form>
// ;

// const countersignDefaults = props => API.user.me().then(me => ({
//   user_id: me.id,
//   transaction_id: parseInt(props.matches.id),
//   signature: ""
// }));

// Create/update forms.

// const paymentDataForm = props =>
//   <Form object={props.object} aligned>
//     <Element text     name="data"      label="Data" />
//     <Element checkbox name="encrypted" label="Encrypted" />
//     <Element hidden   name="user_id" />
//     <SubmitButton onSubmit={upsertFormTo(API.payment_data, props.matches.id, pd => Router.push("/payment/" + pd.id))}>
//       SAVE
//     </SubmitButton>
//   </Form>
// ;

// const paymentDataDefaults = () => API.user.me().then(me => ({
//   data: "",
//   encrypted: false,
//   user_id: me.id
// }));

const HeaderSearchBarRow = props => props.object.username;

/*
        <MenuItem>
          <Form aligned>
            <SearchField standalone api={API.user} component={HeaderSearchBarRow} />
          </Form>
        </MenuItem>
*/

const Page = props =>
  <div>
    <Menu horizontal fixed className="header raised-v">
      <MenuHeading>
        <Link href="/" className="light-text">Econesty</Link>
      </MenuHeading>
      <MenuList>

        <MenuItem><Link href="/user/me" className="light-text"><span className="fa fa-user-circle-o header-icon" aria-hidden="true"></span></Link></MenuItem>
      </MenuList>
    </Menu>
    <div className="content margined">
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
const MeRedirect = secure(props => {
  // This function exists because JS's regex implementation doesn't support bidirectional lookaround.
  const urlComps = document.location.pathname.split("/").filter(x => x.length > 0);
  var idx = urlComps.indexOf("me");
  API.user.me().then(res => {
    urlComps[idx] = res.id.toString();
    Router.replace("/" + urlComps.join("/"));
  });
  
  return <Resource />; // show loading
})
const isMeURL = url => url.split("/").indexOf("me") !== -1 ? {} : false;

export default () => {
  const makeRoute = (path, Comp, wcs = {}) => <Comp path={path} wildcards={wcs} />;
  const routes = [
    makeRoute(isMeURL, MeRedirect), // support me alias for user ids.
    makeRoute("/", wrap(Page, Home)),
    makeRoute("/login", wrap(Page, loginForm)),
    makeRoute("/signup", wrap(Page, signupForm)),
    makeRoute("/user/:id", wrap(Page, Profile)),
    makeRoute("/user/:id/transaction/:action", secure(wrap(Page, EditTransaction)), { action: ["buy", "sell"] }),
   // makeRoute("/payment/new", secure(wrap(Page, withPromiseFactory(paymentDataDefaults, paymentDataForm)))),
   // makeRoute("/payment/:id", secure(wrap(Page, withAPI(API.payment_data, paymentDataForm)))),
    makeRoute("/transaction/:id", secure(wrap(Page, withAPI(API.transaction, Transaction))))//,
   // makeRoute("/transaction/:id/countersign", secure(wrap(Page, withPromiseFactory(countersignDefaults, countersignForm))))
  ];

  return <Router notFound={NotFound}>{routes}</Router>;
};
