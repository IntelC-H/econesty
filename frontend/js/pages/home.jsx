import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars

import { Link } from 'app/components/routing';
import { Grid, GridUnit, Button } from 'app/components/elements';

const Home = () =>
  <Grid>
    <GridUnit size="1" sm="4-24" />
    <GridUnit size="1" sm="16-24">
      <div className="center">
        <h1 className="primary">Econesty</h1>
        <h3 className="secondary">Leverage your friends to transact fairly</h3>
        <Link component={Button} href="/signup">Sign Up</Link>
      </div>
    </GridUnit>
    <GridUnit size="1" sm="4-24" />
  </Grid>
;

export default Home;
