import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { Button } from 'base/components/elements';
import { Flex, Link } from 'base/base';

const Home = () =>
  <Flex container justifyContent="center" alignItems="center" className="section">
    <Flex container direction="column" alignItems="center"
                    basis="auto" grow="1" shrink="1">
      <h1 className="primary">ECONESTY</h1>
      <h3 className="secondary">Decentralized BitCoin transaction assurance</h3>
      <p>Join now and start using bitcoin with peace of mind!</p>
      <Link component={Button} href="/signup">Sign Up</Link>
      <p className="secondary">or <Link href="/login">log in</Link></p>
    </Flex>
  </Flex>
;

export default Home;
