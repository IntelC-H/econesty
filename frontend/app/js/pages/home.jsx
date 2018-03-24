import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { Button } from 'base/components/elements';
import { Link, FlexContainer, FlexItem } from 'base/base';

const Home = () =>
  <FlexContainer justifyContent="center" alignItems="center" className="section">
    <FlexItem basis="auto" grow="1" shrink="1">
      <FlexContainer direction="column" alignItems="center">
        <h1 className="primary">ECONESTY</h1>
        <h3 className="secondary">Decentralized BitCoin transaction assurance</h3>
        <p>Join now and start using bitcoin with peace of mind!</p>
        <Link component={Button} href="/signup">Sign Up</Link>
        <p className="secondary">or <Link href="/login">log in</Link></p>
      </FlexContainer>
    </FlexItem>
  </FlexContainer>
;

export default Home;
