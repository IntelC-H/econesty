import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

const defaultProps = {
  onSubmit: ((_) => {})
}

const propTypes = {
  onSubmit: PropTypes.func
}

class ObjectForm extends React.Component {
  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
  }

  render() {
    return <form onSubmit={this.onSubmit}>{this.props.children}</form>;
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

    this.props.onSubmit(obj);
  }
}

ObjectForm.defaultProps = defaultProps;
ObjectForm.propTypes = propTypes;

export default ObjectForm;
