import React from 'react';
import PropTypes from 'prop-types';
import TextField from './textfield';
import { API, APICollection } from 'app/api';
import Higher from './higher';

const propTypes = {
  headerComponent: PropTypes.func,
  component: PropTypes.func,
  api: PropTypes.instanceOf(APICollection).isRequired
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
    var Coll = Higher.asyncCollection(
      this.props.headerComponent,
      this.props.component,
      page => this.props.api.list(page, this.state.search)
    );
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