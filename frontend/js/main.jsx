import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { Switch, Route } from 'react-router';
import RESTObject from 'app/restobject';

var container = document.getElementById("main");

// Links to other pages
// <Link to="/">Home</Link>

// e.g.: navigateTo("/")
// const navigateTo = React.PropTypes.object.push
//
//
// class HomePage extends React.Component {
//   render() {
//     return <p>HOME</p>
//   }
// }

class ProfilePage extends React.Component {
  render() {
    return (<RESTObject
            resource="user"
            objectId="2"
            component={UserRepresentation}/>);
  }
}

class UserRepresentation extends React.Component {
  render() {
    var model = this.props.model;
    if (model.error != null) {
      return <h1>Error: {model.error}</h1>;
    } else if (model.object != null) {
      var user = model.object;
      return <h1>Welcome, @{user.username}!</h1>;
    } else {
      return <h3></h3>;
    } 
  }
}

// class SignupPage extends React.Component {
//   render() {
//     return <p>SIGNUP</P>
//   }
// }
//
// class PaymentDataPage extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       paymentData: null
//     }
//   }
//   render() {
//     return <p>PAYMENTDATA</p>
//   }
// }
//
// class CounterSignaturePage extends React.Component {
//   render() {
//     return <p>PaymentData</p>
//   }
// }

      /* <Route exact path='/' component={}> // homepage
       <Route exact path='/user' component={ProfilePage}> // logged in user
       <Route exact path='/user/new' component={SignupPage}> // create user */

ReactDOM.render((
   <BrowserRouter>
     <div>
       <Route path='/user/:id' component={ProfilePage} />
     </div>
   </BrowserRouter>
), container);


      // <Route exact path='/paymentdata/new' component={PaymentDataPage}>
      // <Route exact path='/paymentdata/:id' component={PaymentDataPage}>
      // <Route exact path='/transaction/new' component={TransactionPage}>
      // <Route path='/transaction/:id' component={TransactionPage}>
      // <Route path='/transaction/:id/countersign' component={CounterSignaturePage}>
