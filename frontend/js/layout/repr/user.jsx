import React from 'react';
import { JSONComponent } from 'app/json';

export default class User extends JSONComponent {
  render() {
    if (this.isPersisted) {
      return (
        <div className="user">
          <p className="primary">{this.json.first_name} {this.json.last_name}</p>
          <p className="secondary">{this.json.username}, member since {new Date(this.json.date_joined).toLocaleString(navigator.language)}</p>
        </div>
      )
    }
  }
}

