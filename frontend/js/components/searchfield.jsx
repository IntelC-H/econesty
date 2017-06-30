import React from 'react';
import PropTypes from 'prop-types';
import TextField from './textfield';
import API from 'app/api';
import APIComponent from './apicomponent';

const propTypes = {
  label: PropTypes.string,
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
    this.state = {
      search: ""
    }
  }

  handleChange(tf) {
    this.setState({search: tf.value});
  }

  render() {
    return (
      <div className="searchfield">
        <TextField label={this.props.label} onChange={this.handleChange} />
        {this.state.search.length > 0 && <div className="searchfield-dropdown">
          {this.props.headerComponent != null && React.createElement(this.props.headerComponent, { element: this }, null)}
          <APIComponent list search={this.state.search} api={this.props.api} component={this.props.component}/>
        </div>}
      </div>
    );
  }
}

SearchField.propTypes = propTypes;
SearchField.defaultProps = defaultProps;

export default SearchField;