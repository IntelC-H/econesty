import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { Flex, Anchor, Button } from 'base/base';

import styles from 'app/style';
import BaseStyles from 'base/style';
import { noSelect } from 'base/style/mixins';

const homeStyle = {
  primaryHeader: {
    textAlign: "center",
    margin: BaseStyles.padding
  },
  tagline: {
    textAlign: "center",
    margin: BaseStyles.padding
  },
  signinSubblock: {
    margin: "2rem 0"
  },
  block: {
    margin: "5rem 0"
  }
};

const Home = () =>
  <Flex container justifyContent="center" alignItems="center" style={homeStyle.block}>
    <Flex container column alignItems="center" basis="auto" grow="1" shrink="1">
      <p style={{ ...styles.text.primary, ...noSelect(), ...homeStyle.primaryHeader }}>Make BitCoin Easy!</p>
      <p style={{ ...styles.text.secondary, ...noSelect(), ...homeStyle.tagline }}>Transaction assurance and wallet management for BitCoin</p>
      <p style={{ ...noSelect() }}>Join now and start using bitcoin with peace of mind!</p>
      <Flex container column justifyContent="center" alignItems="center" style={homeStyle.signinSubblock}>
        <Button href="/signup">Sign Up</Button>
        <p style={{ ...styles.text.tertiary, ...noSelect() }}>or <Anchor href="/login">log in</Anchor></p>
      </Flex>
    </Flex>
  </Flex>
;

export default Home;
