import React from 'react';
import ReactDOM from 'react-dom';
import Networking from 'app/networking';
import PropTypes from 'prop-types';

/*
  // Example Usage
  <JSONForm path="/api/transaction/" create afterSubmit={myfunc}>
    // standard form elements
    // can also nest forms
  </JSONForm>
*/

export default class JSONForm extends React.Component {
  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
  }

  render() {
    return (
      <form className="json-form" onSubmit={this.onSubmit}>
        {this.props.children}
      </form>
    );
  }

  onSubmit(e) {
    e.preventDefault();

    var node = ReactDOM.findDOMNode(this);
    var descendants = Array.from(node.getElementsByTagName("*"));
    var inputs = descendants.filter((e) => e.nodeName.toLowerCase() == "input" && e.type.toLowerCase() != "submit");
    var obj = {};

    for (var i = 0; i < inputs.length; i++) {
      var inp = inputs[i];
      obj[inp.name] = inp.value;
    }

    var verb = this.props.objectId ? "PATCH" : "POST";

    var n = Networking.create.appendPath(this.props.path);
    if (this.props.objectId) {
      n = n.appendPath(this.props.objectId.toString());
    }
    n.asJSON().withLocalTokenAuth("token").withBody(obj).withMethod(verb).go(this.props.afterSubmit);
  }
}

JSONForm.defaultProps = {
  path: "",
  objectId: null,
  afterSubmit: ((_) => {})
}

JSONForm.propTypes = {
  path: PropTypes.string,
  objectId: PropTypes.number,
  afterSubmit: PropTypes.func
}