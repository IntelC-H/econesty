import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { Route } from 'react-router';

// Misc
import Header from 'app/layout/element/header';

// pages
import Profile from 'app/layout/page/profile';
import Login from 'app/layout/page/login';
import CreateTransaction from 'app/layout/page/create_transaction';
import TransactionDetail from 'app/layout/page/transaction_detail';
import Home from 'app/layout/page/home';
import Signup from 'app/layout/page/signup';
import NewCounterSignature from 'app/layout/page/new_countersignature';
import NewPaymentData from 'app/layout/page/new_payment_data';

var body = document.getElementsByTagName("body")[0];
var container = document.createElement("div");
body.appendChild(container);

ReactDOM.render((
   <BrowserRouter>
     <div>
       <Header title="Home" />
       <div className="content">
         <Route exact path="/" component={Home} />
         <Route exact path="/login" component={Login} />
         <Route exact path="/signup" component={Signup} />
         <Route exact path='/user/:user' component={Profile} />
         <Route exact path='/user/:user/transaction/:action' component={CreateTransaction} />
         <Route exact path='/transaction/:id' component={TransactionDetail} />
         <Route exact path='/transaction/:id/countersign' component={NewCounterSignature} />
         <Route exact path='/payment/new' component={NewPaymentData} />
       </div>
    </div>
   </BrowserRouter>
), container);
