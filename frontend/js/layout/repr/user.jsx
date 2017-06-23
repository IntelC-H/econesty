import React from 'react';
import { JSONComponent } from 'app/json';

export default class User extends JSONComponent {
  render() {
    if (this.isPersisted) {
      return <h1>Welcome, @{this.json.username}!</h1>;
    } else {
      return <h1>Signup Needed</h1>;
    } 
  }
}

