import React from 'react';
import ReactDOM from 'react-dom';
import Networking from 'app/networking';
import PropTypes from 'prop-types';

/*
  // Example Usage
  <JSONForm path="/api/transaction/" create afterSubmit={}>
    // standard form elements
    // can also nest forms
  </JSONForm>
*/

// TODO: implement me!
// use <form onSubmit={myfunc}> to evaluate form to JSON.

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

    function f(acc, e) {
      var accp = acc || {};
      console.log(e);
      if (e.type == "input" && e.props.type != "submit") {
        accp[e.props.name] = e.props.value;
      }
      if (e.children != undefined || e.children != null) {
        for (var i = 0; i < e.children.length; i++) {
          accp = f(accp, e.children[i]);
        }
      }
      return accp;
    }

    var node = ReactDOM.findDOMNode(this);
    var descendants = Array.from(node.getElementsByTagName("*"));
    var inputs = descendants.filter((e) => e.nodeName.toLowerCase() == "input" && e.type.toLowerCase() != "submit");
    var obj = {};

    for (var i = 0; i < inputs.length; i++) {
      var inp = inputs[i];
      obj[inp.name] = inp.value;
    }

    var create = this.props.create == true && this.props.update == false;
    var verb = create ? "POST" : "PATCH";

    Networking.create.appendPath(this.props.path).asJSON().withLocalTokenAuth("token").withBody(obj).withMethod(verb).go(this.props.afterSubmit);
  }
}

JSONForm.defaultProps = {
  path: "",
  create: true,
  update: false,
  afterSubmit: ((_) => {})
}

JSONForm.propTypes = {
  path: PropTypes.string,
  create: PropTypes.bool,
  update: PropTypes.bool,
  afterSubmit: PropTypes.func
}