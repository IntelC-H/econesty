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

/*

  TODO for MVP:
  - Stateful forms
    - they hold their data
      - via key in a global registry?
      - until submitted?
  - Payment data creation page
  - Edit Profile page
  - Fulfill Requirement page
  - Routing state get/set
  - make groups in forms look better
    -  light backgrounds?
    -  make delete buttons use an X
    -  position the delete buttons right

*/

function secure(comp) {
  return props => API.isAuthenticated ? h(comp, props) : Router.replace("/login");
}

const MeRedirect = secure(() => {
  // This function exists because JS's regex implementation doesn't support bidirectional lookaround.
  const urlComps = Router.getPath().split("/").filter(x => x.length > 0);
  var idx = urlComps.indexOf("me");
  API.user.me().then(res => {
    urlComps[idx] = res.id.toString();
    Router.replace("/" + urlComps.join("/"));
  });

  return <Loading />;
})

const isMeURL = url => url.split("/").indexOf("me") !== -1 ? {} : false;

const makeRoute = (path, Comp, wcs = {}) => <Comp path={path} wildcards={wcs} />;

export default () =>
  <PageTemplate>
    <Router notFound={NotFound}>
      {[
        makeRoute(isMeURL, MeRedirect), // support me alias for user ids.
        makeRoute("/", Home),
        makeRoute("/login", Login),
        makeRoute("/signup", Signup),
        makeRoute("/user/:id", Profile),
        makeRoute("/user/:id/transaction/:action", secure(CreateTransaction), { action: ["buy", "sell"] })
        // TODO:
        // /transactions
        // /payment -> manage paymentdata
        // /required -> manage requirements of you
        // /required -> check on requirements you've made of others.
      ]}
    </Router>
  </PageTemplate>
;
