import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars

import { Link } from 'base/components/routing';
import { Button } from 'base/components/elements';

const Home = () =>
  <div id="home" className="section">
    <h1 className="primary">ECONESTY</h1>
    <h3 className="secondary">Decentralized BitCoin transaction assurance</h3>
    <p>Join now and start using bitcoin with peace of mind!</p>
    <Link component={Button} href="/signup">Sign Up</Link>
    <p className="secondary">or <Link href="/login">log in</Link></p>
  </div>
;

export default Home;
