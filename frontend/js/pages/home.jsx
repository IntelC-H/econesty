import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars

import { Grid, GridUnit } from 'app/components/elements';

const makeColumn = (header, bodies) =>
  <GridUnit size="1" sm="1-3">
    <div className="padded">
      <h3>{header}</h3>
      {bodies.map(txt => <p>{txt}</p>)}
    </div>
  </GridUnit>
;

const Home = () =>
  <Grid>
    <GridUnit size="1" sm="4-24" />
    <GridUnit size="1" sm="16-24">
      <div className="center">
        <h1>Econesty</h1>
        <h2>Fairness in Negotiation</h2>
      </div>
      {
        makeColumn("Recruit friends to secure your transactions.", [
          "Econesty enables you to attach conditions to transactions. Your friends have to sign off that the transaction was fair & equitable.",
          "For example, if you're buying a used car, you might recruit your car nerd friend to sign off that the deal is fair."
        ])
      }
      {
        makeColumn("Use the best payment method every time.", [
          "Add your debit card, bitcoin wallet, paypal account, and more to Econesty. When you make a transaction, Econesty determines the best payment method to use."
        ])
      }
      {
        makeColumn("Highly Secure.", [
          "Sensitive data is encrypted with a security key that never leaves your head. Econesty favors security over convenience; so every time payment data is used, Econesty will prompt you for the password."
        ])
      }
    </GridUnit>
    <GridUnit size="1" sm="4-24" />
  </Grid>
;

export default Home;