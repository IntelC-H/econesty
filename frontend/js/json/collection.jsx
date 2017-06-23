import React from 'react';
import Networking from 'app/networking';
import PropTypes from 'prop-types';
import JSONBase from 'app/json/base';
import JSONObject from 'app/json/object';

// paginated JSON collection.
export default class JSONCollection extends JSONBase {
  get count() { return (this.object || {}).count || 0; }
  get lastPageNum() { return Math.ceil(this.count/10); }
  get hasNext() { return (this.object || {}).next != null; }
  get hasPrevious() { return (this.object || {}).previous != null; }

  constructor(props) {
    super(props);
    this.next = this.next.bind(this);
    this.previous = this.previous.bind(this);
    this.setPage = this.setPage.bind(this);
  }

  setPage(p) {
    if (p > 0 && p <= this.lastPageNum) {
      this.networking = this.networking.withURLParam("page", p.toString());
      this.load();
    }
  }

  next() {
    if (this.hasNext) {
      this.networking = this.networking.withURL(this.object.next);
      this.load();
    }
  }

  previous() {
    if (this.hasPrevious) {
      this.networking = this.networking.withURL(this.object.previous);
      this.load();
    }
  }

  renderJSON() {
    var pageLinks = [];
    for (var i = 1; i <= this.lastPageNum; i++) {
      pageLinks.push(<button key={i} value={i} onClick={(e) => { this.setPage(e.target.value); }}>{i.toString()}</button>);
    }
    return (
      <div className="collection">
        {this.props.headerComponent != null && React.createElement(this.props.headerComponent, { collection: this }, null)}
        <div className="collection-objects">
          {this.object.results.map((child, i) => <JSONObject
                                                  key={child.id}
                                                  object={child}
                                                  networking={this.networking.appendPath(child.id)}
                                                  component={this.props.component} />)}
        </div>
        {this.hasPrevious && <button className="collection-nav-button" onClick={this.previous}>❮ Previous</button>}
        {pageLinks}
        {this.hasNext && <button className="collection-nav-button" onClick={this.next}>Next ❯</button>}
      </div>
    ); 
  }
}

JSONCollection.propTypes = Object.assign(JSONBase.propTypes, {
  headerComponent: PropTypes.func
});

JSONCollection.defaultProps = Object.assign(JSONBase.defaultProps, {
  headerComponent: null
});