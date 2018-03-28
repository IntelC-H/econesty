import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars

import { Router, API } from 'base/base';
import 'app/apiCollections';

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

require('preact/debug');

// BUGS: - frontend forms don't work correctly (missing user_id-type things)
//       - backend automatic ownership isn't working

/*
  TODO for Polished:
  - Retry failed transactions
  - JS animation for loaders
  - Fix content jump in Wallets page
*/

function makeRoute(path, Comp, wcs = {}) {
  return <Comp path={path} wildcards={wcs} />;
}

function authBranch(auth, unauth) {
  return props => API.isAuthenticated ? h(auth, props) : h(unauth, props);
}

function secure(comp) {
  return authBranch(comp, () => Router.replace("/login"));
}

function containsMe(u) {
  return u.split("/").includes("me");
}

function replaceMeInPath() {
  const url = Router.getPath()
                    .split("/")
                    .map(u => u === "me" ? String(API.getUserID()) : u)
                    .join("/");
  return Router.replace(url);
}

export default () =>
  <PageTemplate>
    <Router notFound={NotFound}>
      {[
        makeRoute("/", authBranch(() => Router.replace("/user/" + API.getUserID()), Home)),
        makeRoute("/login", Login),
        makeRoute("/signup", Signup),
        makeRoute("/wallets", secure(Wallets)),
        makeRoute("/required", secure(RequiredOfMe)),
        makeRoute("/transaction/:id", secure(TransactionDetail)),
        makeRoute(containsMe, secure(replaceMeInPath)),
        makeRoute("/user/:id", secure(Profile)),
        makeRoute("/user/:id/transaction/:action", secure(CreateTransaction), { action: ["send", "receive"] })
      ]}
    </Router>
  </PageTemplate>
;
