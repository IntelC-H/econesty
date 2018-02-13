import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars

import { API } from 'app/api';
import 'app/apiCollections';

import { Router } from 'app/components/routing';

// Pages
import NotFound from 'app/pages/notFound';
import PageTemplate from 'app/pages/pageTemplate';
import CreateTransaction from 'app/pages/createTransaction';
import Login from 'app/pages/login';
import Profile from 'app/pages/profile';
import Signup from 'app/pages/signup';
import Home from 'app/pages/home';
import Wallets from 'app/pages/wallets';
import TransactionDetail from 'app/pages/transactiondetail';
import RequiredOfMe from 'app/pages/requiredofme';

/*
  TODO for MVP:
  - test bitcoin implementation
  - make look purdy
  - make groups in forms look better
    -  light backgrounds?
    -  position the delete buttons right
  - SearchField overlay allow clicking in textfield
  - Fix SearchField search icon in forms with screen width < 400
  - Tooltips
    - Usernames
    - created ats
*/

function secure(comp) {
  return props => API.isAuthenticated ? h(comp, props) : Router.replace("/login");
}

// TODO: make this wrap a components.
// This function exists because JS's regex
// implementation doesn't support bidirectional lookaround.
function replacePath(comp, gen, guard = () => true) {
  return secure(() => {
    if (guard()) {
      const v = gen();
      const url = Router.getPath()
                        .split("/")
                        .map(u => u === comp ? v : u)
                        .join("/");
      return Router.replace(url);
    }
    return Router.replace("/");
  });
}

function makeRoute(path, Comp, wcs) {
  return <Comp path={path} wildcards={wcs} />;
}

function redirectOnAuth(path, FallbackComp) {
  return props => {
    if (API.isAuthenticated) return Router.replace(path);
    return <FallbackComp {...props} />;
  };
}

export default () =>
  <PageTemplate>
    <Router notFound={NotFound}>
      {[
        makeRoute("/", redirectOnAuth("/user/me", Home)),
        makeRoute(u => u.split("/").indexOf("me") !== -1,
                  replacePath("me", () => API.getUserID(),
                                    () => !!API.getUserID())),
        makeRoute("/login", Login),
        makeRoute("/signup", Signup),
        makeRoute("/user/:id", Profile), // view a profile
        makeRoute("/user/:id/transaction/:action", secure(CreateTransaction), { action: ["buy", "sell"] }), // create transaction's
        makeRoute("/wallets", secure(Wallets)), // manage payment_data's
        makeRoute("/transaction/:id", secure(TransactionDetail)), // your transactions
        makeRoute("/required", secure(RequiredOfMe)) // manage requirements of you
      ]}
    </Router>
  </PageTemplate>
;
