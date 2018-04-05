import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars

import { Router, API } from 'base/base';
import 'app/apiCollections';
import 'app/basestyleoverrides';

// Pages
import NotFound from 'app/pages/notFound';
import PageTemplate from 'app/pages/pageTemplate';
import CreateTransaction from 'app/pages/createTransaction';
import Login from 'app/pages/login';
import Profile from 'app/pages/profile';
import EditProfile from 'app/pages/editProfile';
import Signup from 'app/pages/signup';
import Home from 'app/pages/home';
import Wallets from 'app/pages/wallets';
import TransactionDetail from 'app/pages/transactiondetail';
import RequiredOfMe from 'app/pages/requiredofme';

/*
  TODO for UX redo:
  - Retry failed transactions
    - test this functionality; hook it into ElementView's <Loading />
  - Better responsive tables!
  - Image placeholders/Loading's to prevent abrupt page shifts
  - home.jsx
    - Show 3 blocks below signup (responsive Flex grid)
      - Total BTC sent
      - Number of transactions
      - Number of requirements made
  - createTransaction.jsx
    - Make BTC field have a <BTC /> and default to 0
    - Make BTC field less wide
  - requiredofme.jsx
    - Fix padding
    - Place signing and acknowledging controls on the right half (bottom on mobile - flex)
    - Terms content can be to the left half
  - Copyright
  - Fail Whale 404

  TODO for Base redo:
  - Move styles into the app
    - BaseStyles
    - tables
    - buttons
    - fieldsets
  - Remove margin and padding from Flex component
  - Ensure all shouldComponentUpdate()'s work correctly
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
  const url = Router.path
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
        makeRoute("/profile/edit", secure(EditProfile)),
        makeRoute("/transaction/:id", secure(TransactionDetail)),
        makeRoute(containsMe, secure(replaceMeInPath)),
        makeRoute("/user/:id", secure(Profile)),
        makeRoute("/user/:id/transaction/:action", secure(CreateTransaction), { action: ["send", "receive"] })
      ]}
    </Router>
  </PageTemplate>
;
