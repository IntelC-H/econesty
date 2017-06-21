import React from 'react';
import ReactDOM from 'react-dom';
import Networking from 'app/networking';
import PropTypes from 'prop-types';

class JSON extends React.Component {
  constructor(props) {
    super(props);
    this.networking = this.props.networking || (Networking.create.appendPath(this.props.path).asJSON().withLocalTokenAuth("token"));
    this.state = {
      object: this.props.object,
      error: this.props.error
    }
  }

  get object() { return this.state.object; }
  set object(v) { this.setState((st) => { return {object: v, error: null }}); }

  get error() { return this.state.error; }
  set error(v) { this.setState((st) => { return {object: null, error: v }}); }

  componentDidMount() {
    if (!this.props.deferLoad) {
      this.load();
    }
  }

  shouldComponentUpdate(newProps, newState) {
    if (this.state.object !== newState.object) {
      return true;
    }
    if (this.state.error !== newState.error) {
      return true;
    }
    return false; 
  }

  load() {
    this.networking.go((res) => this.setState({object: res.body || null, error: res.error || null}));
  }

  render() {
    if (this.error != null) {
      if (this.props.errorComponent) {
        return React.createElement(this.props.errorComponent, { element: this }, null);
      } else {
        return <div/>
      }
    }

    if (this.object != null) {
      return this.renderJSON();
    }

    if (this.loadingComponent != null) {
      return React.createElement(this.props.loadingComponent, { element: this }, null);
    }
    return <div/>
  }

  renderJSON() {
    return React.createElement(this.props.component, { element: this }, null);
  }
}

JSON.propTypes = {
  object: PropTypes.shape({ id: PropTypes.number }), // JSON that's been loaded.
  error: PropTypes.object, // The most recent error encountered.
  path: PropTypes.string, // Path of resource 
  networking: PropTypes.instanceOf(Networking),
  component: PropTypes.func.isRequired, // Function used to render the JSON using React
  errorComponent: PropTypes.func, // Function used to render an error
  loadingComponent: PropTypes.func, // Function used to render a loading page
  deferLoad: PropTypes.bool // Whether or not to load the resource upon mounting
};

JSON.defaultProps = {
  error: null,
  object: null,
  deferLoad: false,
  errorComponent: null,
  loadingComponent: null
};

class JSONObject extends JSON {
  get isPersisted() { return this.objectID != null; }
  get objectID() { return (this.object || {id: null}).id; }
  get flattenedObject() {
    var n = {};
    for (var k in this.object) {
      var v = this.object[k];
      var hasID = (v || {}).id != undefined;
      n[hasID ? (k + "_id") : k] = hasID ? v.id : v;
    }
    return n;
  }

  // TODO: custom save action!
  // onSave?
  save() {
    this.networking.withMethod(this.isPersisted ? "PATCH" : "POST").withBody(this.flattenedObject).go((res) => {
      if (!this.isPersisted && (res.error || null) != null) {
        this.networking = this.networking.appendPath(res.body.id);
      }
      this.setState({object: res.body || null, error: res.error || null});
    });
  }

  renderJSON() {
    if (this.isPersisted || this.props.createComponent == null) {
      return super.renderJSON();
    } else {
      return React.createElement(this.props.createComponent, { element: this }, null);
    }
  }
}

JSONObject.propTypes = Object.assign(JSONObject.propTypes, {
  createComponent: PropTypes.func
});

JSONObject.defaultProps = Object.assign(JSONObject.defaultProps, {
  createComponent: null
});

// paginated JSON collection.
class JSONCollection extends JSON {
  get count() { return (this.object || {count: 0}).count; }
  get lastPageNum() { return Math.ceil(this.count/10); }
  get hasNext() { return (this.object || {next: null}).next != null; }
  get hasPrevious() { return (this.object || {previous: null}).previous != null; }

  constructor(props) {
    super(props);
    this.next = this.next.bind(this);
    this.previous = this.previous.bind(this);
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
        {this.hasNext && <button className="collection-nav-button" onClick={this.next}>Next ❯</button>}
      </div>
    ); 
  }
}

JSONCollection.propTypes = Object.assign(JSONCollection.propTypes, {
  headerComponent: PropTypes.func
});

JSONCollection.defaultProps = Object.assign(JSONCollection.defaultProps, {
  headerComponent: null
});

export { JSON, JSONObject, JSONCollection }

