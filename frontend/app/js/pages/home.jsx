import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { Flex, Link } from 'base/base';

const Home = () =>
  <Flex container justifyContent="center" alignItems="center" className="section">
    <Flex container column alignItems="center" basis="auto" grow="1" shrink="1">
      <h1 className="primary no-select">ECONESTY</h1>
      <h3 className="secondary no-select">Decentralized BitCoin transaction assurance</h3>
      <p className="no-select">Join now and start using bitcoin with peace of mind!</p>
      <Link component={'button'} href="/signup">Sign Up</Link>
      <p className="secondary no-select">or <Link href="/login">log in</Link></p>
    </Flex>
  </Flex>
;

export default Home;
