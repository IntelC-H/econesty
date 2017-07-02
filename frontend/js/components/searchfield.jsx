import React from 'react';
import PropTypes from 'prop-types';
import TextField from './textfield';
import API from 'app/api';
import CompAPI from './api';

const propTypes = {
  headerComponent: PropTypes.func,
  component: PropTypes.func,
  api: PropTypes.shape({
    create: PropTypes.func,
    read: PropTypes.func,
    update: PropTypes.func,
    delete: PropTypes.func,
    list: PropTypes.func,
    class_method: PropTypes.func,
    instance_method: PropTypes.func
  }).isRequired
}

const defaultProps = {
  label: "",
  headerComponent: null,
  component: null
}

class SearchField extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.state = { search: "" };
  }

  handleChange(tf) {
    this.setState({search: tf.state.value});
  }

  render() {
    const canSearch = (this.state.search || "").length > 0;
    var Coll = CompAPI.collection(this.props.api, 1, this.state.search, this.props.headerComponent, this.props.component)
    return (
      <div className="searchfield">
        <TextField label={"Search " + this.props.api.resource + "s"} onChange={this.handleChange} value={this.state.search} />
        {canSearch && <div className="searchfield-dropdown"><Coll /></div>}
      </div>
    );
  }
}

SearchField.propTypes = propTypes;
SearchField.defaultProps = defaultProps;

export default SearchField;