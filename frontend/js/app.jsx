import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars

import { API } from 'app/api';
import 'app/apiCollections';

import { Router } from 'app/components/routing';
import { Loading } from 'app/components/elements';

// Pages
import NotFound from 'app/pages/notFound';
import PageTemplate from 'app/pages/pageTemplate';
import CreateTransaction from 'app/pages/createTransaction';
import Login from 'app/pages/login';
import Profile from 'app/pages/profile';
import Signup from 'app/pages/signup';
import Home from 'app/pages/home';
import PaymentData from 'app/pages/paymentData';

/*

  TODO for MVP:
  - Edit Profile page
  - Fulfill Requirement page
  - Cache authenticated user's id
    - it sucks to have to hit the API so many times.

  - make groups in forms look better
    -  light backgrounds?
    -  position the delete buttons right
  - SearchField overlay allow clicking in textfield
  - Fix SearchField search icon in forms with screen width < 400

  - Tooltips
    - Usernames
    - created ats
    - Single time display
      - If n seconds have elapsed while this is open, never show again

*/

function secure(comp) {
  return props => API.isAuthenticated ? h(comp, props) : Router.replace("/login");
}

const MeRedirect = secure(() => {
  // This function exists because JS's regex
  // implementation doesn't support bidirectional lookaround.
  API.user.me().then(res => {
    const urlComps = Router.getPath().split("/");
    const idx = urlComps.indexOf("me");
    urlComps[idx] = res.id.toString();
    Router.replace(urlComps.join("/"));
  }).catch(err => Router.replace('/'));

  return <Loading />;
});

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
        makeRoute("/user/:id/transaction/:action", secure(CreateTransaction), { action: ["buy", "sell"] }),
        makeRoute("/payment", secure(PaymentData))
        // TODO:
        // /transactions
        // /payment -> manage paymentdata
        // /required/of_me -> manage requirements of you
        // /required/of_others -> check on requirements you've made of others.
      ]}
    </Router>
  </PageTemplate>
;
