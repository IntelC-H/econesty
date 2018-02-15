import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars

import { Link } from 'app/components/routing';
import { Button, SideMargins } from 'app/components/elements';

const Home = () =>
  <SideMargins className="center">
    <h1 className="primary">Econesty</h1>
    <h3 className="secondary">Decentralized BitCoin transaction assurance</h3>
    <p>Join now and start using bitcoin with peace of mind!</p>
    <Link component={Button} href="/signup">Sign Up</Link>
    <p className="secondary">or <Link href="/login">log in</Link></p>
  </SideMargins>
;

export default Home;
