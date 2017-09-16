import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars

import { API } from 'app/api';
import 'app/apiCollections';

import { Router } from 'app/components/routing';
import { Loading } from 'app/components/elements';
import { secure, replacePath } from 'app/components/higher';

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
  - Transaction detail page w/ requirements
  - Edit Profile page
  - Fulfill Requirement page

  TODO for after MVP:
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

const makeRoute = (path, Comp, wcs) => <Comp path={path} wildcards={wcs} />;

export default () =>
  <PageTemplate>
    <Router notFound={NotFound}>
      {[
        makeRoute(u => u.split("/").indexOf("me") !== -1,
                  replacePath("me", () => API.getUserID(),
                                    () => !!API.getUserID())),
        makeRoute("/", Home),
        makeRoute("/login", Login),
        makeRoute("/signup", Signup),
        makeRoute("/user/:id", Profile), // view a profile
        makeRoute("/user/:id/transaction/:action", secure(CreateTransaction), { action: ["buy", "sell"] }), // create transaction's
        makeRoute("/payment", secure(PaymentData)) // manage payment_data's
        // TODO:
        // /transactions -> ALL transactions you're privy to. Is this necessary? If you're viewing your own page as yourself, you should be able to see all the transactions you're privy to.
        // /required/me -> manage requirements of you
        // /required/others -> check on requirements you've made of others.
      ]}
    </Router>
  </PageTemplate>
;
